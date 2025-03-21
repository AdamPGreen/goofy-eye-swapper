
import { useState, useEffect } from "react";
import { BarChart, BookOpen, Image as ImageIcon } from "lucide-react";
import { loadModels } from "../utils/faceDetection";
import { toast } from "sonner";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ImageUploader from "../components/ImageUploader";
import EyeStyleSelector, { EyeStyle, eyeStyles } from "../components/EyeStyleSelector";
import EyeSwapper from "../components/EyeSwapper";

const Index = () => {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [selectedEyeStyle, setSelectedEyeStyle] = useState<EyeStyle>(eyeStyles[0]);
  
  // Load face detection models on mount
  useEffect(() => {
    const initModels = async () => {
      try {
        // Create models directory structure in public folder
        const result = await loadModels();
        if (result) {
          setModelsLoaded(true);
          toast.success("Ready to swap some eyes!");
        } else {
          toast.error("Failed to load face detection models. Please refresh the page.");
        }
      } catch (error) {
        console.error("Error initializing models:", error);
        toast.error("Failed to initialize. Please refresh the page.");
      }
    };
    
    initModels();
  }, []);
  
  const handleImageUpload = (image: HTMLImageElement) => {
    setSourceImage(image);
  };
  
  const handleSelectEyeStyle = (style: EyeStyle) => {
    setSelectedEyeStyle(style);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-10">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto animate-fade-in">
              <div className="inline-block bg-secondary/70 rounded-full px-4 py-1 text-sm font-medium text-primary mb-4">
                Transform Your Photos
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Swap Eyes With Just A Click
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Upload any photo and instantly replace the eyes with fun alternatives. Choose from googly eyes, anime eyes, and more!
              </p>
            </div>
          </div>
        </section>
        
        {/* Main App Section */}
        <section className="py-10">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="grid gap-10">
              {/* Upload Section */}
              <div className="glass-panel rounded-2xl p-6 md:p-8">
                <h2 className="text-2xl font-semibold mb-6 text-center">Upload Your Image</h2>
                <ImageUploader onImageUpload={handleImageUpload} />
              </div>
              
              {/* Eye Style Selector */}
              <div className={`glass-panel rounded-2xl p-6 md:p-8 transition-opacity duration-300 ${sourceImage ? 'opacity-100' : 'opacity-50'}`}>
                <h2 className="text-2xl font-semibold mb-6 text-center">Select Eye Style</h2>
                <EyeStyleSelector 
                  onSelectStyle={handleSelectEyeStyle} 
                  disabled={!sourceImage}
                />
              </div>
              
              {/* Result Section */}
              {sourceImage && selectedEyeStyle && (
                <div className="glass-panel rounded-2xl p-6 md:p-8 animate-slide-up">
                  <h2 className="text-2xl font-semibold mb-6 text-center">Your Eye-Swapped Image</h2>
                  <EyeSwapper 
                    sourceImage={sourceImage} 
                    selectedEyeStyle={selectedEyeStyle}
                  />
                </div>
              )}
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-secondary/30">
          <div className="container max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <ImageIcon className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Easy Photo Upload</h3>
                <p className="text-muted-foreground">
                  Simply drag and drop or select any photo to get started. Works with all common image formats.
                </p>
              </div>
              
              {/* Feature 2 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <BookOpen className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Multiple Eye Styles</h3>
                <p className="text-muted-foreground">
                  Choose from a variety of eye styles including googly eyes, anime eyes, cartoon eyes, and more.
                </p>
              </div>
              
              {/* Feature 3 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Advanced Detection</h3>
                <p className="text-muted-foreground">
                  Our app uses advanced facial recognition to precisely locate and replace eyes in any photo.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* About Section */}
        <section id="about" className="py-16 md:py-24">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">About Eye Swapper</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Eye Swapper was created to bring a bit of fun and creativity to your photos. 
                Whether you want to create humorous images for social media or just have fun with friends, 
                our tool makes it easy to transform ordinary photos into eye-catching creations.
              </p>
              <p className="text-muted-foreground">
                The application uses advanced facial recognition technology to accurately 
                detect and replace eyes in any photo. All processing happens directly in your browser, 
                so your photos are never uploaded to any server.
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
