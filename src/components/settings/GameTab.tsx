
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Clock, Vibrate } from 'lucide-react';
import StatsResetDialog from '@/components/StatsResetDialog';
import { isHapticFeedbackAvailable } from '@/utils/haptics';

interface GameTabProps {
  settings: {
    hapticFeedback: boolean;
    showTimer: boolean;
  };
  toggleHapticFeedback: () => void;
  toggleShowTimer: () => void;
}

const GameTab: React.FC<GameTabProps> = ({
  settings,
  toggleHapticFeedback,
  toggleShowTimer
}) => {
  const [showResetDialog, setShowResetDialog] = useState(false);
  
  // Detect if haptic feedback is available
  const hapticAvailable = isHapticFeedbackAvailable();
  
  const handleResetStats = () => {
    // Refresh the page after stats reset
    window.location.reload();
  };
  
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
      
      {/* Reset Stats Dialog */}
      <StatsResetDialog 
        open={showResetDialog} 
        onOpenChange={setShowResetDialog}
        onReset={handleResetStats}
      />
    </Card>
  );
};

export default GameTab;
