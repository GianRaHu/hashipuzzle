import React from 'react';

interface EnhancedLoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  progress?: number;
}

const EnhancedLoadingSpinner: React.FC<EnhancedLoadingSpinnerProps> = ({ 
  size = 'md', 
  message = 'Loading...',
  progress 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Animated spinner */}
      <div className="relative">
        <div 
          className={`${sizeClasses[size]} border-4 border-primary/20 border-t-primary rounded-full animate-spin`}
        />
        
        {/* Inner glow effect */}
        <div 
          className={`absolute inset-0 ${sizeClasses[size]} border-2 border-transparent border-t-primaryGlow rounded-full animate-spin`}
          style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}
        />
      </div>
      
      {/* Progress bar */}
      {progress !== undefined && (
        <div className="w-48 h-2 bg-accent rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primaryGlow transition-all duration-300 ease-out"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>
      )}
      
      {/* Loading message */}
      <p className="text-sm text-muted-foreground animate-pulse-subtle">
        {message}
      </p>
      
      {/* Progress percentage */}
      {progress !== undefined && (
        <span className="text-xs text-primary font-medium">
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
};

export default EnhancedLoadingSpinner;