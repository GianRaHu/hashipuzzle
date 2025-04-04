import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Music, Vibrate } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { isHapticFeedbackAvailable } from '@/utils/haptics';
import audioManager from '@/utils/audio';
import StatsResetDialog from '@/components/StatsResetDialog';
import { UserSettings, UserSettingsInsert, isUserSettings } from '@/types/user-settings';

const Settings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showResetDialog, setShowResetDialog] = useState(false);
  
  const [settings, setSettings] = useState({
    hapticFeedback: true,
    backgroundMusic: false,
    volume: 50
  });
  
  // Detect if haptic feedback is available
  const hapticAvailable = isHapticFeedbackAvailable();
  
  // Load user and settings
  useEffect(() => {
    const fetchUserAndSettings = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: userData } = await supabase.auth.getUser();
        setUser(userData?.user || null);
        
        // Settings priority:
        // 1. Logged-in user settings from database
        // 2. Local storage settings
        // 3. Default settings
        
        if (userData?.user) {
          // Get user settings from database
          const { data: userSettingsData, error } = await supabase
            .from('user_settings' as any) // Type assertion to bypass TypeScript error temporarily
            .select('*')
            .eq('user_id', userData.user.id)
            .single();
          
          if (userSettingsData && !error && isUserSettings(userSettingsData)) {
            setSettings({
              hapticFeedback: userSettingsData.haptic_feedback,
              backgroundMusic: userSettingsData.background_music,
              volume: userSettingsData.volume || 50
            });
            
            // Apply the settings
            if (userSettingsData.background_music) {
              audioManager.toggle(true);
              audioManager.setVolume(userSettingsData.volume / 100 || 0.5);
            }
          } else {
            // Check local storage for settings
            const localSettings = localStorage.getItem('gameSettings');
            if (localSettings) {
              const parsedSettings = JSON.parse(localSettings);
              setSettings({
                hapticFeedback: parsedSettings.hapticFeedback ?? true,
                backgroundMusic: parsedSettings.backgroundMusic ?? false,
                volume: parsedSettings.volume ?? 50
              });
              
              // Apply settings
              audioManager.toggle(parsedSettings.backgroundMusic ?? false);
              audioManager.setVolume((parsedSettings.volume ?? 50) / 100);
              
              // Save to database for future use
              const settingsToInsert: UserSettingsInsert = {
                user_id: userData.user.id,
                haptic_feedback: parsedSettings.hapticFeedback ?? true,
                background_music: parsedSettings.backgroundMusic ?? false,
                volume: parsedSettings.volume ?? 50
              };
              
              await supabase
                .from('user_settings' as any) // Type assertion to bypass TypeScript error temporarily
                .insert(settingsToInsert);
            } else {
              // No settings found, create default settings in database
              const defaultSettings: UserSettingsInsert = {
                user_id: userData.user.id,
                haptic_feedback: true,
                background_music: false,
                volume: 50
              };
              
              await supabase
                .from('user_settings' as any) // Type assertion to bypass TypeScript error temporarily
                .insert(defaultSettings);
            }
          }
        } else {
          // Not logged in, check local storage
          const localSettings = localStorage.getItem('gameSettings');
          if (localSettings) {
            const parsedSettings = JSON.parse(localSettings);
            setSettings({
              hapticFeedback: parsedSettings.hapticFeedback ?? true,
              backgroundMusic: parsedSettings.backgroundMusic ?? false,
              volume: parsedSettings.volume ?? 50
            });
            
            // Apply settings
            audioManager.toggle(parsedSettings.backgroundMusic ?? false);
            audioManager.setVolume((parsedSettings.volume ?? 50) / 100);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user or settings:", error);
        setLoading(false);
      }
    };
    
    fetchUserAndSettings();
    
    // Cleanup
    return () => {
      // Don't stop background music when leaving settings page
    };
  }, []);
  
  // Save settings
  const saveSettings = async (newSettings: typeof settings) => {
    try {
      // Always save to localStorage
      localStorage.setItem('gameSettings', JSON.stringify(newSettings));
      
      // If user is logged in, save to database
      if (user) {
        const settingsToUpsert: UserSettingsInsert = {
          user_id: user.id,
          haptic_feedback: newSettings.hapticFeedback,
          background_music: newSettings.backgroundMusic,
          volume: newSettings.volume
        };
        
        await supabase
          .from('user_settings' as any) // Type assertion to bypass TypeScript error temporarily
          .upsert(settingsToUpsert);
      }
      
      // Show success message
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated.",
        duration: 2000,
      });
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
  
  // Handle haptic feedback setting change
  const toggleHapticFeedback = () => {
    const newSettings = {
      ...settings,
      hapticFeedback: !settings.hapticFeedback
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

  const handleResetStats = () => {
    // Refresh the page after stats reset
    window.location.reload();
  };
  
  return (
    <div className="content-container max-w-2xl animate-fade-in page-transition">
      <h1 className="text-2xl font-semibold mb-8">Settings</h1>
      
      <div className="space-y-6">
        {/* Game Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Game Settings</CardTitle>
            <CardDescription>Configure your gameplay experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Haptic Feedback Setting */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center">
                  <Vibrate className="mr-2 h-4 w-4" />
                  <Label htmlFor="haptic-feedback">Haptic Feedback</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  {hapticAvailable ? 
                    "Feel vibrations when placing bridges or completing puzzles" : 
                    "Haptic feedback is not available on this device"}
                </p>
              </div>
              <Switch
                id="haptic-feedback"
                checked={settings.hapticFeedback && hapticAvailable}
                onCheckedChange={toggleHapticFeedback}
                disabled={!hapticAvailable}
              />
            </div>
            
            <Separator />
            
            {/* Background Music Setting */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center">
                    <Music className="mr-2 h-4 w-4" />
                    <Label htmlFor="background-music">Background Music</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Play relaxing music while solving puzzles
                  </p>
                </div>
                <Switch
                  id="background-music"
                  checked={settings.backgroundMusic}
                  onCheckedChange={toggleBackgroundMusic}
                />
              </div>
              
              {/* Volume Slider (only visible if background music is enabled) */}
              {settings.backgroundMusic && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="volume">Volume</Label>
                    <span className="text-sm text-muted-foreground">{settings.volume}%</span>
                  </div>
                  <Slider
                    id="volume"
                    defaultValue={[settings.volume]}
                    max={100}
                    step={5}
                    onValueChange={handleVolumeChange}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Game Data */}
        <Card>
          <CardHeader>
            <CardTitle>Game Data</CardTitle>
            <CardDescription>Manage your game statistics and progress</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="destructive" 
              onClick={() => setShowResetDialog(true)}
              className="w-full"
            >
              Reset Game Statistics
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Reset Stats Dialog */}
      <StatsResetDialog 
        open={showResetDialog} 
        onOpenChange={setShowResetDialog}
        onReset={handleResetStats}
      />
    </div>
  );
};

export default Settings;
