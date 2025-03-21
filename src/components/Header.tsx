
import { ChevronsDown } from "lucide-react";
import { useEffect, useState } from "react";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? "py-4 bg-white/80 backdrop-blur-md shadow-sm" 
        : "py-6 bg-transparent"
    }`}>
      <div className="container max-w-6xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="4"/>
              <line x1="12" y1="2" x2="12" y2="4"/>
              <line x1="12" y1="20" x2="12" y2="22"/>
              <line x1="4" y1="12" x2="2" y2="12"/>
              <line x1="22" y1="12" x2="20" y2="12"/>
            </svg>
          </div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
            Eye Swapper
          </h1>
        </div>
        
        <div className="hidden md:flex items-center space-x-1">
          <a 
            href="#about" 
            className="px-4 py-2 rounded-full text-sm font-medium transition-colors hover:bg-secondary"
          >
            About
          </a>
          <a 
            href="#features" 
            className="px-4 py-2 rounded-full text-sm font-medium transition-colors hover:bg-secondary"
          >
            Features
          </a>
        </div>
      </div>
      
      {!scrolled && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce hidden md:block">
          <ChevronsDown className="text-muted-foreground" size={20} />
        </div>
      )}
    </header>
  );
};

export default Header;
