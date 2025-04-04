
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Music, Vibrate, Clock, User, EyeIcon, Trash2, LogOut, Palette } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { isHapticFeedbackAvailable } from '@/utils/haptics';
import audioManager from '@/utils/audio';
import StatsResetDialog from '@/components/StatsResetDialog';
import { UserSettings, UserSettingsInsert, isUserSettings } from '@/types/user-settings';
import { Link } from 'react-router-dom';

const Settings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [settings, setSettings] = useState({
    hapticFeedback: true,
    backgroundMusic: false,
    volume: 50,
    showTimer: true
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
              volume: userSettingsData.volume || 50,
              showTimer: true // Default value, will be updated when we add this column
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
                volume: parsedSettings.volume ?? 50,
                showTimer: parsedSettings.showTimer ?? true
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
              volume: parsedSettings.volume ?? 50,
              showTimer: parsedSettings.showTimer ?? true
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

  // Handle timer visibility setting change
  const toggleShowTimer = () => {
    const newSettings = {
      ...settings,
      showTimer: !settings.showTimer
    };
    
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
      duration: 2000,
    });
    setUser(null);
  };

  const handleDeleteAccountData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Call the supabase function to delete all user stats
      const { error } = await supabase.rpc('delete_all_user_stats', { user_uuid: user.id });
      
      if (error) throw error;
      
      toast({
        title: "Data deleted",
        description: "All your game data has been deleted.",
        duration: 3000,
      });
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Error deleting account data:", error);
      toast({
        title: "Error",
        description: "Could not delete your data. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // First delete user data
      await handleDeleteAccountData();
      
      // Then delete the user account
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      
      if (error) throw error;
      
      await supabase.auth.signOut();
      
      toast({
        title: "Account deleted",
        description: "Your account has been deleted successfully.",
        duration: 3000,
      });
      
      navigate('/');
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: "Could not delete your account. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      setLoading(false);
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
          <TabsTrigger value="appearance">
            <Palette className="w-4 h-4 mr-2" /> Appearance
          </TabsTrigger>
        </TabsList>
        
        {/* Account Tab Content */}
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>{user ? "Manage your account settings" : "Sign in to sync your game progress across devices"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!user ? (
                <div className="space-y-4">
                  <p className="text-sm">
                    Create an account to save your game progress, settings, and statistics across multiple devices.
                  </p>
                  <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                    <Button asChild className="w-full">
                      <Link to="/auth?tab=signin">Sign In</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/auth?tab=signup">Create Account</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{user.email}</p>
                      <p className="text-sm text-muted-foreground">Signed in</p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleSignOut}
                    disabled={loading}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                  
                  <Separator className="my-4" />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Data & Privacy</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your game data is stored securely and only accessible to you. We use this data to provide a consistent experience across your devices.
                    </p>
                    
                    <div className="space-y-2">
                      <Button 
                        variant="destructive" 
                        className="w-full" 
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete All My Game Data
                      </Button>
                      
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        onClick={handleDeleteAccount}
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete My Account
                      </Button>
                    </div>
                    
                    {showDeleteConfirm && (
                      <div className="mt-4 p-4 border border-destructive/50 bg-destructive/10 rounded-md">
                        <p className="text-sm mb-4">
                          Are you sure you want to delete all your game data? This action cannot be undone.
                        </p>
                        <div className="flex space-x-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDeleteAccountData}
                            disabled={loading}
                          >
                            Confirm Delete
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={loading}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Privacy Policy</h3>
                    <p className="text-sm text-muted-foreground">
                      We only store the minimum data necessary to provide you with a seamless gaming experience across devices.
                      Your personal information is never shared with third parties.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Game Tab Content */}
        <TabsContent value="game" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Game Settings</CardTitle>
              <CardDescription>Configure your gameplay experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Timer Setting */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    <Label htmlFor="show-timer">Show Timer</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Display a timer during gameplay to track your solving time
                  </p>
                </div>
                <Switch
                  id="show-timer"
                  checked={settings.showTimer}
                  onCheckedChange={toggleShowTimer}
                />
              </div>
              
              <Separator />
              
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
              
              {/* Game Stats Reset */}
              <div>
                <h3 className="text-base font-medium mb-2">Game Statistics</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Reset your game statistics if you want to start fresh
                </p>
                <Button 
                  variant="destructive" 
                  onClick={() => setShowResetDialog(true)}
                  className="w-full"
                >
                  Reset Game Statistics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Appearance Tab Content */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize how the game looks and sounds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
        </TabsContent>
      </Tabs>
      
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
