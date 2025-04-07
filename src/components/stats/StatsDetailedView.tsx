
import React from 'react';
import { formatDistance } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatTime } from '@/utils/storage';
import { 
  LineChart,
  Line,
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  // Calculate total playing time
  const totalPlayingTimeMs = extendedStats.reduce((sum, stat) => sum + stat.total_time, 0);
  const totalHours = Math.floor(totalPlayingTimeMs / (1000 * 60 * 60));
  const totalMinutes = Math.floor((totalPlayingTimeMs % (1000 * 60 * 60)) / (1000 * 60));
  const totalSeconds = Math.floor((totalPlayingTimeMs % (1000 * 60)) / 1000);
  
  // Sort extendedStats by difficulty
  const sortedStats = [...extendedStats].sort((a, b) => {
    const difficultyOrder = { easy: 1, medium: 2, hard: 3, expert: 4, master: 5 };
    return difficultyOrder[a.difficulty as keyof typeof difficultyOrder] - 
           difficultyOrder[b.difficulty as keyof typeof difficultyOrder];
  });
  
  // Calculate total games
  const totalGames = extendedStats.reduce((sum, stat) => sum + stat.games_played, 0);
  
  // Mock data for play time distribution by hour of day
  const generatePlayTimeByHour = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      // Create a random distribution that's higher in evening hours
      const baseValue = Math.random() * 10;
      const timeMultiplier = i >= 17 && i <= 23 ? 3 : 
                            i >= 8 && i <= 16 ? 2 : 1;
      
      hours.push({
        hour: i,
        name: `${i % 12 === 0 ? 12 : i % 12} ${i < 12 ? 'AM' : 'PM'}`,
        games: Math.round(baseValue * timeMultiplier)
      });
    }
    return hours;
  };
  
  const playTimeByHour = generatePlayTimeByHour();
  
  // Find peak hour
  const peakHour = [...playTimeByHour].sort((a, b) => b.games - a.games)[0];
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Games</CardTitle>
            <CardDescription>Games played across all difficulties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalGames || 0}
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
              {totalHours || "00"}h {totalMinutes || "00"}m {totalSeconds || "00"}s
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="games" className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-lg mx-auto mb-6">
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="times">Times</TabsTrigger>
        </TabsList>
        
        <TabsContent value="games" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Games Played by Difficulty</CardTitle>
              <CardDescription>
                Number of games and distribution per difficulty level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Games</TableHead>
                    <TableHead>Distribution</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedStats.map(stat => (
                    <TableRow key={stat.difficulty}>
                      <TableCell className="font-medium capitalize">{stat.difficulty}</TableCell>
                      <TableCell>{stat.games_played}</TableCell>
                      <TableCell>
                        {totalGames > 0 
                          ? `${Math.round((stat.games_played / totalGames) * 100)}%`
                          : '0%'
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                  {sortedStats.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                        No games played yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
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
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Average Time</TableHead>
                    <TableHead>Games Played</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedStats
                    .filter(stat => stat.avg_completion_time !== null || stat.games_played > 0)
                    .map(stat => (
                      <TableRow key={stat.difficulty}>
                        <TableCell className="font-medium capitalize">{stat.difficulty}</TableCell>
                        <TableCell>
                          {stat.avg_completion_time
                            ? formatTime(stat.avg_completion_time)
                            : 'No data'
                          }
                        </TableCell>
                        <TableCell>{stat.games_played}</TableCell>
                      </TableRow>
                    ))
                  }
                  {sortedStats.filter(stat => stat.avg_completion_time !== null || stat.games_played > 0).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                        No completion times recorded yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Average Thinking Time</CardTitle>
              <CardDescription>
                Average time per game by difficulty
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Average Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedStats
                    .filter(stat => stat.games_played > 0)
                    .map(stat => (
                      <TableRow key={stat.difficulty}>
                        <TableCell className="font-medium capitalize">{stat.difficulty}</TableCell>
                        <TableCell>
                          {stat.games_played > 0
                            ? formatTime(Math.round(stat.total_time / stat.games_played))
                            : 'No data'
                          }
                        </TableCell>
                      </TableRow>
                    ))
                  }
                  {sortedStats.filter(stat => stat.games_played > 0).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-4 text-muted-foreground">
                        No games played yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Game Activity by Hour of Day</CardTitle>
              <CardDescription>
                When you play the most (peak: {peakHour?.name})
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={playTimeByHour}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                  <Line 
                    type="monotone" 
                    dataKey="games" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }} 
                  />
                  <Tooltip 
                    formatter={(value) => [`${value} games`, 'Games Played']}
                    labelFormatter={(label) => `Time: ${label}`}
                    cursor={false}
                    contentStyle={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      borderRadius: '0.375rem'
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StatsDetailedView;
