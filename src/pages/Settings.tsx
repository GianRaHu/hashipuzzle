import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Moon, Sun, Laptop, Trash, User, LogIn } from 'lucide-react';
import { useTheme } from 'next-themes';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [gameHistory, setGameHistory] = useState<{seed: number, difficulty: string, date: string}[]>([]);
  const [settings, setSettings] = useState({
    soundEnabled: true,
    notificationsEnabled: true,
    hapticFeedback: true,
    autoSave: true
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Load game history from localStorage
    const history = localStorage.getItem('hashi_game_history');
    if (history) {
      setGameHistory(JSON.parse(history));
    }
    
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
    
    toast({
      title: "Settings updated",
      description: `${key} has been ${value ? 'enabled' : 'disabled'}.`
    });
  };
  
  const clearGameHistory = () => {
    localStorage.removeItem('hashi_game_history');
    setGameHistory([]);
    toast({
      title: "History cleared",
      description: "Your game history has been cleared."
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully."
    });
  };

  return (
    <div className="content-container max-w-4xl animate-fade-in page-transition scrollable-container">
      <h1 className="text-3xl font-medium mb-6">Settings</h1>
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="theme">Appearance</TabsTrigger>
          <TabsTrigger value="history">Game History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                {user ? "Manage your account" : "Sign in or create an account"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Signed in as: {user.email}
                  </p>
                  <Button onClick={handleSignOut} variant="outline">
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button 
                    onClick={() => window.location.href = '/auth'}
                    className="w-full"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In / Sign Up
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              {/* Move settings to a separate card */}
              <div className="space-y-4">
                
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
        
        <TabsContent value="history">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Game History</CardTitle>
                <CardDescription>
                  Your previously played games
                </CardDescription>
              </div>
              {gameHistory.length > 0 && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={clearGameHistory}
                >
                  <Trash className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {gameHistory.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No game history found
                </p>
              ) : (
                <div className="space-y-2">
                  {gameHistory.map((game, index) => (
                    <div key={index} className="p-3 border rounded-md flex justify-between items-center">
                      <div>
                        <p className="font-medium capitalize">{game.difficulty}</p>
                        <p className="text-sm text-muted-foreground">Seed: {game.seed}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">{game.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
