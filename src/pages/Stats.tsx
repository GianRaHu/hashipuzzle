
import React, { useState, useEffect } from 'react';
import { getStats, getGameHistory, formatTime } from '../utils/storage';
import GameStats from '../components/GameStats';
import StatsResetDialog from '../components/StatsResetDialog';
import StatsDetailedView from '../components/stats/StatsDetailedView';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Stats: React.FC = () => {
  const [localStats, setLocalStats] = useState(getStats());
  const [extendedStats, setExtendedStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [gameHistory, setGameHistory] = useState(getGameHistory());
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      
      if (data.user) {
        loadExtendedStats(data.user.id);
      } else {
        // Create local extended stats from the game history
        createLocalExtendedStats();
        setLoading(false);
      }
    };
    
    checkUser();
  }, []);
  
  // Create local extended stats from game history
  const createLocalExtendedStats = () => {
    try {
      // Process local stats to create extended stats
      const difficulties = ['easy', 'medium', 'hard', 'expert'];
      const stats = difficulties.map(difficulty => {
        const gamesPlayed = localStats.difficultyGamesPlayed?.[difficulty] || 0;
        const totalTime = localStats.totalTime?.[difficulty] || 0;
        const avgTime = gamesPlayed > 0 ? Math.floor(totalTime / gamesPlayed) : null;
        
        return {
          id: `local-${difficulty}`,
          difficulty,
          games_played: gamesPlayed,
          games_won: gamesPlayed, // Assuming all completed games are won in local storage
          total_time: totalTime,
          avg_completion_time: avgTime,
          best_completion_time: localStats.bestTime[difficulty] || null,
          best_time_date: null,
          user_id: 'local'
        };
      });
      
      setExtendedStats(stats);
    } catch (error) {
      console.error('Error creating local extended stats:', error);
      setExtendedStats([]);
    }
  };
  
  const loadExtendedStats = async (userId: string) => {
    try {
      setLoading(true);
      
      // Fetch extended stats
      const { data, error } = await supabase
        .from('extended_stats')
        .select('*')
        .eq('user_id', userId);
        
      if (error) throw error;
      
      setExtendedStats(data || []);
    } catch (error) {
      console.error('Error loading extended stats:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleReset = () => {
    setLocalStats(getStats());
    setGameHistory(getGameHistory());
    
    if (user) {
      loadExtendedStats(user.id);
    } else {
      createLocalExtendedStats();
    }
  };
  
  const clearGameHistory = () => {
    localStorage.removeItem('hashi_game_history');
    setGameHistory([]);
    createLocalExtendedStats(); // Update extended stats after clearing history
    toast({
      title: "History cleared",
      description: "Your game history has been cleared."
    });
  };
  
  return (
    <div className="content-container max-w-4xl animate-fade-in page-transition">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-medium mb-2">Your Statistics</h1>
        <p className="text-foreground/70">Track your progress and improvements</p>
      </div>
      
      <div className="flex justify-end mb-6">
        <StatsResetDialog onReset={handleReset} />
      </div>
      
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-6">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="detailed">Advanced</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic">
          <GameStats stats={localStats} />
        </TabsContent>
        
        <TabsContent value="detailed">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <StatsDetailedView extendedStats={extendedStats} />
          )}
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <div className="px-6 py-4 flex flex-row items-center justify-between border-b">
              <div>
                <h3 className="text-lg font-medium">Game History</h3>
                <p className="text-sm text-muted-foreground">
                  Your previously played games
                </p>
              </div>
              {gameHistory.length > 0 && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={clearGameHistory}
                >
                  <Trash className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
            <div className="p-6">
              {gameHistory.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No game history found
                </p>
              ) : (
                <div className="space-y-2">
                  {gameHistory.map((game, index) => (
                    <div key={index} className="p-3 border rounded-md flex justify-between">
                      <div>
                        <p className="font-medium capitalize">{game.difficulty}</p>
                        <p className="text-sm text-muted-foreground">Seed: {game.seed}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{game.date}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {game.status === 'completed' ? (
                            <span className="text-green-500">Completed {game.time ? `(${formatTime(game.time)})` : ''}</span>
                          ) : game.status === 'in-progress' ? (
                            <span className="text-amber-500">In progress</span>
                          ) : (
                            <span className="text-gray-500">Generated</span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Stats;
