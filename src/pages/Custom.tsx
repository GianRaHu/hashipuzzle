
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateCustomPuzzle } from '@/utils/customPuzzleGenerator';
import { saveCurrentGame } from '@/utils/storage';

const Custom: React.FC = () => {
  const navigate = useNavigate();
  const [size, setSize] = useState(7);
  const [islandCount, setIslandCount] = useState(8);
  
  const handleCreatePuzzle = () => {
    const puzzle = generateCustomPuzzle(size, islandCount);
    saveCurrentGame(puzzle);
    navigate(`/game/custom`);
  };

  return (
    <div className="content-container max-w-4xl animate-fade-in page-transition">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-medium mb-2">Custom Puzzle</h1>
        <p className="text-foreground/70">Create your own Hashi puzzle</p>
      </div>
      
      <div className="flex justify-center">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="size" className="block text-sm font-medium mb-1">Board Size (5-12)</label>
              <Input 
                id="size"
                type="number" 
                min={5} 
                max={12} 
                value={size} 
                onChange={(e) => setSize(parseInt(e.target.value))}
              />
            </div>
            
            <div>
              <label htmlFor="islands" className="block text-sm font-medium mb-1">Island Count (6-25)</label>
              <Input 
                id="islands"
                type="number" 
                min={6} 
                max={25} 
                value={islandCount} 
                onChange={(e) => setIslandCount(parseInt(e.target.value))}
              />
            </div>
          </div>
          
          <Button className="w-full" onClick={handleCreatePuzzle}>
            Create Puzzle
          </Button>
          
          <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Custom;
