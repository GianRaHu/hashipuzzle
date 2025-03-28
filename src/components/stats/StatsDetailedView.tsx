
import React from 'react';
import { formatDistance } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatTime } from '@/utils/storage';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface ExtendedStats {
  id: string;
  difficulty: string;
  games_played: number;
  games_won: number;
  total_time: number;
  avg_completion_time: number | null;
  best_completion_time: number | null;
  best_time_date: string | null;
}

interface StatsDetailedViewProps {
  extendedStats: ExtendedStats[];
}

const StatsDetailedView: React.FC<StatsDetailedViewProps> = ({ extendedStats }) => {
  // Prepare bar chart data for games played by difficulty
  const gamesPlayedData = extendedStats.map(stat => ({
    name: stat.difficulty.charAt(0).toUpperCase() + stat.difficulty.slice(1),
    value: stat.games_played
  }));
  
  // Prepare pie chart data for difficulty distribution
  const totalGames = extendedStats.reduce((sum, stat) => sum + stat.games_played, 0);
  const difficultyDistribution = extendedStats.map(stat => ({
    name: stat.difficulty.charAt(0).toUpperCase() + stat.difficulty.slice(1),
    value: totalGames > 0 ? Math.round((stat.games_played / totalGames) * 100) : 0
  }));
  
  // Prepare bar chart data for average completion time
  const avgTimeData = extendedStats
    .filter(stat => stat.avg_completion_time !== null)
    .map(stat => ({
      name: stat.difficulty.charAt(0).toUpperCase() + stat.difficulty.slice(1),
      value: stat.avg_completion_time
    }));
  
  // Calculate total playing time
  const totalPlayingTimeMs = extendedStats.reduce((sum, stat) => sum + stat.total_time, 0);
  const totalHours = Math.floor(totalPlayingTimeMs / (1000 * 60 * 60));
  const totalMinutes = Math.floor((totalPlayingTimeMs % (1000 * 60 * 60)) / (1000 * 60));
  
  // Pie chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28AFA'];
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Games</CardTitle>
            <CardDescription>Games played across all difficulties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {extendedStats.reduce((sum, stat) => sum + stat.games_played, 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Win Rate</CardTitle>
            <CardDescription>Your overall win percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalGames > 0 
                ? Math.round((extendedStats.reduce((sum, stat) => sum + stat.games_won, 0) / totalGames) * 100)
                : 0}%
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Playing Time</CardTitle>
            <CardDescription>Time spent solving puzzles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalHours}h {totalMinutes}m
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="games" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-6">
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="times">Times</TabsTrigger>
          <TabsTrigger value="records">Records</TabsTrigger>
        </TabsList>
        
        <TabsContent value="games" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Games Played by Difficulty</CardTitle>
              <CardDescription>
                Number of games per difficulty level
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gamesPlayedData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip 
                    formatter={(value) => [`${value} games`, 'Games Played']}
                    cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Difficulty Distribution</CardTitle>
              <CardDescription>
                Percentage of games played at each difficulty
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={difficultyDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {difficultyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Distribution']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="times" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Average Completion Time</CardTitle>
              <CardDescription>
                Average time to complete puzzles by difficulty
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={avgTimeData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip 
                    formatter={(value) => [formatTime(value as number), 'Average Time']}
                    cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#82ca9d" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="records" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Best Times</CardTitle>
              <CardDescription>
                Your record completion times for each difficulty
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {extendedStats
                  .filter(stat => stat.best_completion_time !== null)
                  .sort((a, b) => {
                    const difficultyOrder = { easy: 1, medium: 2, hard: 3, expert: 4, master: 5 };
                    return difficultyOrder[a.difficulty as keyof typeof difficultyOrder] - 
                           difficultyOrder[b.difficulty as keyof typeof difficultyOrder];
                  })
                  .map(stat => (
                    <div key={stat.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <div className="font-medium capitalize">{stat.difficulty}</div>
                        {stat.best_time_date && (
                          <div className="text-xs text-muted-foreground">
                            {formatDistance(new Date(stat.best_time_date), new Date(), { addSuffix: true })}
                          </div>
                        )}
                      </div>
                      <div className="font-mono text-right">
                        {formatTime(stat.best_completion_time!)}
                      </div>
                    </div>
                  ))}
                
                {extendedStats.filter(stat => stat.best_completion_time !== null).length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    No records yet. Complete some puzzles to set records!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StatsDetailedView;
