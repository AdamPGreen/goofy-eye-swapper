import * as faceapi from 'face-api.js';

// Initialize models path
const MODEL_URL = '/models';

/**
 * Loads the face detection models.
 * Attempts to load from CDN if local loading fails.
 */
export const loadModels = async (): Promise<boolean> => {
  try {
    console.log("Loading models...");
    
    // First try to load from local models directory
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      console.log("Successfully loaded models from local path");
      return true;
    } catch (localError) {
      console.warn("Failed to load models locally, trying CDN fallback...", localError);
      
      // Fallback to CDN if local loading fails
      await faceapi.nets.tinyFaceDetector.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models');
      console.log("Successfully loaded models from CDN");
      return true;
    }
  } catch (error) {
    console.error("Failed to load models:", error);
    return false;
  }
};

// Detect faces and landmarks in an image
export const detectFaces = async (image: HTMLImageElement) => {
  try {
    const detections = await faceapi.detectAllFaces(
      image, 
      new faceapi.TinyFaceDetectorOptions()
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
