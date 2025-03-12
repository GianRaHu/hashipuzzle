
import React from 'react';
import { Puzzle } from '../utils/gameLogic';

export interface GameStatsProps {
  puzzle: Puzzle;
}

const GameStats: React.FC<GameStatsProps> = ({ puzzle }) => {
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
};

export default GameStats;
