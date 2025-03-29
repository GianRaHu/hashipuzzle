
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Moon, Sun, Laptop, User, LogIn, 
  LogOut, UserPlus, Shield, Trash
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
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
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState({
    soundEnabled: true,
    notificationsEnabled: true,
    hapticFeedback: true,
    autoSave: true
  });
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  
  useEffect(() => {
    // Check if user is already signed in
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      setLoading(false);
      
      // Set up auth state listener
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user || null);
      });
      
      return () => {
        authListener.subscription.unsubscribe();
      };
    };
    
    checkUser();
    
    // Load user settings from localStorage
    const savedSettings = localStorage.getItem('hashi_user_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);
  
  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('hashi_user_settings', JSON.stringify(newSettings));
    // Toast notifications removed as requested
  };
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Signed in successfully",
        description: "Welcome back to Hashi. The Bridge Game!"
      });
      
      setEmail('');
      setPassword('');
    } catch (error: any) {
      setAuthError(error.message);
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setAuthLoading(false);
    }
  };
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Account created",
        description: "Please check your email to confirm your account."
      });
      
      setEmail('');
      setPassword('');
    } catch (error: any) {
      setAuthError(error.message);
      toast({
        title: "Error creating account",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setAuthLoading(false);
    }
  };
  
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out."
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // Delete user's data from Supabase
      if (user) {
        // Call Supabase Edge Function to delete user data
        const { error: functionError } = await supabase.functions.invoke('delete-stats', {
          body: { user_id: user.id }
        });
        
        if (functionError) throw functionError;
        
        // Delete user account
        const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
        if (authError) throw authError;
      }
      
      // Clear local storage data
      localStorage.removeItem('hashi_stats');
      localStorage.removeItem('hashi_user_settings');
      localStorage.removeItem('daily_completed_date');
      localStorage.removeItem('last_streak_date');
      localStorage.removeItem('hashi_game_history');
      
      // Sign out after deletion
      await supabase.auth.signOut();
      
      toast({
        title: "Account deleted",
        description: "Your account and all associated data have been deleted."
      });
      
      // Reset user state
      setUser(null);
    } catch (error: any) {
      toast({
        title: "Error deleting account",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="content-container max-w-4xl animate-fade-in page-transition scrollable-container">
      <h1 className="text-3xl font-medium mb-6">Settings</h1>
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="game">Game</TabsTrigger>
          <TabsTrigger value="theme">Appearance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="mt-4 space-y-6">
          {/* Authentication Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Account
              </CardTitle>
              <CardDescription>
                {user 
                  ? "Manage your account" 
                  : "Sign in to sync your progress and settings across devices"}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {loading ? (
                <div className="py-4 text-center text-muted-foreground">
                  Loading account information...
                </div>
              ) : user ? (
                <div className="space-y-4">
                  <div className="bg-secondary/40 p-4 rounded-md">
                    <p className="font-medium">{user.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Account created: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {authError && (
                    <div className="p-3 text-sm text-red-500 bg-red-100 dark:bg-red-950/30 rounded">
                      {authError}
                    </div>
                  )}
                  
                  <form className="space-y-4" onSubmit={handleSignIn}>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        type="submit"
                        className="flex-1"
                        disabled={authLoading}
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign In
                      </Button>
                      
                      <Button 
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={handleSignUp}
                        disabled={authLoading}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Sign Up
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Privacy and Data Protection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Privacy & Data Protection
              </CardTitle>
              <CardDescription>
                How we handle your data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <p>
                  Hashi. The Bridge Game respects your privacy and is committed to protecting your personal data.
                </p>
                <p>
                  We only store the data necessary to provide our services, such as game statistics and preferences.
                  You can delete all your data at any time from the Stats page.
                </p>
                <p>
                  When you're signed in, your game data is synced across devices. When you're not signed in,
                  your data is stored locally on your device only.
                </p>
                <p>
                  For more information, please contact us at support@hashipuzzle.com
                </p>
              </div>
            </CardContent>
            <CardFooter>
              {user && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Trash className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove all of your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground">
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Game Settings Tab */}
        <TabsContent value="game" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Game Settings
              </CardTitle>
              <CardDescription>
                Customize your gameplay experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sound">Sound Effects</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable game sounds
                    </p>
                  </div>
                  <Switch 
                    id="sound" 
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications">Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Daily puzzle reminders
                    </p>
                  </div>
                  <Switch 
                    id="notifications" 
                    checked={settings.notificationsEnabled}
                    onCheckedChange={(checked) => updateSetting('notificationsEnabled', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="haptic">Haptic Feedback</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable vibration on mobile
                    </p>
                  </div>
                  <Switch 
                    id="haptic" 
                    checked={settings.hapticFeedback}
                    onCheckedChange={(checked) => updateSetting('hapticFeedback', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autosave">Auto-Save</Label>
                    <p className="text-sm text-muted-foreground">
                      Save game progress automatically
                    </p>
                  </div>
                  <Switch 
                    id="autosave" 
                    checked={settings.autoSave}
                    onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Theme Tab */}
        <TabsContent value="theme" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
              <CardDescription>
                Customize the appearance of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Button 
                  variant={theme === 'light' ? "default" : "outline"} 
                  className="flex flex-col gap-2 h-auto py-4"
                  onClick={() => setTheme('light')}
                >
                  <Sun className="h-6 w-6" />
                  <span>Light</span>
                </Button>
                
                <Button 
                  variant={theme === 'dark' ? "default" : "outline"} 
                  className="flex flex-col gap-2 h-auto py-4"
                  onClick={() => setTheme('dark')}
                >
                  <Moon className="h-6 w-6" />
                  <span>Dark</span>
                </Button>
                
                <Button 
                  variant={theme === 'system' ? "default" : "outline"} 
                  className="flex flex-col gap-2 h-auto py-4"
                  onClick={() => setTheme('system')}
                >
                  <Laptop className="h-6 w-6" />
                  <span>System</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
