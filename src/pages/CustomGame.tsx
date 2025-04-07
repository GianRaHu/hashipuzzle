
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RotateCw, Wand2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { difficultySettings, customGridSizeOptions } from '@/utils/difficultySettings';

const CustomGame = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [seed, setSeed] = useState('');
  const [config, setConfig] = useState({
    gridSize: difficultySettings.medium.size.rows, // Default to medium grid size
    advancedTactics: false
  });

  // Helper function to normalize seed input to a stable number
  const normalizeSeed = (input: string): number => {
    if (!input.trim()) {
      return 0;
    }

    // Try to parse as a number first
    const numericSeed = Number(input);
    if (!isNaN(numericSeed)) {
      return Math.abs(numericSeed);
    }

    // If not a number, convert string to a consistent numeric hash
    return Math.abs(input.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0));
  };

  const handleSeedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seed.trim()) {
      toast({
        title: "Seed required",
        description: "Please enter a seed code",
        variant: "destructive"
      });
      return;
    }

    // Convert seed to a stable number
    const seedNumber = normalizeSeed(seed);
    
    // For seeded games, we use the 'medium' difficulty by default
    // This ensures the game opens correctly with a standard difficulty
    navigate(`/game/medium?seed=${seedNumber}`);
  };

  const generateRandomSeed = () => {
    const randomSeed = Math.floor(Math.random() * 1000000);
    setSeed(randomSeed.toString());
  };

  const handleCreateCustomGame = () => {
    // For custom config, we pass the grid size and advanced tactics
    navigate(`/game/custom?gridSize=${config.gridSize}&advancedTactics=${config.advancedTactics}`);
  };

  return (
    <div className="content-container max-w-4xl animate-fade-in page-transition">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-medium mb-2">Custom Game</h1>
        <p className="text-foreground/70">Create a customized Hashi puzzle</p>
      </div>

      <Tabs defaultValue="seed" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
          <TabsTrigger value="seed">By Seed Code</TabsTrigger>
          <TabsTrigger value="custom">Custom Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="seed">
          <Card>
            <CardHeader>
              <CardTitle>Open Game by Seed Code</CardTitle>
              <CardDescription>
                Enter a seed code to open a specific puzzle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSeedSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="seed">Seed Code</Label>
                  <div className="flex gap-2">
                    <Input
                      id="seed"
                      placeholder="Enter seed code"
                      value={seed}
                      onChange={(e) => setSeed(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={generateRandomSeed}
                    >
                      <RotateCw className="h-4 w-4 mr-2" />
                      Random
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Open Puzzle
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle>Custom Configuration</CardTitle>
              <CardDescription>
                Configure your puzzle parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Grid Size</Label>
                  <RadioGroup 
                    value={config.gridSize.toString()}
                    onValueChange={(value) => setConfig({...config, gridSize: parseInt(value)})}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2"
                  >
                    {/* Use the grid sizes from customGridSizeOptions */}
                    {customGridSizeOptions.map((sizeOption) => (
                      <div key={sizeOption.label} className="flex items-center space-x-2">
                        <RadioGroupItem 
                          value={`${sizeOption.value.rows}`} 
                          id={`size-${sizeOption.label}`} 
                        />
                        <Label htmlFor={`size-${sizeOption.label}`}>{sizeOption.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="custom-advanced-tactics">Advanced Tactics</Label>
                    <Switch 
                      id="custom-advanced-tactics"
                      checked={config.advancedTactics}
                      onCheckedChange={(checked) => setConfig({...config, advancedTactics: checked})}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Puzzles with advanced tactics require more logical deduction to solve
                  </p>
                </div>

                <Button 
                  className="w-full mt-4" 
                  onClick={handleCreateCustomGame}
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Create Puzzle
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomGame;
