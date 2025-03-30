
import React, { useState, useEffect } from 'react';
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
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';

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
  const avgCompletionTimeData = extendedStats
    .filter(stat => stat.avg_completion_time !== null)
    .map(stat => ({
      name: stat.difficulty.charAt(0).toUpperCase() + stat.difficulty.slice(1),
      value: stat.avg_completion_time
    }));
  
  // Prepare bar chart data for average thinking time (total time / games played)
  const avgThinkingTimeData = extendedStats
    .filter(stat => stat.games_played > 0)
    .map(stat => ({
      name: stat.difficulty.charAt(0).toUpperCase() + stat.difficulty.slice(1),
      value: Math.round(stat.total_time / stat.games_played)
    }));
  
  // Total time per difficulty
  const totalTimePerDifficultyData = extendedStats
    .filter(stat => stat.total_time > 0)
    .map(stat => ({
      name: stat.difficulty.charAt(0).toUpperCase() + stat.difficulty.slice(1),
      value: stat.total_time,
      hours: Math.floor(stat.total_time / (1000 * 60 * 60)),
      minutes: Math.floor((stat.total_time % (1000 * 60 * 60)) / (1000 * 60))
    }));
  
  // Mock data for play time distribution by hour of day (since we don't have this data yet)
  // In a real implementation, this would come from the server
  const generatePlayTimeByHour = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      // Create a random distribution that's higher in evening hours
      const baseValue = Math.random() * 10;
      const timeMultiplier = i >= 17 && i <= 23 ? 3 : 
                            i >= 8 && i <= 16 ? 2 : 1;
      
      hours.push({
        hour: i,
        // Format as "8 AM", "3 PM", etc.
        name: `${i % 12 === 0 ? 12 : i % 12} ${i < 12 ? 'AM' : 'PM'}`,
        games: Math.round(baseValue * timeMultiplier)
      });
    }
    return hours;
  };
  
  const playTimeByHour = generatePlayTimeByHour();
  
  // Find peak hour
  const peakHour = [...playTimeByHour].sort((a, b) => b.games - a.games)[0];
  
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
        <TabsList className="grid grid-cols-4 w-full max-w-lg mx-auto mb-6">
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="times">Times</TabsTrigger>
          <TabsTrigger value="totals">Totals</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
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
                <BarChart data={avgCompletionTimeData} layout="vertical">
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
          
          <Card>
            <CardHeader>
              <CardTitle>Average Thinking Time</CardTitle>
              <CardDescription>
                Average time per game by difficulty
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={avgThinkingTimeData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip 
                    formatter={(value) => [formatTime(value as number), 'Avg Think Time']}
                    cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="totals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Game Time by Difficulty</CardTitle>
              <CardDescription>
                Total time spent on each difficulty level
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={totalTimePerDifficultyData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip 
                    formatter={(value) => [formatTime(value as number), 'Total Time']}
                    cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {totalTimePerDifficultyData.map(item => (
              <Card key={item.name} className="flex flex-col h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <CardDescription>Total playing time</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center">
                  <div className="text-2xl font-bold">
                    {item.hours}h {item.minutes}m
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Play Time by Hour of Day</CardTitle>
              <CardDescription>
                When you play the most (peak: {peakHour?.name})
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={playTimeByHour}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} games`, 'Games Played']}
                    cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="games" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
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
