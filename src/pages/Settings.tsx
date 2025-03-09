
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Moon, Sun, Laptop, Trash } from 'lucide-react';
import { useTheme } from 'next-themes';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const Settings = () => {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [gameHistory, setGameHistory] = useState<{seed: number, difficulty: string, date: string}[]>([]);
  
  useEffect(() => {
    // Load game history from localStorage
    const history = localStorage.getItem('hashi_game_history');
    if (history) {
      setGameHistory(JSON.parse(history));
    }
  }, []);
  
  const clearGameHistory = () => {
    localStorage.removeItem('hashi_game_history');
    setGameHistory([]);
    toast({
      title: "History cleared",
      description: "Your game history has been cleared."
    });
  };

  return (
    <div className="content-container max-w-4xl animate-fade-in page-transition">
      <h1 className="text-3xl font-medium mb-6">Settings</h1>
      
      <Tabs defaultValue="theme" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="theme">Appearance</TabsTrigger>
          <TabsTrigger value="history">Game History</TabsTrigger>
        </TabsList>
        
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
