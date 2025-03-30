
import React, { useEffect, useState } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSettings, saveSettings } from '@/utils/storage';

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  // Initialize theme from localStorage
  useEffect(() => {
    const settings = getSettings();
    const savedTheme = settings.themePreference || 'system';
    setTheme(savedTheme);
    
    // Apply the theme
    applyTheme(savedTheme);
    
    // Add listener for system preference changes if using 'system' setting
    if (savedTheme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        document.documentElement.classList.toggle('dark', mediaQuery.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);
  
  // Apply theme based on preference
  const applyTheme = (preference: 'light' | 'dark' | 'system') => {
    if (preference === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    } else {
      document.documentElement.classList.toggle('dark', preference === 'dark');
    }
  };

  // Cycle through themes: light -> system -> dark -> light
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'system' : theme === 'system' ? 'dark' : 'light';
    
    // Update state and storage
    setTheme(newTheme);
    
    // Get current settings and update theme preference
    const settings = getSettings();
    settings.themePreference = newTheme;
    settings.darkMode = newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    // Save settings and apply theme
    saveSettings(settings);
    applyTheme(newTheme);
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      className="rounded-full w-10 h-10 transition-all duration-300"
      aria-label={`Switch theme (current: ${theme})`}
    >
      {theme === 'light' ? (
        <Sun className="h-5 w-5 transition-all" />
      ) : theme === 'dark' ? (
        <Moon className="h-5 w-5 transition-all" />
      ) : (
        <Monitor className="h-5 w-5 transition-all" />
      )}
    </Button>
  );
};

export default ThemeToggle;
