
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Clock, Vibrate, Music, Timer } from 'lucide-react';
import { isHapticFeedbackAvailable } from '@/utils/haptics';

interface GameTabProps {
  settings: {
    hapticFeedback: boolean;
    showTimer: boolean;
    showBestTime: boolean;
    backgroundMusic: boolean;
    volume: number;
  };
  toggleHapticFeedback: () => void;
  toggleShowTimer: () => void;
  toggleShowBestTime: () => void;
  toggleBackgroundMusic: () => void;
  handleVolumeChange: (value: number[]) => void;
}

const GameTab: React.FC<GameTabProps> = ({
  settings,
  toggleHapticFeedback,
  toggleShowTimer,
  toggleShowBestTime,
  toggleBackgroundMusic,
  handleVolumeChange
}) => {
  // Detect if haptic feedback is available
  const hapticAvailable = isHapticFeedbackAvailable();
  
  return (
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
        
        {/* Best Time Setting */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center">
              <Timer className="mr-2 h-4 w-4" />
              <Label htmlFor="show-best-time">Show Best Time</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Display your best completion time in the game header
            </p>
          </div>
          <Switch
            id="show-best-time"
            checked={settings.showBestTime}
            onCheckedChange={toggleShowBestTime}
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
            className="data-[state=unchecked]:bg-muted"
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
              className="data-[state=unchecked]:bg-muted"
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

export default GameTab;
