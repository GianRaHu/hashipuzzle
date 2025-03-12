
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Home, BarChart3, Settings, HeartHandshake, Puzzle } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Navbar: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 md:top-0 md:bottom-auto bg-background/90 backdrop-blur-lg border-t md:border-b border-border/50 z-50 animate-fade-in touch-callout-none mobile-safe-area">
      <div className="container flex items-center justify-between px-4 py-3 max-w-4xl mx-auto">
        {/* Empty div to maintain spacing on desktop */}
        <div className="flex items-center"></div>
        
        <div className="flex items-center justify-around w-full md:w-auto md:space-x-6">
          <Link 
            to="/" 
            className={`flex flex-col md:flex-row items-center justify-center p-2 transition-all duration-200 ${
              isActive('/') ? 'text-primary' : 'text-foreground/70 hover:text-foreground'
            }`}
            aria-label="Home"
          >
            <Home className="h-6 w-6 md:h-5 md:w-5 md:mr-2" />
            <span className="text-xs mt-1 md:text-sm md:mt-0">Home</span>
          </Link>
          
          <Link 
            to="/daily" 
            className={`flex flex-col md:flex-row items-center justify-center p-2 transition-all duration-200 ${
              isActive('/daily') ? 'text-primary' : 'text-foreground/70 hover:text-foreground'
            }`}
            aria-label="Daily Challenge"
          >
            <Calendar className="h-6 w-6 md:h-5 md:w-5 md:mr-2" />
            <span className="text-xs mt-1 md:text-sm md:mt-0">Daily</span>
          </Link>
          
          <Link 
            to="/custom" 
            className={`flex flex-col md:flex-row items-center justify-center p-2 transition-all duration-200 ${
              isActive('/custom') ? 'text-primary' : 'text-foreground/70 hover:text-foreground'
            }`}
            aria-label="Custom Game"
          >
            <Puzzle className="h-6 w-6 md:h-5 md:w-5 md:mr-2" />
            <span className="text-xs mt-1 md:text-sm md:mt-0">Custom</span>
          </Link>
          
          <Link 
            to="/stats" 
            className={`flex flex-col md:flex-row items-center justify-center p-2 transition-all duration-200 ${
              isActive('/stats') ? 'text-primary' : 'text-foreground/70 hover:text-foreground'
            }`}
            aria-label="Statistics"
          >
            <BarChart3 className="h-6 w-6 md:h-5 md:w-5 md:mr-2" />
            <span className="text-xs mt-1 md:text-sm md:mt-0">Stats</span>
          </Link>
          
          <Link 
            to="/support" 
            className={`flex flex-col md:flex-row items-center justify-center p-2 transition-all duration-200 ${
              isActive('/support') ? 'text-primary' : 'text-foreground/70 hover:text-foreground'
            }`}
            aria-label="Support"
          >
            <HeartHandshake className="h-6 w-6 md:h-5 md:w-5 md:mr-2" />
            <span className="text-xs mt-1 md:text-sm md:mt-0">Support</span>
          </Link>
          
          <Link 
            to="/settings" 
            className={`flex flex-col md:flex-row items-center justify-center p-2 transition-all duration-200 ${
              isActive('/settings') ? 'text-primary' : 'text-foreground/70 hover:text-foreground'
            }`}
            aria-label="Settings"
          >
            <Settings className="h-6 w-6 md:h-5 md:w-5 md:mr-2" />
            <span className="text-xs mt-1 md:text-sm md:mt-0">Settings</span>
          </Link>
        </div>
        
        <div className="hidden md:block">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
