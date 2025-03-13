import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { GridIcon } from 'lucide-react';

const CustomGame: React.FC = () => {
  const navigate = useNavigate();
  
  const [seed, setSeed] = useState<string>('');
  const [gridSize, setGridSize] = useState<number>(7);
  const [islandCount, setIslandCount] = useState<number>(10);
  
  const handleSeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSeed(event.target.value);
  };
  
  const handleGridSizeChange = (value: number[]) => {
    setGridSize(value[0]);
  };
  
  const handleIslandCountChange = (value: number[]) => {
    setIslandCount(value[0]);
  };
  
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    // Generate a random seed if none provided
    const finalSeed = seed.trim() || Math.floor(Math.random() * 1000000).toString();
    
    // Navigate to game page with parameters
    navigate(`/custom-play?seed=${finalSeed}&size=${gridSize}&islands=${islandCount}`);
  };
  
  return (
    <div className="content-container flex flex-col items-center justify-center max-w-4xl mx-auto px-4 py-6 animate-fade-in page-transition">
      <div className="w-full max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="p-0 h-9 w-9"
            aria-label="Back to home"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Button>
          
          <h1 className="text-2xl font-bold text-center">Custom Game</h1>
          
          <div className="w-9 h-9"></div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <GridIcon className="mr-2 h-5 w-5" />
              Create Custom Game
            </CardTitle>
            <CardDescription>
              Configure your own puzzle or enter a seed code.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="seed">Seed Code (Optional)</Label>
                <Input
                  id="seed"
                  placeholder="Enter seed code or leave blank for random"
                  value={seed}
                  onChange={handleSeedChange}
                />
                <p className="text-xs text-muted-foreground">
                  Use the same seed code to get the same puzzle again.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Grid Size: {gridSize}×{gridSize}</Label>
                  <span className="text-xs text-muted-foreground">
                    {gridSize < 7 ? 'Small' : gridSize < 9 ? 'Medium' : 'Large'}
                  </span>
                </div>
                <Slider
                  value={[gridSize]}
                  min={5}
                  max={12}
                  step={1}
                  onValueChange={handleGridSizeChange}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Number of Islands: {islandCount}</Label>
                  <span className="text-xs text-muted-foreground">
                    {islandCount < 8 ? 'Few' : islandCount < 15 ? 'Medium' : 'Many'}
                  </span>
                </div>
                <Slider
                  value={[islandCount]}
                  min={5}
                  max={Math.max(20, gridSize * 2)}
                  step={1}
                  onValueChange={handleIslandCountChange}
                />
              </div>
              
              <Button type="submit" className="w-full">
                Generate Puzzle
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="w-full text-center text-sm text-muted-foreground">
              Custom puzzles will not affect your statistics.
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default CustomGame;
