
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Hash, Grid2X2, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CustomGame: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State for custom game configuration
  const [seed, setSeed] = useState<string>('');
  const [gridSize, setGridSize] = useState<number>(7);
  const [islandCount, setIslandCount] = useState<number>(10);
  
  // Handle random seed generation
  const generateRandomSeed = () => {
    const randomSeed = Math.floor(Math.random() * 1000000);
    setSeed(randomSeed.toString());
  };
  
  // Handle form submission
  const handleStartGame = () => {
    if (!seed) {
      generateRandomSeed();
      return;
    }
    
    const seedNumber = parseInt(seed, 10);
    
    if (isNaN(seedNumber)) {
      toast({
        title: "Invalid Seed",
        description: "Please enter a valid number for the seed.",
        variant: "destructive"
      });
      return;
    }
    
    // Navigate to game with custom parameters
    navigate(`/custom-play?seed=${seedNumber}&size=${gridSize}&islands=${islandCount}`);
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
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <h1 className="text-2xl font-bold text-center">Custom Game</h1>
          
          <div className="w-9 h-9"></div> {/* Empty div for alignment */}
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Create Custom Puzzle</CardTitle>
            <CardDescription>
              Enter a seed code or configure your own puzzle settings
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Seed Input */}
            <div className="space-y-2">
              <Label htmlFor="seed" className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Seed Code
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="seed"
                  placeholder="Enter a seed number"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  onClick={generateRandomSeed}
                >
                  Random
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                The same seed will always generate the same puzzle
              </p>
            </div>
            
            {/* Grid Size Slider */}
            <div className="space-y-2">
              <Label htmlFor="grid-size" className="flex items-center gap-2">
                <Grid2X2 className="h-4 w-4" />
                Grid Size: {gridSize}x{gridSize}
              </Label>
              <Slider
                id="grid-size"
                value={[gridSize]}
                min={5}
                max={12}
                step={1}
                onValueChange={(value) => setGridSize(value[0])}
              />
              <p className="text-xs text-muted-foreground">
                Larger grids create more complex puzzles
              </p>
            </div>
            
            {/* Island Count Slider */}
            <div className="space-y-2">
              <Label htmlFor="island-count">
                Islands: {islandCount}
              </Label>
              <Slider
                id="island-count"
                value={[islandCount]}
                min={5}
                max={Math.max(20, Math.floor(gridSize * 2))}
                step={1}
                onValueChange={(value) => setIslandCount(value[0])}
              />
              <p className="text-xs text-muted-foreground">
                More islands increase difficulty
              </p>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              onClick={handleStartGame} 
              className="w-full"
            >
              <Play className="mr-2 h-4 w-4" />
              Start Custom Game
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default CustomGame;
