
import React from 'react';
import { GameStats as StatsType, formatTime } from '../utils/storage';

interface GameStatsProps {
  stats: StatsType;
}

const GameStats: React.FC<GameStatsProps> = ({ stats }) => {
  // Calculate average time per difficulty
  const calculateAverageTime = (difficulty: string) => {
    if (!stats.totalTime || !stats.totalTime[difficulty] || !stats.difficultyGamesPlayed || !stats.difficultyGamesPlayed[difficulty]) {
      return 0;
    }
    return Math.floor(stats.totalTime[difficulty] / stats.difficultyGamesPlayed[difficulty]);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="p-3 rounded-lg border border-border/30">
        <h3 className="text-xs uppercase text-foreground/70 mb-1">Games</h3>
        <p className="text-2xl font-medium">{stats.gamesPlayed}</p>
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
      
      <div className="p-4 rounded-lg border border-border/30">
        <h3 className="text-sm font-medium mb-3">Average Time Per Game</h3>
        <div className="space-y-2">
          {Object.keys(stats.bestTime)
            .filter(difficulty => stats.difficultyGamesPlayed && stats.difficultyGamesPlayed[difficulty] > 0)
            .map(difficulty => (
              <div key={difficulty} className="flex justify-between items-center">
                <span className="capitalize">{difficulty}</span>
                <span className="font-mono">{formatTime(calculateAverageTime(difficulty))}</span>
              </div>
            ))}
          
          {!stats.difficultyGamesPlayed || Object.values(stats.difficultyGamesPlayed).every(count => !count || count === 0) && (
            <p className="text-sm text-foreground/70 text-center py-2">
              No data yet. Play some games!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameStats;
