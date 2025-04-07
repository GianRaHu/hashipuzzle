
import React from 'react';
import { GameStats as StatsType, formatTime } from '../utils/storage';

interface GameStatsProps {
  stats: StatsType;
}

const GameStats: React.FC<GameStatsProps> = ({ stats }) => {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="p-3 rounded-lg border border-border/30">
        <h3 className="text-xs uppercase text-foreground/70 mb-1">Games</h3>
        <p className="text-2xl font-medium">{stats.gamesPlayed || 0}</p>
      </div>
      
      <div className="p-4 rounded-lg border border-border/30">
        <h3 className="text-sm font-medium mb-3">Best Times</h3>
        <div className="space-y-2">
          {['easy', 'medium', 'hard', 'expert', 'master'].map((difficulty) => (
            <div key={difficulty} className="flex justify-between items-center">
              <span className="capitalize">{difficulty}</span>
              {stats.bestTime[difficulty] ? (
                <span className="font-mono">{formatTime(stats.bestTime[difficulty] as number)}</span>
              ) : (
                <span className="text-foreground/70">No data</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameStats;
