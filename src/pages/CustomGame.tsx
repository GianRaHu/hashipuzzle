
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

const CustomGame = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [seed, setSeed] = useState('');
  const [config, setConfig] = useState({
    gridSize: 7,
    advancedTactics: false
  });

  const handleSeedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seed.trim()) {
      toast({
        title: "Seed required",
        description: "Please enter a seed value",
        variant: "destructive"
      });
      return;
    }

    // Convert seed to a number
    const seedNumber = parseInt(seed, 10) || Math.abs(seed.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0));

    // When using a seed, we don't need to pass advancedTactics parameter as it is
    // deterministically generated from the seed
    navigate(`/game/custom?seed=${seedNumber}`);
  };

  const generateRandomSeed = () => {
    const randomSeed = Math.floor(Math.random() * 1000000);
    setSeed(randomSeed.toString());
  };

  const handleCreateCustomGame = () => {
    // Pass gridSize and advanced tactics as URL parameters
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
          <TabsTrigger value="seed">By Seed</TabsTrigger>
          <TabsTrigger value="custom">Custom Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="seed">
          <Card>
            <CardHeader>
              <CardTitle>Generate by Seed</CardTitle>
              <CardDescription>
                Enter a seed value to generate a reproducible puzzle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSeedSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="seed">Seed Value</Label>
                  <div className="flex gap-2">
                    <Input
                      id="seed"
                      placeholder="Enter seed value"
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

                {/* Removed advanced tactics toggle for seed mode */}

                <Button type="submit" className="w-full">
                  Generate Puzzle
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
                    className="grid grid-cols-3 gap-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="6" id="size-6" />
                      <Label htmlFor="size-6">6x6</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="7" id="size-7" />
                      <Label htmlFor="size-7">7x7</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="8" id="size-8" />
                      <Label htmlFor="size-8">8x8</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="9" id="size-9" />
                      <Label htmlFor="size-9">9x9</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="10" id="size-10" />
                      <Label htmlFor="size-10">10x10</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="12" id="size-12" />
                      <Label htmlFor="size-12">12x12</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="14" id="size-14" />
                      <Label htmlFor="size-14">14x14</Label>
                    </div>
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
