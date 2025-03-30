
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { Info } from 'lucide-react';
import { availableGridSizes } from '@/utils/puzzleGenerator';

const CustomGame = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('size');
  const [seedMode, setSeedMode] = useState<boolean>(false);
  const [seed, setSeed] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<{ width: number, height: number }>(availableGridSizes[2]); // Default to 10x14
  const [advancedTactics, setAdvancedTactics] = useState<boolean>(false);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build URL
    const params = new URLSearchParams();
    
    if (seedMode && seed) {
      params.append('seed', seed);
    }
    
    params.append('gridSize', `${selectedSize.width}x${selectedSize.height}`);
    params.append('advancedTactics', advancedTactics.toString());
    
    navigate(`/game/custom?${params.toString()}`);
  };
  
  return (
    <div className="content-container max-w-md animate-fade-in page-transition">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-center">Custom Game</h1>
        <p className="text-muted-foreground text-center">Create a custom Hashi puzzle</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="size" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="size">Grid Size</TabsTrigger>
            <TabsTrigger value="seed">Seed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="size" className="space-y-6 pt-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Select Grid Size</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Choose a size for your custom puzzle
                </p>
              </div>
              
              <RadioGroup 
                defaultValue={`${selectedSize.width}x${selectedSize.height}`} 
                onValueChange={(value) => {
                  const [width, height] = value.split('x').map(Number);
                  setSelectedSize({ width, height });
                }}
                className="grid grid-cols-2 gap-3"
              >
                {availableGridSizes.map(size => (
                  <div key={`${size.width}x${size.height}`} className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value={`${size.width}x${size.height}`} 
                      id={`size-${size.width}x${size.height}`}
                    />
                    <Label htmlFor={`size-${size.width}x${size.height}`} className="flex-1">
                      {size.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              
              <div className="flex items-center justify-between pt-4">
                <div className="space-y-0.5 flex-1">
                  <Label htmlFor="advanced-tactics" className="font-medium">
                    Advanced Tactics
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Require logical deduction beyond simple counting
                  </p>
                </div>
                <Switch
                  id="advanced-tactics"
                  checked={advancedTactics}
                  onCheckedChange={setAdvancedTactics}
                />
              </div>
              
              <Alert className="bg-muted/50 mt-4">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Larger grids have more islands and are more challenging. Advanced tactics require logical deduction rather than just counting.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
          
          <TabsContent value="seed" className="space-y-6 pt-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Use Seed</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Enter a seed number to generate a specific puzzle
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="seed">Seed Number</Label>
                <Input
                  id="seed"
                  type="number"
                  min="0"
                  max="999999"
                  placeholder="Enter a number (e.g. 123456)"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Use the same seed to generate the same puzzle again
                </p>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5 flex-1">
                  <Label htmlFor="seed-mode" className="font-medium">
                    Use Seed Mode
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Enable to use a specific seed number
                  </p>
                </div>
                <Switch
                  id="seed-mode"
                  checked={seedMode}
                  onCheckedChange={setSeedMode}
                />
              </div>
              
              <div className="pt-4">
                <Label className="mb-2 block">Select Grid Size</Label>
                <RadioGroup 
                  defaultValue={`${selectedSize.width}x${selectedSize.height}`} 
                  onValueChange={(value) => {
                    const [width, height] = value.split('x').map(Number);
                    setSelectedSize({ width, height });
                  }}
                  className="grid grid-cols-2 gap-3"
                >
                  {availableGridSizes.map(size => (
                    <div key={`seed-${size.width}x${size.height}`} className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value={`${size.width}x${size.height}`} 
                        id={`seed-size-${size.width}x${size.height}`}
                      />
                      <Label htmlFor={`seed-size-${size.width}x${size.height}`} className="flex-1">
                        {size.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <Button type="submit" className="w-full">
          Generate Puzzle
        </Button>
      </form>
    </div>
  );
};

export default CustomGame;
