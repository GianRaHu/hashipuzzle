import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, LogOut, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AccountTabProps {
  user: any;
  loading: boolean;
}

const AccountTab: React.FC<AccountTabProps> = ({ user, loading }) => {
  const { toast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
      duration: 2000,
    });
  };

  const handleDeleteAccountData = async () => {
    if (!user) return;
    
    try {
      // Call the supabase function to delete all user stats
      const { error } = await supabase.rpc('delete_all_user_stats', { user_uuid: user.id });
      
      if (error) throw error;
      
      toast({
        title: "Data deleted",
        description: "All your game data has been deleted.",
        duration: 3000,
      });
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Error deleting account data:", error);
      toast({
        title: "Error",
        description: "Could not delete your data. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    try {
      // First delete user data
      await handleDeleteAccountData();
      
      // Then delete the user account
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      
      if (error) throw error;
      
      await supabase.auth.signOut();
      
      toast({
        title: "Account deleted",
        description: "Your account has been deleted successfully.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: "Could not delete your account. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };
  
  return (
    <Card className="opacity-50 pointer-events-none relative overflow-hidden">
      <div className="absolute top-4 right-4 z-10">
        <Badge variant="secondary">Coming soon</Badge>
      </div>
      
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>{user ? "Manage your account settings" : "Sign in to sync your game progress across devices"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!user ? (
          <div className="space-y-4">
            <p className="text-sm">
              Create an account to save your game progress, settings, and statistics across multiple devices.
            </p>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <Button asChild className="w-full">
                <Link to="/auth?tab=signin">Sign In</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/auth?tab=signup">Create Account</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">{user.email}</p>
                <p className="text-sm text-muted-foreground">Signed in</p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleSignOut}
              disabled={loading}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
            
            <Separator className="my-4" />
            
            <div>
              <h3 className="text-lg font-medium mb-2">Data & Privacy</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your game data is stored securely and only accessible to you. We use this data to provide a consistent experience across your devices.
              </p>
              
              <div className="space-y-2">
                <Button 
                  variant="destructive" 
                  className="w-full" 
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete All My Game Data
                </Button>
                
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleDeleteAccount}
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete My Account
                </Button>
              </div>
              
              {showDeleteConfirm && (
                <div className="mt-4 p-4 border border-destructive/50 bg-destructive/10 rounded-md">
                  <p className="text-sm mb-4">
                    Are you sure you want to delete all your game data? This action cannot be undone.
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteAccountData}
                      disabled={loading}
                    >
                      Confirm Delete
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Privacy Policy</h3>
              <p className="text-sm text-muted-foreground">
                We only store the minimum data necessary to provide you with a seamless gaming experience across devices.
                Your personal information is never shared with third parties.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AccountTab;
