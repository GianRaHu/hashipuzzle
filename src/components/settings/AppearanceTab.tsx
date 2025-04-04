
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Music } from 'lucide-react';

interface AppearanceTabProps {
  settings: {
    backgroundMusic: boolean;
    volume: number;
  };
  toggleBackgroundMusic: () => void;
  handleVolumeChange: (value: number[]) => void;
}

const AppearanceTab: React.FC<AppearanceTabProps> = ({
  settings,
  toggleBackgroundMusic,
  handleVolumeChange
}) => {
  return (
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
  );
};

export default AppearanceTab;
