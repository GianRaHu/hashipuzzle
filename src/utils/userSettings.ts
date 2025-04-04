import { supabase } from '@/integrations/supabase/client';
import { UserSettings, UserSettingsInsert } from '@/types/user-settings';

// Default settings
export const defaultSettings = {
  hapticFeedback: true,
  backgroundMusic: false,
  volume: 50
};

// Convert from DB format to app format
export const formatSettingsFromDb = (dbSettings: UserSettings) => {
  return {
    hapticFeedback: dbSettings.haptic_feedback,
    backgroundMusic: dbSettings.background_music,
    volume: dbSettings.volume || 50
  };
};

// Convert from app format to DB format
export const formatSettingsForDb = (settings: any, userId: string): UserSettingsInsert => {
  return {
    user_id: userId,
    haptic_feedback: settings.hapticFeedback,
    background_music: settings.backgroundMusic,
    volume: settings.volume || 50
  };
};

// Load user settings from Supabase or localStorage
export const loadUserSettings = async () => {
  try {
    // Check if user is logged in
    const { data: userData } = await supabase.auth.getUser();
    
    if (userData?.user) {
      // Get user settings from Supabase
      const { data: userSettingsData, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userData.user.id)
        .single();
      
      if (userSettingsData && !error) {
        // Cast to our temporary type and format for the application
        const userSettings = userSettingsData as unknown as UserSettings;
        return formatSettingsFromDb(userSettings);
      }
    }
    
    // Otherwise check localStorage
    const localSettings = localStorage.getItem('gameSettings');
    if (localSettings) {
      return JSON.parse(localSettings);
    }
    
    // Return default settings if nothing found
    return defaultSettings;
  } catch (error) {
    console.error("Error loading user settings:", error);
    return defaultSettings;
  }
};

// Save user settings to Supabase and localStorage
export const saveUserSettings = async (settings: any) => {
  try {
    // Always save to localStorage
    localStorage.setItem('gameSettings', JSON.stringify(settings));
    
    // If user is logged in, save to Supabase
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      const settingsToUpsert = formatSettingsForDb(settings, userData.user.id);
      
      await supabase
        .from('user_settings')
        .upsert(settingsToUpsert);
    }
    
    return true;
  } catch (error) {
    console.error("Error saving user settings:", error);
    return false;
  }
};
