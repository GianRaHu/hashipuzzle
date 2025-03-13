
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings as SettingsIcon, Moon, Sun, Smartphone } from 'lucide-react';
import { useTheme } from 'next-themes';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [vibrationEnabled, setVibrationEnabled] = useState(
    localStorage.getItem('vibrationEnabled') !== 'false'
  );
  
  // Handle vibration toggle
  const handleVibrationToggle = () => {
    const newValue = !vibrationEnabled;
    setVibrationEnabled(newValue);
    localStorage.setItem('vibrationEnabled', String(newValue));
  };
  
  return (
    <div className="container max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          Back
        </Button>
        <h1 className="text-2xl font-bold">Settings</h1>
        <div className="w-16" /> {/* Spacer for alignment */}
      </div>
      
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <SettingsIcon className="mr-2 h-5 w-5" />
              App Settings
            </CardTitle>
            <CardDescription>
              Customize your app experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="vibration">Haptic Feedback</Label>
                <p className="text-sm text-muted-foreground">
                  Enable vibration for game actions
                </p>
              </div>
              <Switch 
                id="vibration"
                checked={vibrationEnabled}
                onCheckedChange={handleVibrationToggle}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>Theme</Label>
              <div className="flex gap-2">
                <Toggle 
                  variant="outline" 
                  aria-label="Light mode"
                  pressed={theme === 'light'}
                  onPressedChange={() => setTheme('light')}
                  className="flex-1 justify-center"
                >
                  <Sun className="h-4 w-4 mr-2" />
                  Light
                </Toggle>
                <Toggle 
                  variant="outline" 
                  aria-label="Dark mode"
                  pressed={theme === 'dark'}
                  onPressedChange={() => setTheme('dark')}
                  className="flex-1 justify-center"
                >
                  <Moon className="h-4 w-4 mr-2" />
                  Dark
                </Toggle>
                <Toggle 
                  variant="outline" 
                  aria-label="System theme"
                  pressed={theme === 'system'}
                  onPressedChange={() => setTheme('system')}
                  className="flex-1 justify-center"
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  System
                </Toggle>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
