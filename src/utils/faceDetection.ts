
import * as faceapi from 'face-api.js';

// Constants for model paths
const LOCAL_MODEL_URL = '/models';
// Updated CDN URL to a more reliable source
const CDN_MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

/**
 * Loads the face detection models with reliable CDN fallback
 */
export const loadModels = async (): Promise<boolean> => {
  try {
    console.log("Loading face detection models...");
    
    try {
      // Try loading from local path first
      console.log("Attempting to load models from local path:", LOCAL_MODEL_URL);
      await faceapi.nets.ssdMobilenetv1.loadFromUri(LOCAL_MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(LOCAL_MODEL_URL);
      console.log("Successfully loaded models from local path");
      return true;
    } catch (localError) {
      console.warn("Failed to load models from local path, using CDN fallback:", localError);
      
      // Fallback to CDN
      console.log("Attempting to load models from CDN:", CDN_MODEL_URL);
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
    // Use SSD Mobilenet model for detection
    const detections = await faceapi.detectAllFaces(
      image,
      new faceapi.SsdMobilenetv1Options()
    ).withFaceLandmarks();
    
    console.log("Face detection completed, found:", detections.length, "faces");
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
    const expandFactor = 1.7; // Increased to cover more eye area
    
    leftEyeBox.x -= (leftEyeBox.width * (expandFactor - 1)) / 2;
    leftEyeBox.y -= (leftEyeBox.height * (expandFactor - 1)) / 2;
    leftEyeBox.width *= expandFactor;
    leftEyeBox.height *= expandFactor;
    
    rightEyeBox.x -= (rightEyeBox.width * (expandFactor - 1)) / 2;
    rightEyeBox.y -= (rightEyeBox.height * (expandFactor - 1)) / 2;
    rightEyeBox.width *= expandFactor;
    rightEyeBox.height *= expandFactor;
    
    console.log("Eye positions calculated:", { leftEye: leftEyeBox, rightEye: rightEyeBox });
    return {
      leftEye: leftEyeBox,
      rightEye: rightEyeBox
    };
  });
};
