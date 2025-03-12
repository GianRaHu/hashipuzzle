
import React from 'react';
import { Puzzle } from '../utils/gameLogic';

export interface GameStatsProps {
  puzzle?: Puzzle;
  stats?: any; // Adding the stats prop that was missing
}

const GameStats: React.FC<GameStatsProps> = ({ puzzle, stats }) => {
  // If stats are provided, render stats view
  if (stats) {
    return (
      <div className="p-4 rounded-lg border border-border/30">
        <h3 className="text-sm font-medium mb-3">Game Statistics</h3>
        <div className="space-y-2">
          {/* Render statistics from stats prop */}
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center">
              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              <span>{value}</span>
            </div>
          ))}
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
