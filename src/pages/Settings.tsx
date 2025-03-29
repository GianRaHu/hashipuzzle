import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { clearAllData, getSettings, saveSettings } from '@/utils/storage';
import { Loader2, LogOut, Save, Trash, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Settings state
  const [username, setUsername] = useState('');
  const [themePreference, setThemePreference] = useState<'light' | 'dark' | 'system'>('system');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [showTimer, setShowTimer] = useState(true);
  
  // Load user and settings
  useEffect(() => {
    const loadUserAndSettings = async () => {
      setLoading(true);
      
      // Get current user
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      
      // Load settings
      const settings = getSettings();
      const currentTheme = settings.themePreference || (settings.darkMode ? 'dark' : 'light');
      setThemePreference(currentTheme);
      setSoundEnabled(settings.soundEnabled);
      setAnalyticsEnabled(settings.analyticsEnabled);
      setShowTimer(settings.showTimer);
      
      // If user is logged in, get their profile
      if (data.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('username')
          .eq('id', data.user.id)
          .single();
          
        if (userData) {
          setUsername(userData.username || '');
        }
      }
      
      setLoading(false);
    };
    
    loadUserAndSettings();
  }, []);
  
  // Handle toggle changes
  const handleToggleChange = (setting: string, value: boolean) => {
    switch (setting) {
      case 'soundEnabled':
        setSoundEnabled(value);
        break;
      case 'analyticsEnabled':
        setAnalyticsEnabled(value);
        break;
      case 'showTimer':
        setShowTimer(value);
        break;
    }
  };
  
  // Apply theme based on selection
  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  };
  
  // Handle theme preference change
  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setThemePreference(newTheme);
    applyTheme(newTheme);
  };
  
  // Save settings
  const handleSaveSettings = async () => {
    setSaving(true);
    
    try {
      // Save local settings
      saveSettings({
        themePreference,
        darkMode: themePreference === 'dark' || (themePreference === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches),
        soundEnabled,
        analyticsEnabled,
        showTimer
      });
      
      // If user is logged in, update profile
      if (user) {
        const { error } = await supabase
          .from('users')
          .update({ 
            username,
          })
          .eq('id', user.id);
          
        if (error) throw error;
      }
      
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error saving settings",
        description: "There was a problem saving your preferences.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  // Handle clear data
  const handleClearData = () => {
    clearAllData();
    toast({
      title: "Data cleared",
      description: "All local game data has been cleared.",
    });
  };

  const handleDeleteAccount = async () => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(
        user?.id as string
      );
      
      if (error) throw error;
      
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again later.",
        variant: "destructive"
      });
    }
  };
  
  if (loading) {
    return (
      <div className="content-container flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="content-container max-w-2xl animate-fade-in page-transition">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        
        {/* Keep existing account tab content */}
        <TabsContent value="account" className="space-y-6">
          {/* Account Settings */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Account Information</h3>
              <p className="text-sm text-muted-foreground mt-2">
                {user ? "Manage your account details" : "Sign in to sync your progress across devices"}
              </p>
            </div>
            
            {user ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    value={user.email} 
                    disabled 
                    className="bg-muted"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter a username"
                  />
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-2"
                  onClick={handleLogout}
                >
                  <LogOut size={18} />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm">
                  Sign in to save your progress and sync across devices.
                </p>
                <Button 
                  onClick={() => navigate('/login')}
                  className="w-full"
                >
                  Sign In
                </Button>
              </div>
            )}
          </div>
          
          {/* Privacy & Data Protection */}
          <div className="space-y-6">
            <Separator className="my-6" />
            
            <div>
              <h3 className="text-lg font-medium">Privacy & Data Protection</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Manage your data privacy and protection settings
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label 
                    htmlFor="analytics" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Analytics Data Collection
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Allow us to collect anonymous usage data to improve the game experience
                  </p>
                </div>
                <Switch
                  id="analytics"
                  checked={analyticsEnabled}
                  onCheckedChange={(value) => handleToggleChange('analyticsEnabled', value)}
                />
              </div>
              
              {user && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      className="w-full mt-4 flex items-center gap-2"
                    >
                      <Trash2 size={18} />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove all your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
          
          {/* Data Management */}
          <div className="space-y-6">
            <Separator className="my-6" />
            
            <div>
              <h3 className="text-lg font-medium">Data Management</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Manage your local game data
              </p>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-2 border-destructive text-destructive hover:bg-destructive/10"
                >
                  <Trash size={18} />
                  Clear All Local Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will clear all your local game data, including saved games, statistics, and settings.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearData}>Clear Data</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </TabsContent>
        
        <TabsContent value="preferences" className="space-y-6">
          {/* Game Preferences */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Game Preferences</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Customize your game experience
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Theme Preference
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    type="button" 
                    variant={themePreference === 'light' ? 'default' : 'outline'} 
                    className="w-full" 
                    onClick={() => handleThemeChange('light')}
                  >
                    Light
                  </Button>
                  <Button 
                    type="button" 
                    variant={themePreference === 'system' ? 'default' : 'outline'} 
                    className="w-full" 
                    onClick={() => handleThemeChange('system')}
                  >
                    Auto
                  </Button>
                  <Button 
                    type="button" 
                    variant={themePreference === 'dark' ? 'default' : 'outline'} 
                    className="w-full" 
                    onClick={() => handleThemeChange('dark')}
                  >
                    Dark
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Select your preferred theme or use system settings
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label 
                    htmlFor="sound" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Sound Effects
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Enable sound effects during gameplay
                  </p>
                </div>
                <Switch
                  id="sound"
                  checked={soundEnabled}
                  onCheckedChange={(value) => handleToggleChange('soundEnabled', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label 
                    htmlFor="timer" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Show Timer
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Display timer during gameplay
                  </p>
                </div>
                <Switch
                  id="timer"
                  checked={showTimer}
                  onCheckedChange={(value) => handleToggleChange('showTimer', value)}
                />
              </div>
            </div>
          </div>
          
          {/* Save Button */}
          <Button 
            className="w-full flex items-center gap-2 mt-6"
            onClick={handleSaveSettings}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={18} />}
            Save Preferences
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
