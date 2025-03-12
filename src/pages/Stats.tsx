
import React from 'react';
import { getStats, GameStats as GameStatsType } from '@/utils/storage';
import GameStats from '@/components/GameStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Clock } from 'lucide-react';

const Stats = () => {
  const stats = getStats();
  
  // Convert GameStats to a format that can be displayed
  const displayStats: Record<string, string | number> = {
    gamesPlayed: stats.gamesPlayed || 0,
    gamesWon: stats.gamesWon || 0,
    winRate: stats.gamesPlayed ? `${Math.round((stats.gamesWon / stats.gamesPlayed) * 100)}%` : '0%',
    dailyStreak: stats.dailyStreak || 0
  };
  
  return (
    <div className="content-container">
      <h1 className="text-2xl font-bold mb-4">Statistics</h1>
      
      <div className="grid gap-4 mb-8">
        <GameStats stats={displayStats} />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Best Times
            </CardTitle>
            <CardDescription>
              Your fastest puzzle completions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.bestTime || {}).map(([difficulty, time]) => {
                if (!time) return null;
                
                return (
                  <div key={difficulty} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">{difficulty}</span>
                    </div>
                    <span>{Math.floor(Number(time) / 1000)}s</span>
                  </div>
                );
              })}
              
              {!Object.values(stats.bestTime || {}).some(time => time) && (
                <p className="text-muted-foreground text-sm">Complete puzzles to record your best times</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Stats;
