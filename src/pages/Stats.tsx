
import React, { useState, useEffect } from 'react';
import { getStats } from '../utils/storage';
import GameStats from '../components/GameStats';

const Stats: React.FC = () => {
  const [stats, setStats] = useState(getStats());
  
  useEffect(() => {
    setStats(getStats());
  }, []);

  return (
    <div className="content-container max-w-4xl animate-fade-in page-transition">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-medium mb-2">Your Statistics</h1>
        <p className="text-foreground/70">Track your progress and improvements</p>
      </div>
      
      <GameStats stats={stats} />
    </div>
  );
};

export default Stats;
