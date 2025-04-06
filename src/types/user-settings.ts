
// Type definition for user settings
export interface UserSettings {
  id: string;
  user_id: string;
  haptic_feedback: boolean;
  background_music: boolean;
  volume: number;
  show_timer?: boolean;
  show_best_time?: boolean;
  theme_mode?: 'light' | 'dark' | 'system';
  created_at: string;
  updated_at: string;
}

export type UserSettingsInsert = Omit<UserSettings, 'id' | 'created_at' | 'updated_at'>;
export type UserSettingsUpdate = Partial<UserSettingsInsert>;

// Create a function to validate the Supabase response
export function isUserSettings(obj: any): obj is UserSettings {
  return obj && 
    typeof obj.id === 'string' &&
    typeof obj.user_id === 'string' &&
    typeof obj.haptic_feedback === 'boolean' &&
    typeof obj.background_music === 'boolean' &&
    typeof obj.volume === 'number';
}
