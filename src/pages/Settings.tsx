import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Vibrate, Palette } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { isHapticFeedbackAvailable } from '@/utils/haptics';
import audioManager from '@/utils/audio';
import { loadUserSettings, saveUserSettings } from '@/utils/userSettings';
import AccountTab from '@/components/settings/AccountTab';
import GameTab from '@/components/settings/GameTab';
import ThemeTab from '@/components/settings/ThemeTab';
import ThemeToggle from '@/components/ThemeToggle';

const Settings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [settings, setSettings] = useState({
    hapticFeedback: true,
    backgroundMusic: false,
    volume: 50,
    showTimer: true,
    showBestTime: true,
    themeMode: 'system' as 'light' | 'dark' | 'system'
  });
  
  // Load user and settings
  useEffect(() => {
    const fetchUserAndSettings = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: userData } = await supabase.auth.getUser();
        setUser(userData?.user || null);
        
        // Load settings using the abstracted function
        const userSettings = await loadUserSettings();
        
        setSettings({
          hapticFeedback: userSettings.hapticFeedback ?? true,
          backgroundMusic: userSettings.backgroundMusic ?? false,
          volume: userSettings.volume ?? 50,
          showTimer: userSettings.showTimer ?? true,
          showBestTime: userSettings.showBestTime ?? true,
          themeMode: userSettings.themeMode ?? 'system'
        });
        
        // Apply the settings
        if (userSettings.backgroundMusic) {
          audioManager.toggle(true);
          audioManager.setVolume(userSettings.volume / 100 || 0.5);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user or settings:", error);
        setLoading(false);
      }
    };
    
    fetchUserAndSettings();
  }, []);
  
  // Handle haptic feedback setting change
  const toggleHapticFeedback = () => {
    const newSettings = {
      ...settings,
      hapticFeedback: !settings.hapticFeedback
    };
    
    setSettings(newSettings);
    saveSettings(newSettings);
  };
  
  // Handle timer visibility setting change
  const toggleShowTimer = () => {
    const newSettings = {
      ...settings,
      showTimer: !settings.showTimer
    };
    
    setSettings(newSettings);
    saveSettings(newSettings);
  };
  
  // Handle best time visibility setting change
  const toggleShowBestTime = () => {
    const newSettings = {
      ...settings,
      showBestTime: !settings.showBestTime
    };
    
    setSettings(newSettings);
    saveSettings(newSettings);
  };
  
  // Handle background music setting change
  const toggleBackgroundMusic = () => {
    const newSettings = {
      ...settings,
      backgroundMusic: !settings.backgroundMusic
    };
    
    // Update the audio player state
    audioManager.toggle(newSettings.backgroundMusic);
    
    setSettings(newSettings);
    saveSettings(newSettings);
  };
  
  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    
    const newSettings = {
      ...settings,
      volume: newVolume
    };
    
    // Update volume in real-time
    audioManager.setVolume(newVolume / 100);
    
    setSettings(newSettings);
    saveSettings(newSettings);
  };
  
  // Handle theme change
  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    const newSettings = {
      ...settings,
      themeMode: theme
    };
    
    setSettings(newSettings);
    saveSettings(newSettings);
    
    // Apply theme change
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
      localStorage.removeItem('theme');
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark');
      localStorage.setItem('theme', theme);
    }
  };
  
  // Save settings
  const saveSettings = async (newSettings: typeof settings) => {
    try {
      // Use the abstracted function to save settings
      const success = await saveUserSettings(newSettings);
      
      if (success) {
        // Show success message
        toast({
          title: "Settings saved",
          description: "Your preferences have been updated.",
          duration: 2000,
        });
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error saving settings",
        description: "There was a problem saving your preferences.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };
  
  return (
    <div className="content-container max-w-2xl animate-fade-in page-transition">
      <h1 className="text-2xl font-semibold mb-4">Settings</h1>
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="account">
            <User className="w-4 h-4 mr-2" /> Account
          </TabsTrigger>
          <TabsTrigger value="game">
            <Vibrate className="w-4 h-4 mr-2" /> Game
          </TabsTrigger>
          <TabsTrigger value="theme">
            <Palette className="w-4 h-4 mr-2" /> Theme
          </TabsTrigger>
        </TabsList>
        
        {/* Account Tab Content */}
        <TabsContent value="account" className="space-y-4">
          <AccountTab user={user} loading={loading} />
        </TabsContent>
        
        {/* Game Tab Content */}
        <TabsContent value="game" className="space-y-4">
          <GameTab 
            settings={settings}
            toggleHapticFeedback={toggleHapticFeedback}
            toggleShowTimer={toggleShowTimer}
            toggleShowBestTime={toggleShowBestTime}
            toggleBackgroundMusic={toggleBackgroundMusic}
            handleVolumeChange={handleVolumeChange}
          />
        </TabsContent>
        
        {/* Theme Tab Content (renamed from Appearance) */}
        <TabsContent value="theme" className="space-y-4">
          <ThemeTab 
            settings={settings}
            handleThemeChange={handleThemeChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
