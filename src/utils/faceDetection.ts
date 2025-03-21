
import * as faceapi from 'face-api.js';

// Constants for model paths
const LOCAL_MODEL_URL = '/models';
const CDN_MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';

/**
 * Creates the models directory structure if it doesn't exist
 * This is a client-side function that checks for model availability
 */
const ensureModelsDirectory = async (): Promise<void> => {
  console.log("Checking for models directory...");
  
  try {
    // Try to fetch a test file to check if the models directory exists
    const response = await fetch(`${LOCAL_MODEL_URL}/tiny_face_detector_model-weights_manifest.json`, { method: 'HEAD' });
    if (!response.ok) {
      console.log("Models directory check failed, will use CDN models");
    } else {
      console.log("Models directory exists");
    }
  } catch (error) {
    console.log("Models directory check failed with error, will use CDN models", error);
  }
};

/**
 * Loads the face detection models with improved fallback logic.
 * Attempts to load from CDN if local loading fails.
 */
export const loadModels = async (): Promise<boolean> => {
  try {
    console.log("Loading face detection models...");
    
    // First check if local models directory exists
    await ensureModelsDirectory();
    
    // Load SSD Mobilenet model - it provides more reliable face detection than TinyFaceDetector
    try {
      // Try loading from local path first
      await faceapi.nets.ssdMobilenetv1.loadFromUri(LOCAL_MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(LOCAL_MODEL_URL);
      console.log("Successfully loaded models from local path");
      return true;
    } catch (localError) {
      console.warn("Failed to load models from local path, trying CDN fallback...", localError);
      
      // Fallback to CDN
      await faceapi.nets.ssdMobilenetv1.loadFromUri(CDN_MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(CDN_MODEL_URL);
      console.log("Successfully loaded models from CDN");
      return true;
    }
  } catch (error) {
    console.error("Error loading face detection models:", error);
    return false;
  }
};

// Detect faces and landmarks in an image
export const detectFaces = async (image: HTMLImageElement) => {
  try {
    // Use SSD Mobilenet model for detection instead of TinyFaceDetector
    const detections = await faceapi.detectAllFaces(
      image,
      new faceapi.SsdMobilenetv1Options()
    ).withFaceLandmarks();
    
    return detections;
  } catch (error) {
    console.error("Error detecting faces:", error);
    return [];
  }
};

// Extract eye positions from facial landmarks
export const getEyePositions = (detections: faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }, faceapi.FaceLandmarks68>[]) => {
  return detections.map(detection => {
    const landmarks = detection.landmarks;
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    
    // Calculate eye dimensions
    const leftEyeBox = {
      x: Math.min(...leftEye.map(point => point.x)),
      y: Math.min(...leftEye.map(point => point.y)),
      width: Math.max(...leftEye.map(point => point.x)) - Math.min(...leftEye.map(point => point.x)),
      height: Math.max(...leftEye.map(point => point.y)) - Math.min(...leftEye.map(point => point.y))
    };
    
    const rightEyeBox = {
      x: Math.min(...rightEye.map(point => point.x)),
      y: Math.min(...rightEye.map(point => point.y)),
      width: Math.max(...rightEye.map(point => point.x)) - Math.min(...rightEye.map(point => point.x)),
      height: Math.max(...rightEye.map(point => point.y)) - Math.min(...rightEye.map(point => point.y))
    };
    
    // Expand the eye boxes slightly for better coverage
    const expandFactor = 1.5;
    
    leftEyeBox.x -= (leftEyeBox.width * (expandFactor - 1)) / 2;
    leftEyeBox.y -= (leftEyeBox.height * (expandFactor - 1)) / 2;
    leftEyeBox.width *= expandFactor;
    leftEyeBox.height *= expandFactor;
    
    rightEyeBox.x -= (rightEyeBox.width * (expandFactor - 1)) / 2;
    rightEyeBox.y -= (rightEyeBox.height * (expandFactor - 1)) / 2;
    rightEyeBox.width *= expandFactor;
    rightEyeBox.height *= expandFactor;
    
    return {
      leftEye: leftEyeBox,
      rightEye: rightEyeBox
    };
  });
};
