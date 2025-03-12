import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Clock, Brain, Move } from 'lucide-react';
import { getStats, formatTime } from '@/utils/storage';

const difficultyLevels = ['easy', 'medium', 'hard', 'expert'] as const;
type DifficultyLevel = typeof difficultyLevels[number];

const StatsCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  difficulty: DifficultyLevel;
  value: string | number;
  comparison?: string;
}> = ({ icon, title, difficulty, value, comparison }) => (
  <div className="flex items-start space-x-4 p-4">
    <div className="p-2 rounded-full bg-primary/10">
      {icon}
    </div>
    <div className="space-y-1">
      <p className="text-sm font-medium leading-none">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
      {comparison && (
        <p className="text-xs text-muted-foreground">{comparison}</p>
      )}
      <p className="text-xs text-muted-foreground capitalize">{difficulty}</p>
    </div>
  </div>
);

const Stats: React.FC = () => {
  const navigate = useNavigate();
  const stats = getStats();

  const formatMetricValue = (value: number | undefined, isTime: boolean = true) => {
    if (value === undefined) return '-';
    return isTime ? formatTime(value) : value.toFixed(1);
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Statistics</h1>
        <Button variant="outline" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </div>

      <div className="grid gap-4">
        {difficultyLevels.map((difficulty) => (
          <Card key={difficulty}>
            <CardHeader>
              <CardTitle className="capitalize">{difficulty} Level Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard
                  icon={<Clock className="h-4 w-4 text-primary" />}
                  title="Average Time"
                  difficulty={difficulty}
                  value={formatMetricValue(stats.averageTime[difficulty])}
                  comparison={stats.bestTime[difficulty] ? 
                    `Best: ${formatTime(stats.bestTime[difficulty]!)}` : undefined}
                />
                <StatsCard
                  icon={<Brain className="h-4 w-4 text-primary" />}
                  title="Avg. Thinking Time"
                  difficulty={difficulty}
                  value={formatMetricValue(stats.averageThinkingTime[difficulty])}
                />
                <StatsCard
                  icon={<Move className="h-4 w-4 text-primary" />}
                  title="Moves per Game"
                  difficulty={difficulty}
                  value={formatMetricValue(stats.movesPerGame[difficulty], false)}
                />
              </div>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader>
            <CardTitle>Overall Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-4xl font-bold">{stats.gamesPlayed}</p>
              <p className="text-sm text-muted-foreground">Total Games Played</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Stats;
