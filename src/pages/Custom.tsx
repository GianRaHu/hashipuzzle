import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Puzzle, Sliders } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider as SliderComponent } from '@/components/ui/slider';
import { generatePuzzle } from '@/utils/puzzleGenerator';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';

const GRID_SIZE_MIN = 5;
const GRID_SIZE_MAX = 15;
const DEFAULT_GRID_SIZE = 7;

const Custom: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [gridSize, setGridSize] = useState<number>(DEFAULT_GRID_SIZE);
  const [seed, setSeed] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleSliderChange = (value: number[]) => {
    setGridSize(value[0]);
  };

  const handleSeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSeed(e.target.value);
    setError(null);
  };

  const generateRandomGame = () => {
    navigate(`/game/custom?size=${gridSize}`);
  };

  const generateSeedGame = () => {
    if (!seed.trim()) {
      setError("Please enter a seed");
      return;
    }
    
    // Convert seed string to a number (simple hash)
    let seedNumber = 0;
    for (let i = 0; i < seed.length; i++) {
      seedNumber = ((seedNumber << 5) - seedNumber) + seed.charCodeAt(i);
      seedNumber = seedNumber & seedNumber; // Convert to 32bit integer
    }
    
    seedNumber = Math.abs(seedNumber);
    navigate(`/game/custom?size=${gridSize}&seed=${seedNumber}`);
  };

  return (
    <div className="content-container max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">Custom Game</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sliders className="h-5 w-5" />
              Grid Size
            </CardTitle>
            <CardDescription>
              Choose the {isMobile ? "height" : "width"} of your custom puzzle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Small ({GRID_SIZE_MIN})</span>
                  <span>Large ({GRID_SIZE_MAX})</span>
                </div>
                <SliderComponent 
                  min={GRID_SIZE_MIN}
                  max={GRID_SIZE_MAX}
                  step={1}
                  value={[gridSize]}
                  onValueChange={handleSliderChange}
                  className="py-4"
                />
                <div className="text-center">
                  Current size: <span className="font-medium">{gridSize}×{gridSize}</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={generateRandomGame} className="w-full">
              Generate Random Puzzle
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Puzzle className="h-5 w-5" />
              Seed Generator
            </CardTitle>
            <CardDescription>
              Enter a seed to generate a specific puzzle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seed">Seed (text or number)</Label>
                <Input 
                  id="seed" 
                  value={seed}
                  onChange={handleSeedChange}
                  placeholder="Enter a seed value"
                />
                {error && <p className="text-destructive text-sm">{error}</p>}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={generateSeedGame} className="w-full">
              Generate From Seed
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Custom;
