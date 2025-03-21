
import { useState, useEffect } from "react";
import { Check } from "lucide-react";

export type EyeStyle = {
  id: string;
  name: string;
  leftEye: string;
  rightEye: string;
};

// Sample eye styles
const eyeStyles: EyeStyle[] = [
  {
    id: "googly",
    name: "Googly Eyes",
    leftEye: "/eyes/googly-left.png",
    rightEye: "/eyes/googly-right.png"
  },
  {
    id: "anime",
    name: "Anime Eyes",
    leftEye: "/eyes/anime-left.png",
    rightEye: "/eyes/anime-right.png"
  },
  {
    id: "cartoon",
    name: "Cartoon Eyes",
    leftEye: "/eyes/cartoon-left.png",
    rightEye: "/eyes/cartoon-right.png"
  },
  {
    id: "rick",
    name: "Rick and Morty",
    leftEye: "/eyes/rick-left.png",
    rightEye: "/eyes/rick-right.png"
  },
  {
    id: "simpsons",
    name: "Simpsons Eyes",
    leftEye: "/eyes/simpsons-left.png",
    rightEye: "/eyes/simpsons-right.png"
  }
];

interface EyeStyleSelectorProps {
  onSelectStyle: (style: EyeStyle) => void;
  disabled?: boolean;
}

const EyeStyleSelector = ({ onSelectStyle, disabled = false }: EyeStyleSelectorProps) => {
  const [selectedStyle, setSelectedStyle] = useState<string>(eyeStyles[0].id);
  const [preloadedImages, setPreloadedImages] = useState<boolean>(false);
  
  // Preload all eye style images
  useEffect(() => {
    const preloadImages = async () => {
      try {
        const imagePromises = eyeStyles.flatMap(style => [
          new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = style.leftEye;
          }),
          new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = style.rightEye;
          })
        ]);
        
        await Promise.all(imagePromises);
        setPreloadedImages(true);
      } catch (error) {
        console.error("Failed to preload some eye images", error);
        // Continue anyway, as some images might have loaded
        setPreloadedImages(true);
      }
    };
    
    preloadImages();
  }, []);
  
  const handleSelect = (styleId: string) => {
    if (disabled) return;
    
    setSelectedStyle(styleId);
    const style = eyeStyles.find(s => s.id === styleId);
    if (style) {
      onSelectStyle(style);
    }
  };
  
  return (
    <div className="w-full">
      <h3 className="text-lg font-medium mb-4">Choose Eye Style</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {eyeStyles.map((style) => (
          <div
            key={style.id}
            onClick={() => handleSelect(style.id)}
            className={`
              eye-option relative rounded-xl p-3 text-center
              ${selectedStyle === style.id ? 'ring-2 ring-primary bg-secondary/50' : 'bg-white'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-secondary/30'}
              transition-all duration-200
            `}
          >
            <div className="aspect-square flex items-center justify-center mb-2 bg-white/70 rounded-lg p-2">
              <img
                src={style.leftEye}
                alt={`${style.name} left eye`}
                className="w-12 h-12 object-contain"
                style={{ opacity: preloadedImages ? 1 : 0 }}
              />
            </div>
            <p className="text-sm font-medium truncate">{style.name}</p>
            
            {selectedStyle === style.id && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <Check size={12} className="text-white" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EyeStyleSelector;
export { eyeStyles };
