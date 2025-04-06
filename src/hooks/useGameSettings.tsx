
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserSettings } from '@/types/user-settings';
import audioManager from '../utils/audio';

export const useGameSettings = () => {
  const [settings, setSettings] = useState({
    hapticFeedback: true,
    backgroundMusic: false,
    showTimer: true,
    showBestTime: true,
    volume: 50
  });
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (user?.user) {
          // Fetch user settings from supabase
          const { data: userSettings, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', user.user.id)
            .single();
          
          if (userSettings && !error) {
            // Cast the result to UserSettings type
            const settings = userSettings as unknown as UserSettings;
            
            setSettings({
              hapticFeedback: settings.haptic_feedback || true,
              backgroundMusic: settings.background_music || false,
              showTimer: settings.show_timer ?? true,
              showBestTime: settings.show_best_time ?? true,
              volume: settings.volume || 50
            });
            
            // Toggle background music if it's enabled in settings
            audioManager.toggle(settings.background_music || false);
            if (settings.background_music) {
              audioManager.setVolume(settings.volume / 100 || 0.5);
            }
          }
        } else {
          // If no user is logged in, check localStorage for settings
          const storedSettings = localStorage.getItem('gameSettings');
          if (storedSettings) {
            const parsedSettings = JSON.parse(storedSettings);
            setSettings(parsedSettings);
            
            // Toggle background music if it's enabled in settings
            audioManager.toggle(parsedSettings.backgroundMusic || false);
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };
    
    fetchSettings();
    
    // Cleanup function to pause background music when component unmounts
    return () => {
      audioManager.pause();
    };
  }, []);

  return settings;
};
