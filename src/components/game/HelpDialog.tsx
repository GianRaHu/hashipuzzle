
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HelpCircle, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const HelpDialog: React.FC = () => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { toast } = useToast();

  const handleShowAdvanced = () => {
    setShowAdvanced(true);
    toast({
      title: "Advanced techniques unlocked!",
      description: "You now have access to advanced Hashi strategies.",
      duration: 3000,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full h-8 w-8"
          aria-label="Help"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Hashi (Bridges) Game Help</DialogTitle>
          <DialogDescription className="text-center text-sm">
            Learn the rules and strategies to master Hashi puzzles
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="rules" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="techniques">Techniques</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>
          
          <TabsContent value="rules" className="space-y-4 pt-4">
            <div className="space-y-2">
              <h3 className="font-medium">Basic Rules</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Connect islands (circles) with bridges (lines).</li>
                <li>The number on each island indicates exactly how many bridges must connect to it.</li>
                <li>Bridges can only run horizontally or vertically.</li>
                <li>Bridges cannot cross other bridges or islands.</li>
                <li>A maximum of two bridges can connect the same pair of islands.</li>
                <li>All islands must be connected into a single network (no isolated islands).</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">How to Play</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li><strong>Mobile:</strong> Drag your finger from one island to the other to connect them.</li>
                <li><strong>Desktop:</strong> Click an island then click another to connect them, or drag the mouse from one island to the other.</li>
                <li>Tap/click the same connection again to add a second bridge.</li>
                <li>Tap/click a double bridge to remove it completely.</li>
                <li>Green islands have the correct number of bridges.</li>
                <li>Yellow islands have too many or incorrect bridges.</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Goal</h3>
              <p className="text-sm">Connect all islands according to their numbers to solve the puzzle. All islands must be connected to each other either directly or indirectly through other islands.</p>
            </div>
          </TabsContent>

          <TabsContent value="techniques" className="space-y-4 pt-4">
            <div className="space-y-2">
              <h3 className="font-medium">Beginner Techniques</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li><strong>Islands with value 1:</strong> They can only have one bridge in one direction.</li>
                <li><strong>Islands with maximum value:</strong> If an island can connect to N other islands and its value is 2N, place double bridges to all neighbors.</li>
                <li><strong>Single connection:</strong> If an island can only connect to one neighbor, all its bridges must go there.</li>
                <li><strong>Edge/corner islands:</strong> These have limited connection options, so solve them early.</li>
              </ul>
            </div>
            {showAdvanced ? (
              <div className="space-y-2">
                <h3 className="font-medium">Advanced Techniques</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>Connectivity analysis:</strong> Remember all islands must be connected. If a bridge would disconnect the puzzle, it's wrong.</li>
                  <li><strong>Forced paths:</strong> If removing a particular bridge would make it impossible to complete the puzzle, that bridge must be placed.</li>
                  <li><strong>Loop prevention:</strong> No loops can exist in the solution. If adding a bridge creates a loop, it's wrong.</li>
                  <li><strong>Counting bridges:</strong> Sometimes you can determine the exact number of bridges by analyzing how many bridges are still needed in a region.</li>
                  <li><strong>Parity check:</strong> The sum of all island values must be even and exactly twice the number of bridges in a valid puzzle.</li>
                  <li><strong>Island grouping:</strong> Identify groups of islands that must connect to each other and analyze them as a unit.</li>
                </ul>
              </div>
            ) : (
              <div className="bg-muted p-3 rounded-md">
                <h3 className="font-medium text-sm">Advanced Techniques Locked</h3>
                <p className="text-xs text-muted-foreground my-2">Unlock advanced techniques to master harder puzzles.</p>
                <Button 
                  onClick={handleShowAdvanced} 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-1 text-xs flex items-center gap-2"
                >
                  <Coffee className="h-3 w-3" /> Unlock Advanced Techniques
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="examples" className="space-y-4 pt-4">
            <div className="space-y-2">
              <h3 className="font-medium">Common Patterns</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-muted p-3 rounded-md">
                  <h4 className="text-sm font-medium">Corner Islands</h4>
                  <p className="text-xs text-muted-foreground my-1">An island with value 3 in a corner must have at least one double bridge.</p>
                </div>
                <div className="bg-muted p-3 rounded-md">
                  <h4 className="text-sm font-medium">Islands with Value 1</h4>
                  <p className="text-xs text-muted-foreground my-1">Always connect these first - they can only have one connection in one direction.</p>
                </div>
                <div className="bg-muted p-3 rounded-md">
                  <h4 className="text-sm font-medium">Bridge Counting</h4>
                  <p className="text-xs text-muted-foreground my-1">If a region of islands needs N bridges total and you've placed M, you know you need N-M more bridges.</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Visual Learning</h3>
              <p className="text-sm">Look at your completed puzzles to identify patterns that you can use in future puzzles.</p>
              <p className="text-sm text-muted-foreground">Remember: Practice is the best way to improve your Hashi skills!</p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs"
            onClick={() => toast({
              title: "Hint",
              description: "Look for islands with limited connection options first!",
              duration: 3000,
            })}
          >
            Get Hint
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="text-xs"
            onClick={() => window.open("https://en.wikipedia.org/wiki/Hashiwokakero", "_blank")}
          >
            Learn More
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HelpDialog;
