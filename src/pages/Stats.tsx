
import React, { useState, useEffect } from 'react';
import { getStats } from '../utils/storage';
import GameStats from '../components/GameStats';

const Stats: React.FC = () => {
  const [stats, setStats] = useState(getStats());
  
  // Refresh stats when component mounts
  useEffect(() => {
    setStats(getStats());
  }, []);

  return (
    <div className="container max-w-4xl px-4 pt-12 pb-24 md:py-16 mx-auto mt-16 animate-fade-in page-transition">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-medium mb-2">Your Statistics</h1>
        <p className="text-foreground/70">Track your progress and improvements</p>
      </div>
      
      <GameStats stats={stats} />
    </div>
  );
};

export default Stats;
