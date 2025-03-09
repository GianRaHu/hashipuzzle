
import React from 'react';
import { GameStats as StatsType, formatTime } from '../utils/storage';

interface GameStatsProps {
  stats: StatsType;
}

const GameStats: React.FC<GameStatsProps> = ({ stats }) => {
  const winRate = stats.gamesPlayed > 0 
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) 
    : 0;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg border border-border/30">
          <h3 className="text-xs uppercase text-foreground/70 mb-1">Games</h3>
          <p className="text-2xl font-medium">{stats.gamesPlayed}</p>
        </div>
        
        <div className="p-3 rounded-lg border border-border/30">
          <h3 className="text-xs uppercase text-foreground/70 mb-1">Wins</h3>
          <p className="text-2xl font-medium">{stats.gamesWon}</p>
        </div>
        
        <div className="p-3 rounded-lg border border-border/30">
          <h3 className="text-xs uppercase text-foreground/70 mb-1">Win Rate</h3>
          <p className="text-2xl font-medium">{winRate}%</p>
        </div>
        
        <div className="p-3 rounded-lg border border-border/30">
          <h3 className="text-xs uppercase text-foreground/70 mb-1">Daily Streak</h3>
          <p className="text-2xl font-medium">{stats.dailyStreak}</p>
        </div>
      </div>
      
      <div className="p-4 rounded-lg border border-border/30">
        <h3 className="text-sm font-medium mb-3">Best Times</h3>
        <div className="space-y-2">
          {Object.entries(stats.bestTime)
            .filter(([_, time]) => time && time > 0)
            .map(([difficulty, time]) => (
              <div key={difficulty} className="flex justify-between items-center">
                <span className="capitalize">{difficulty}</span>
                <span className="font-mono">{formatTime(time as number)}</span>
              </div>
            ))}
          
          {Object.values(stats.bestTime).every(time => !time || time === 0) && (
            <p className="text-sm text-foreground/70 text-center py-2">
              No records yet. Play some games!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameStats;
