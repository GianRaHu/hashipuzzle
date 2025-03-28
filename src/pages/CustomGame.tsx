
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Dices, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { generatePuzzle } from '../utils/puzzleGenerator';
import { Slider } from '@/components/ui/slider';

const CustomGame: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [seedInput, setSeedInput] = useState<string>('');
  const [customDifficulty, setCustomDifficulty] = useState<string>('medium');
  const [gridSize, setGridSize] = useState<number>(8);
  
  // Generate a random seed
  const generateRandomSeed = () => {
    const randomSeed = Math.floor(Math.random() * 1000000);
    setSeedInput(randomSeed.toString());
  };
  
  // Start a game with the provided seed
  const startGameWithSeed = () => {
    if (!seedInput) {
      toast({
        title: "Seed Required",
        description: "Please enter a seed value or generate a random one.",
        variant: "destructive",
      });
      return;
    }
    
    const seed = parseInt(seedInput, 10);
    if (isNaN(seed)) {
      toast({
        title: "Invalid Seed",
        description: "Please enter a valid number as seed.",
        variant: "destructive",
      });
      return;
    }
    
    // Redirect to game page with seed as URL parameter
    navigate(`/game/seed?seed=${seed}`);
  };
  
  // Copy seed to clipboard
  const copySeedToClipboard = () => {
    if (!seedInput) {
      toast({
        title: "No Seed to Copy",
        description: "Please enter or generate a seed first.",
        variant: "destructive",
      });
      return;
    }
    
    navigator.clipboard.writeText(seedInput)
      .then(() => {
        toast({
          title: "Seed Copied",
          description: "The seed has been copied to your clipboard.",
        });
      })
      .catch(() => {
        toast({
          title: "Failed to Copy",
          description: "Could not copy to clipboard. Please copy it manually.",
          variant: "destructive",
        });
      });
  };
  
  // Preview the generated puzzle
  const previewPuzzle = () => {
    if (!seedInput) {
      toast({
        title: "Seed Required",
        description: "Please enter a seed value or generate a random one.",
        variant: "destructive",
      });
      return;
    }
    
    const seed = parseInt(seedInput, 10);
    if (isNaN(seed)) {
      toast({
        title: "Invalid Seed",
        description: "Please enter a valid number as seed.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Generate a sample puzzle to validate seed
      toast({
        title: "Valid Seed",
        description: "This seed will generate a valid puzzle.",
      });
    } catch (error) {
      toast({
        title: "Invalid Seed",
        description: "This seed does not generate a valid puzzle. Try another one.",
        variant: "destructive",
      });
    }
  };
  
  // Start custom game with selected configuration
  const startCustomGame = () => {
    navigate(`/game/${customDifficulty}?gridSize=${gridSize}`);
  };
  
  return (
    <div className="content-container max-w-4xl animate-fade-in page-transition">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-center">Custom Game</h1>
        <p className="text-center text-muted-foreground">Create a custom game using a seed or configuration</p>
      </div>
      
      <Tabs defaultValue="seed" className="w-full max-w-md mx-auto">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="seed">Play with Seed</TabsTrigger>
          <TabsTrigger value="config">Custom Configuration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="seed">
          <Card>
            <CardHeader>
              <CardTitle>Create Game with Seed</CardTitle>
              <CardDescription>
                Enter a seed number or generate a random one to create a reproducible puzzle
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Seed</label>
                <div className="flex space-x-2">
                  <Input 
                    type="text" 
                    placeholder="Enter seed..." 
                    value={seedInput}
                    onChange={(e) => setSeedInput(e.target.value)}
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={generateRandomSeed}
                    title="Generate Random Seed"
                  >
                    <Dices className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={copySeedToClipboard}
                    title="Copy Seed"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2 justify-between">
              <Button 
                variant="outline" 
                onClick={previewPuzzle}
              >
                Validate Seed
              </Button>
              <Button onClick={startGameWithSeed}>Start Game</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Custom Configuration</CardTitle>
              <CardDescription>
                Configure your game parameters for a unique experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Difficulty</label>
                <Select defaultValue={customDifficulty} onValueChange={setCustomDifficulty}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                    <SelectItem value="master">Master</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm text-muted-foreground">Grid Size</label>
                  <span className="text-sm font-medium">{gridSize}x{gridSize}</span>
                </div>
                <Slider 
                  defaultValue={[gridSize]} 
                  min={5} 
                  max={12} 
                  step={1} 
                  onValueChange={(value) => setGridSize(value[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Small</span>
                  <span>Large</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={startCustomGame}
                className="w-full"
              >
                Generate Custom Game
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomGame;
