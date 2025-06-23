
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Home, 
  RotateCcw, 
  Lightbulb, 
  Pause, 
  Settings, 
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';
import { formatTime } from '@/utils/storage';

interface MobileGameInterfaceProps {
  difficulty: string;
  currentTime: number;
  isTimerRunning: boolean;
  showTimer: boolean;
  progress: number;
  onHome: () => void;
  onRestart: () => void;
  onHint: () => void;
  onPause: () => void;
  onSettings: () => void;
  onToggleTimer: () => void;
  hints: number;
  maxHints: number;
}

const MobileGameInterface: React.FC<MobileGameInterfaceProps> = ({
  difficulty,
  currentTime,
  isTimerRunning,
  showTimer,
  progress,
  onHome,
  onRestart,
  onHint,
  onPause,
  onSettings,
  onToggleTimer,
  hints,
  maxHints
}) => {
  const [isCompact, setIsCompact] = useState(false);

  return (
    <>
      {/* Top Header - Always visible */}
      <div className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b z-40" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onHome}>
              <Home className="h-4 w-4" />
            </Button>
            <div>
              <Badge variant="secondary" className="capitalize text-xs">
                {difficulty}
              </Badge>
              {progress > 0 && (
                <div className="w-20 mt-1">
                  <Progress value={progress} className="h-1" />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {showTimer && (
              <div className="flex items-center gap-1 font-mono text-sm bg-muted px-2 py-1 rounded">
                <Clock className="h-3 w-3" />
                {formatTime(currentTime)}
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={onToggleTimer}>
              {showTimer ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Controls - Floating */}
      <div className="fixed bottom-0 left-0 right-0 z-40" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="p-3">
          <Card className="bg-background/95 backdrop-blur-sm border shadow-lg">
            <div className="p-3">
              {!isCompact ? (
                // Expanded view
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium">Hints</span>
                      <Badge variant="outline" className="text-xs">
                        {hints}/{maxHints}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsCompact(true)}
                    >
                      ←
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onHint}
                      disabled={hints >= maxHints}
                      className="flex flex-col gap-1 h-auto py-2"
                    >
                      <Lightbulb className="h-4 w-4" />
                      <span className="text-xs">Hint</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onPause}
                      className="flex flex-col gap-1 h-auto py-2"
                    >
                      <Pause className="h-4 w-4" />
                      <span className="text-xs">Pause</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onRestart}
                      className="flex flex-col gap-1 h-auto py-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span className="text-xs">Restart</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onSettings}
                      className="flex flex-col gap-1 h-auto py-2"
                    >
                      <Settings className="h-4 w-4" />
                      <span className="text-xs">Settings</span>
                    </Button>
                  </div>
                </div>
              ) : (
                // Compact view
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onHint}
                      disabled={hints >= maxHints}
                    >
                      <Lightbulb className="h-4 w-4" />
                    </Button>
                    
                    <Button variant="ghost" size="sm" onClick={onPause}>
                      <Pause className="h-4 w-4" />
                    </Button>
                    
                    <Button variant="ghost" size="sm" onClick={onRestart}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    
                    <Button variant="ghost" size="sm" onClick={onSettings}>
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCompact(false)}
                  >
                    →
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default MobileGameInterface;
