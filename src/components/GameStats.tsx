
import React from 'react';
import { Puzzle } from '../utils/gameLogic';
import { GameStats as GameStatsType } from '../utils/storage';

export interface GameStatsProps {
  puzzle?: Puzzle;
  stats?: GameStatsType | Record<string, string | number>; // Updated to include GameStats type
}

const GameStats: React.FC<GameStatsProps> = ({ puzzle, stats }) => {
  // If stats are provided, render stats view
  if (stats) {
    return (
      <div className="p-4 rounded-lg border border-border/30">
        <h3 className="text-sm font-medium mb-3">Game Statistics</h3>
        <div className="space-y-2">
          {/* Convert stats to Record<string, string | number> for rendering */}
          {Object.entries(stats as Record<string, string | number | Record<string, number>>).map(([key, value]) => {
            // Skip rendering nested objects (like bestTime)
            if (typeof value === 'object') {
              return null;
            }
            return (
              <div key={key} className="flex justify-between items-center">
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span>{value}</span>
              </div>
            );
          })}
          
          {/* Render best times if available */}
          {stats.bestTime && Object.entries(stats.bestTime).map(([difficulty, time]) => {
            if (time) {
              return (
                <div key={`best-${difficulty}`} className="flex justify-between items-center">
                  <span className="capitalize">Best {difficulty}</span>
                  <span>{typeof time === 'number' ? `${Math.floor(time / 1000)}s` : time}</span>
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    );
  }

  // If puzzle is provided, render puzzle stats
  if (puzzle) {
    return (
      <div className="p-4 rounded-lg border border-border/30">
        <h3 className="text-sm font-medium mb-3">Game Progress</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>Difficulty</span>
            <span className="capitalize">{puzzle.difficulty}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Grid Size</span>
            <span>{puzzle.size}×{puzzle.size}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Status</span>
            <span>{puzzle.solved ? "Completed" : "In Progress"}</span>
          </div>
        </div>
      </div>
    );
  }

  // Return empty div if neither stats nor puzzle is provided
  return <div className="p-4 rounded-lg border border-border/30">No statistics available</div>;
};

export default GameStats;
