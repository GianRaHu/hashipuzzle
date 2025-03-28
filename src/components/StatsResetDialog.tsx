
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface StatsResetDialogProps {
  onReset: () => void;
}

const StatsResetDialog: React.FC<StatsResetDialogProps> = ({ onReset }) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleReset = async () => {
    setIsDeleting(true);
    
    try {
      // Clear local storage stats
      localStorage.removeItem('hashi_stats');
      localStorage.removeItem('hashi_game_history');
      localStorage.removeItem('daily_completed_date');
      localStorage.removeItem('daily_completed_dates');
      localStorage.removeItem('last_streak_date');
      
      // Clear Supabase stats if user is logged in
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        await supabase.rpc('delete_all_user_stats', { user_uuid: user.user.id });
      }
      
      toast({
        title: "Statistics Reset",
        description: "All your statistics have been successfully reset.",
      });
      
      // Call the parent's reset handler
      onReset();
    } catch (error) {
      console.error('Error resetting stats:', error);
      toast({
        title: "Reset Failed",
        description: "There was a problem resetting your statistics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" className="gap-2">
          <Trash2 className="h-4 w-4" />
          Reset All Statistics
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset All Statistics</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to reset all your game statistics? This action cannot be undone.
            All your game records, completion times, and progress will be permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleReset}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Resetting..." : "Reset All Data"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default StatsResetDialog;
