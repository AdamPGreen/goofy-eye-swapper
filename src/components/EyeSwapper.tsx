
import { useState, useEffect, useRef } from "react";
import { Download, RefreshCw } from "lucide-react";
import { detectFaces, getEyePositions } from "../utils/faceDetection";
import { EyeStyle } from "./EyeStyleSelector";
import { toast } from "sonner";

interface EyeSwapperProps {
  sourceImage: HTMLImageElement | null;
  selectedEyeStyle: EyeStyle | null;
}

const EyeSwapper = ({ sourceImage, selectedEyeStyle }: EyeSwapperProps) => {
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [eyesDetected, setEyesDetected] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (sourceImage && selectedEyeStyle) {
      processImage();
    }
  }, [sourceImage, selectedEyeStyle]);
  
  const processImage = async () => {
    if (!sourceImage || !selectedEyeStyle || !canvasRef.current) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Detect faces in the image
      const detections = await detectFaces(sourceImage);
      
      if (detections.length === 0) {
        toast.error("No faces detected in the image");
        setEyesDetected(false);
        setLoading(false);
        return;
      }
      
      // Get eye positions
      const eyePositions = getEyePositions(detections);
      
      if (eyePositions.length === 0) {
        toast.error("No eyes detected in the image");
        setEyesDetected(false);
        setLoading(false);
        return;
      }
      
      setEyesDetected(true);
      
      // Create canvas with the same dimensions as the source image
      const canvas = canvasRef.current;
      canvas.width = sourceImage.width;
      canvas.height = sourceImage.height;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }
      
      // Draw the source image onto the canvas
      ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
      
      // Load eye images
      const leftEyeImg = new Image();
      const rightEyeImg = new Image();
      
      leftEyeImg.src = selectedEyeStyle.leftEye;
      rightEyeImg.src = selectedEyeStyle.rightEye;
      
      await Promise.all([
        new Promise((resolve) => { leftEyeImg.onload = resolve; }),
        new Promise((resolve) => { rightEyeImg.onload = resolve; })
      ]);
      
      // Draw the eye replacements
      eyePositions.forEach((position) => {
        const { leftEye, rightEye } = position;
        
        // Draw left eye
        ctx.drawImage(
          leftEyeImg,
          leftEye.x,
          leftEye.y,
          leftEye.width,
          leftEye.height
        );
        
        // Draw right eye
        ctx.drawImage(
          rightEyeImg,
          rightEye.x,
          rightEye.y,
          rightEye.width,
          rightEye.height
        );
      });
      
      // Convert canvas to data URL
      const processedUrl = canvas.toDataURL("image/jpeg");
      setProcessedImageUrl(processedUrl);
      
      toast.success("Eyes swapped successfully!");
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Failed to process image");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownload = () => {
    if (!processedImageUrl) return;
    
    const link = document.createElement("a");
    link.href = processedImageUrl;
    link.download = "eye-swapped-image.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Image downloaded!");
  };
  
  if (!sourceImage || !selectedEyeStyle) {
    return null;
  }
  
  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="rounded-xl overflow-hidden shadow-xl bg-white p-1 animate-fade-in">
        <canvas ref={canvasRef} className="hidden" />
        
        {loading ? (
          <div className="aspect-video flex flex-col items-center justify-center bg-secondary/30 rounded-lg">
            <div className="spinner mb-4"></div>
            <p className="text-muted-foreground">Processing image...</p>
          </div>
        ) : processedImageUrl ? (
          <div className="relative group">
            <img
              src={processedImageUrl}
              alt="Processed"
              className="w-full h-auto rounded-lg"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-end justify-center pb-4">
              <div className="flex space-x-2">
                <button
                  onClick={processImage}
                  className="bg-white/90 backdrop-blur-sm text-primary rounded-full p-2 hover:bg-white transition-colors"
                  title="Retry"
                >
                  <RefreshCw size={20} />
                </button>
                
                <button
                  onClick={handleDownload}
                  className="bg-primary text-white rounded-full p-2 hover:bg-primary/90 transition-colors"
                  title="Download"
                >
                  <Download size={20} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="aspect-video flex flex-col items-center justify-center bg-secondary/30 rounded-lg">
            <p className="text-muted-foreground">
              {eyesDetected ? "Processing image..." : "No eyes detected"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EyeSwapper;
