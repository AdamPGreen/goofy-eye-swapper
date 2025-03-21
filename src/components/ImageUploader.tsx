
import { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";

interface ImageUploaderProps {
  onImageUpload: (image: HTMLImageElement) => void;
}

const ImageUploader = ({ onImageUpload }: ImageUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };
  
  const handleFile = (file: File) => {
    // Check if file is an image
    if (!file.type.match("image.*")) {
      toast.error("Please select an image file");
      return;
    }
    
    setLoading(true);
    
    // Create file URL and load image
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && typeof e.target.result === "string") {
        setPreviewUrl(e.target.result);
        
        // Create image element
        const img = new Image();
        img.onload = () => {
          onImageUpload(img);
          setLoading(false);
        };
        img.onerror = () => {
          toast.error("Failed to load image");
          setLoading(false);
          setPreviewUrl(null);
        };
        img.src = e.target.result;
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };
  
  const handleButtonClick = () => {
    inputRef.current?.click();
  };
  
  const handleRemoveImage = () => {
    setPreviewUrl(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };
  
  return (
    <div className="w-full max-w-xl mx-auto">
      <div 
        className={`
          drop-zone rounded-2xl p-8 text-center
          ${dragActive ? "active" : ""}
          ${previewUrl ? "bg-secondary/50" : "bg-white"}
          transition-all duration-300 animate-fade-in
        `}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <div className="spinner mb-4"></div>
            <p className="text-muted-foreground">Processing image...</p>
          </div>
        ) : previewUrl ? (
          <div className="relative overflow-hidden rounded-xl">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-full h-auto max-h-[400px] object-contain rounded-xl animate-scale-in"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-md hover:bg-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-secondary/70 flex items-center justify-center mb-4 animate-pulse-light">
              <UploadCloud size={30} className="text-primary/70" />
            </div>
            <h3 className="text-lg font-medium mb-2">Upload an image</h3>
            <p className="text-muted-foreground text-sm mb-4 max-w-md">
              Drag and drop your image here, or click the button below to select a file
            </p>
            <button
              type="button"
              onClick={handleButtonClick}
              className="btn-primary rounded-full px-6 py-2 flex items-center space-x-2"
            >
              <ImageIcon size={18} />
              <span>Select Image</span>
            </button>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
};

export default ImageUploader;
