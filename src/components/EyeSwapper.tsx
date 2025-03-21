
import { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Save, Share, Download } from "lucide-react";
import { EyeStyle } from './EyeStyleSelector';

interface EyeSwapperProps {
  sourceImage: HTMLImageElement;
  selectedEyeStyle: EyeStyle;
}

const EyeSwapper = ({ sourceImage, selectedEyeStyle }: EyeSwapperProps) => {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resultCanvasRef = useRef<HTMLCanvasElement>(null);
  const [faces, setFaces] = useState<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }, faceapi.FaceLandmarks68>[]>([]);
  const [processing, setProcessing] = useState(true);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const detectFaces = async () => {
      try {
        setProcessing(true);
        
        if (!canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const displaySize = { width: sourceImage.width, height: sourceImage.height };
        faceapi.matchDimensions(canvas, displaySize);
        
        const detections = await faceapi.detectAllFaces(sourceImage)
          .withFaceLandmarks();
          
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        setFaces(resizedDetections);
        
        drawResult();
      } catch (error) {
        console.error('Error detecting faces:', error);
        toast.error('Failed to detect faces in the image');
      } finally {
        setProcessing(false);
      }
    };
    
    if (sourceImage) {
      detectFaces();
    }
  }, [sourceImage]);
  
  useEffect(() => {
    if (faces.length > 0) {
      drawResult();
    }
  }, [faces, selectedEyeStyle]);
  
  const drawResult = async () => {
    if (!resultCanvasRef.current || faces.length === 0) return;
    
    const canvas = resultCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match source image
    canvas.width = sourceImage.width;
    canvas.height = sourceImage.height;
    
    // Draw the original image
    ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
    
    try {
      // Load the eye images
      const leftEyeImg = new Image();
      const rightEyeImg = new Image();
      
      leftEyeImg.src = `/eyes/${selectedEyeStyle.id}-left.png`;
      rightEyeImg.src = `/eyes/${selectedEyeStyle.id}-right.png`;
      
      await Promise.all([
        new Promise<void>((resolve, reject) => {
          leftEyeImg.onload = () => resolve();
          leftEyeImg.onerror = () => reject(new Error(`Failed to load left eye image: ${leftEyeImg.src}`));
        }),
        new Promise<void>((resolve, reject) => {
          rightEyeImg.onload = () => resolve();
          rightEyeImg.onerror = () => reject(new Error(`Failed to load right eye image: ${rightEyeImg.src}`));
        })
      ]);
      
      // Process each detected face
      faces.forEach(face => {
        const landmarks = face.landmarks;
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();
        
        // Calculate eye dimensions and positions
        const leftEyeRect = calculateEyeRect(leftEye);
        const rightEyeRect = calculateEyeRect(rightEye);
        
        // Apply eye images
        ctx.drawImage(
          leftEyeImg, 
          leftEyeRect.x, 
          leftEyeRect.y, 
          leftEyeRect.width, 
          leftEyeRect.height
        );
        
        ctx.drawImage(
          rightEyeImg, 
          rightEyeRect.x, 
          rightEyeRect.y, 
          rightEyeRect.width, 
          rightEyeRect.height
        );
      });
      
      // Store the processed image URL
      setProcessedImageUrl(canvas.toDataURL('image/png'));
    } catch (error) {
      console.error('Error applying eye style:', error);
      toast.error('Failed to apply eye style. Please try again.');
    }
  };
  
  const calculateEyeRect = (eyePoints: faceapi.Point[]) => {
    // Find the bounding box of eye points
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    eyePoints.forEach(point => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });
    
    // Add padding for better fit
    const width = maxX - minX;
    const height = maxY - minY;
    const paddingX = width * 0.5;
    const paddingY = height * 0.5;
    
    return {
      x: minX - paddingX,
      y: minY - paddingY,
      width: width + paddingX * 2,
      height: height + paddingY * 2
    };
  };
  
  const handleSave = async () => {
    if (!user) {
      toast.error("Please log in to save your eye swap");
      return;
    }
    
    setSaveDialogOpen(true);
  };
  
  const handleConfirmSave = async () => {
    try {
      setSaving(true);
      
      if (!processedImageUrl || !user) {
        throw new Error("Missing processed image or user");
      }
      
      // Convert data URL to File
      const response = await fetch(processedImageUrl);
      const blob = await response.blob();
      const file = new File([blob], `eye-swap-${Date.now()}.png`, { type: 'image/png' });
      
      // Upload to Supabase Storage
      const filePath = `${user.id}/${Date.now()}.png`;
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('eye_swap_images')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL for the uploaded file
      const { data: publicUrlData } = supabase
        .storage
        .from('eye_swap_images')
        .getPublicUrl(filePath);
        
      const publicUrl = publicUrlData.publicUrl;
      
      // Save metadata to database
      const { error: insertError } = await supabase
        .from('eye_swaps')
        .insert({
          user_id: user.id,
          title: title.trim() || null,
          image_path: publicUrl,
          eye_style: selectedEyeStyle.id
        });
        
      if (insertError) throw insertError;
      
      toast.success("Eye swap saved successfully!");
      setSaveDialogOpen(false);
    } catch (error) {
      console.error("Error saving eye swap:", error);
      toast.error("Failed to save eye swap");
    } finally {
      setSaving(false);
    }
  };
  
  const handleDownload = () => {
    if (!processedImageUrl) return;
    
    const link = document.createElement('a');
    link.href = processedImageUrl;
    link.download = `eye-swap-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleShare = async () => {
    try {
      if (!processedImageUrl) return;
      
      // Convert data URL to File
      const response = await fetch(processedImageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'eye-swap.png', { type: 'image/png' });
      
      // Check if Web Share API is supported
      if (navigator.share) {
        await navigator.share({
          title: 'My Eye Swap',
          files: [file]
        });
      } else {
        toast.error("Sharing is not supported in your browser");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      if (error instanceof Error && error.name !== 'AbortError') {
        toast.error("Failed to share image");
      }
    }
  };
  
  return (
    <div className="flex flex-col items-center">
      {/* Hidden canvas for face detection */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* Result canvas */}
      <div className="relative w-full max-w-lg mx-auto mb-6">
        {processing && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <Loader2 className="animate-spin" size={48} />
          </div>
        )}
        <canvas 
          ref={resultCanvasRef} 
          className="w-full object-contain rounded-lg border shadow-md"
        />
      </div>
      
      {!processing && faces.length === 0 && (
        <div className="text-center mb-6 p-4 bg-destructive/10 rounded-lg">
          <p className="text-destructive font-medium">No faces detected in the image.</p>
          <p className="text-sm text-muted-foreground mt-1">Please try uploading a different image with clearly visible faces.</p>
        </div>
      )}
      
      {!processing && faces.length > 0 && (
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <Button
            onClick={handleSave}
            className="flex items-center gap-2"
            disabled={!processedImageUrl}
          >
            <Save size={16} />
            Save
          </Button>
          
          <Button
            onClick={handleDownload}
            variant="outline"
            className="flex items-center gap-2"
            disabled={!processedImageUrl}
          >
            <Download size={16} />
            Download
          </Button>
          
          <Button
            onClick={handleShare}
            variant="outline"
            className="flex items-center gap-2"
            disabled={!processedImageUrl || !navigator.canShare}
          >
            <Share size={16} />
            Share
          </Button>
        </div>
      )}
      
      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Your Eye Swap</DialogTitle>
            <DialogDescription>
              Give your creation a name to help you find it later
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title (optional)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My awesome eye swap"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSave} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EyeSwapper;
