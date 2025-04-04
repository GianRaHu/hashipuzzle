
// Temporary type definition for user settings until Supabase types get refreshed
export interface UserSettings {
  id: string;
  user_id: string;
  haptic_feedback: boolean;
  background_music: boolean;
  volume: number;
  created_at: string;
  updated_at: string;
}

export type UserSettingsInsert = Omit<UserSettings, 'id' | 'created_at' | 'updated_at'>;
export type UserSettingsUpdate = Partial<UserSettingsInsert>;
