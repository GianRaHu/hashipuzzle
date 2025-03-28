
import React, { useState, useEffect } from 'react';
import { getStats } from '../utils/storage';
import GameStats from '../components/GameStats';
import StatsResetDialog from '../components/StatsResetDialog';
import StatsDetailedView from '../components/stats/StatsDetailedView';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

const Stats: React.FC = () => {
  const [localStats, setLocalStats] = useState(getStats());
  const [extendedStats, setExtendedStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      
      if (data.user) {
        loadExtendedStats(data.user.id);
      } else {
        setLoading(false);
      }
    };
    
    checkUser();
  }, []);
  
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
    
    if (user) {
      loadExtendedStats(user.id);
    }
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
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
          <TabsTrigger value="basic">Basic Stats</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic">
          <GameStats stats={localStats} />
        </TabsContent>
        
        <TabsContent value="detailed">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : extendedStats.length > 0 ? (
            <StatsDetailedView extendedStats={extendedStats} />
          ) : (
            <Card className="p-8 text-center">
              <p className="text-lg mb-2">No detailed statistics available</p>
              <p className="text-muted-foreground">
                {user 
                  ? "Complete some games to see detailed statistics."
                  : "Sign in to track and view detailed statistics across devices."}
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Stats;
