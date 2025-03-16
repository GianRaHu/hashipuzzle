import React from 'react';
import { Link } from 'react-router-dom';
import DifficultySelector from '../components/DifficultySelector';
import { Button } from '@/components/ui/button';
import { Hash, Calendar } from 'lucide-react';

const Index: React.FC = () => {
  return (
    <div className="content-container max-w-4xl animate-fade-in page-transition">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-medium mb-2">Hashi Puzzle</h1>
        <p className="text-foreground/70">Connect the islands with bridges</p>
      </div>
      
      <div className="flex justify-center">
        <div className="w-full max-w-md space-y-6">
          <div className="flex gap-3 justify-center mb-2">
            <Button asChild variant="outline" className="w-full">
              <Link to="/daily" className="flex items-center justify-center gap-2">
                <Calendar className="h-4 w-4" />
                Daily Challenge
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link to="/custom" className="flex items-center justify-center gap-2">
                <Hash className="h-4 w-4" />
                Custom Game
              </Link>
            </Button>
          </div>
          
          <DifficultySelector />
        </div>
      </div>
      
      {/* Added bottom padding/spacer */}
      <div className="h-12"></div>
    </div>
  );
};

export default Index;
