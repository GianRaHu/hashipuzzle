
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getStats, formatTime } from '@/utils/storage';

const Stats: React.FC = () => {
  const navigate = useNavigate();
  const stats = getStats();

  const difficulties = ['easy', 'medium', 'hard', 'expert', 'master'];

  return (
    <div className="container max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          Back
        </Button>
        <h1 className="text-2xl font-bold">Statistics</h1>
        <div className="w-16" /> {/* Spacer for alignment */}
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Overall Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Total Games Played: {stats.gamesPlayed}</p>
          </CardContent>
        </Card>

        {difficulties.map(difficulty => (
          <Card key={difficulty}>
            <CardHeader>
              <CardTitle className="capitalize">{difficulty}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stats.bestTime[difficulty] && (
                <p>Best Time: {formatTime(stats.bestTime[difficulty]!)}</p>
              )}
              {stats.averageTime[difficulty] && (
                <p>Average Time: {formatTime(stats.averageTime[difficulty]!)}</p>
              )}
              {stats.movesPerGame[difficulty] && (
                <p>Average Moves: {Math.round(stats.movesPerGame[difficulty]!)}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Stats;
