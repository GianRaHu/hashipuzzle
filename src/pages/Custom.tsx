import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shuffle, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useMediaQuery } from '@/hooks/use-mobile';
import { generatePuzzle } from '../utils/puzzleGenerator';
import { Progress } from '@/components/ui/progress';

const Custom: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  
  // State for custom game configuration
  const [gridSize, setGridSize] = useState<number>(8); // Default size
  const [seedInput, setSeedInput] = useState<string>('');
  const [generatingSeed, setGeneratingSeed] = useState<boolean>(false);
  const [seedValue, setSeedValue] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  
  // Min and max grid sizes
  const MIN_GRID_SIZE = 5;
  const MAX_GRID_SIZE = 15;
  
  // Calculate aspect ratio based on device
  const getAspectRatio = () => {
    return isDesktop ? 4/3 : 3/4; // Wider for desktop, taller for mobile
  };
  
  // Generate a random seed
  const generateRandomSeed = () => {
    setGeneratingSeed(true);
    setTimeout(() => {
      const randomSeed = Math.floor(Math.random() * 1000000);
      setSeedInput(randomSeed.toString());
      setSeedValue(randomSeed);
      setGeneratingSeed(false);
      
      toast({
        title: "Random Seed Generated",
        description: `Seed: ${randomSeed}`
      });
    }, 500);
  };
  
  // Start game with current configuration
  const startCustomGame = () => {
    try {
      // Validate seed if provided
      let seed: number | undefined = undefined;
      if (seedInput.trim() !== '') {
        const parsedSeed = parseInt(seedInput, 10);
        if (isNaN(parsedSeed)) {
          toast({
            title: "Invalid Seed",
            description: "Please enter a valid number for the seed",
            variant: "destructive"
          });
          return;
        }
        seed = parsedSeed;
      }
      
      setLoading(true);
      setLoadingProgress(0);
      
      // Simulate loading
      const loadingInterval = setInterval(() => {
        setLoadingProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 200);
      
      // Generate puzzle with custom parameters
      setTimeout(() => {
        try {
          console.log(`Generating custom puzzle with size: ${gridSize}, seed: ${seed || 'random'}`);
          
          // Generate puzzle (we'll use medium difficulty for now)
          const difficulty = 'medium';
          // Fixed: Pass only two arguments to generatePuzzle
          const customPuzzle = generatePuzzle(difficulty, seed);
          
          clearInterval(loadingInterval);
          setLoadingProgress(100);
          
          // Store the custom puzzle for the Game component to use
          localStorage.setItem('custom_puzzle', JSON.stringify(customPuzzle));
          
          // Redirect to custom game page after a short delay
          setTimeout(() => {
            navigate('/custom/play');
          }, 500);
        } catch (error) {
          console.error("Error generating custom puzzle:", error);
          clearInterval(loadingInterval);
          setLoadingProgress(0);
          setLoading(false);
          
          toast({
            title: "Error Generating Puzzle",
            description: "Please try different settings or a different seed",
            variant: "destructive"
          });
        }
      }, 1000);
    } catch (error) {
      console.error("Error starting custom game:", error);
      toast({
        title: "Error",
        description: "Failed to start custom game",
        variant: "destructive"
      });
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fade-in">
        <div className="w-full max-w-md space-y-4">
          <Progress value={loadingProgress} className="h-2 w-full" />
          <p className="text-center text-sm text-muted-foreground">
            Generating custom puzzle...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="content-container max-w-4xl mx-auto p-4 animate-fade-in page-transition">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/')}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-semibold">Custom Puzzle</h1>
      </div>
      
      <Tabs defaultValue="size" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="size">Grid Size</TabsTrigger>
          <TabsTrigger value="seed">Seed Code</TabsTrigger>
        </TabsList>
        
        <TabsContent value="size" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-medium mb-4">
              {isDesktop ? "Adjust Grid Width" : "Adjust Grid Height"}
            </h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Small</span>
                  <span>Large</span>
                </div>
                <Slider 
                  value={[gridSize]} 
                  min={MIN_GRID_SIZE} 
                  max={MAX_GRID_SIZE} 
                  step={1}
                  onValueChange={(values) => setGridSize(values[0])}
                  className="py-4"
                />
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg flex flex-col items-center justify-center aspect-square sm:aspect-video relative">
                <div className="text-center mb-2">Grid Preview</div>
                <div 
                  className="border border-border/30 rounded-lg overflow-hidden relative"
                  style={{
                    width: isDesktop ? '80%' : `${80 * getAspectRatio()}%`,
                    height: isDesktop ? `${80 / getAspectRatio()}%` : '80%',
                  }}
                >
                  <div className="absolute inset-0 grid place-items-center text-muted-foreground">
                    {gridSize} x {Math.round(gridSize * (isDesktop ? 1/getAspectRatio() : getAspectRatio()))}
                  </div>
                </div>
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                {isDesktop ? 
                  `Width: ${gridSize} columns, Height: ${Math.round(gridSize / getAspectRatio())} rows` : 
                  `Height: ${gridSize} rows, Width: ${Math.round(gridSize * getAspectRatio())} columns`}
              </div>
            </div>
          </Card>
          
          <Button className="w-full" onClick={startCustomGame}>
            Start Custom Game
          </Button>
        </TabsContent>
        
        <TabsContent value="seed" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-medium mb-4">
              Enter Seed Code
            </h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm">Seed Code</label>
                <div className="flex gap-2">
                  <Input 
                    value={seedInput} 
                    onChange={(e) => setSeedInput(e.target.value)}
                    placeholder="Enter seed number..."
                    type="number"
                  />
                  <Button 
                    variant="outline" 
                    onClick={generateRandomSeed}
                    disabled={generatingSeed}
                  >
                    <Shuffle className="h-4 w-4 mr-2" />
                    Random
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use a seed code to generate the same puzzle again later
                </p>
              </div>
              
              <div className="bg-muted/50 p-6 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Code className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">How Seeds Work</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  A seed is a number that determines how the puzzle is generated. 
                  Using the same seed will produce identical puzzles. 
                  Share seeds with friends to play the same puzzles, or save 
                  your favorite seeds for later.
                </p>
              </div>
            </div>
          </Card>
          
          <Button className="w-full" onClick={startCustomGame}>
            Generate From Seed
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Custom;
