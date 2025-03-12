
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HelpDialog: React.FC = () => {
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
        </DialogHeader>

        <Tabs defaultValue="rules" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="techniques">Techniques</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[400px] mt-4">
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
                  <li><strong>Mobile:</strong> Tap an island then tap another to connect them, or drag from one island to another.</li>
                  <li><strong>Desktop:</strong> Click an island then click another to connect them.</li>
                  <li>Tap/click the same connection again to add a second bridge.</li>
                  <li>Tap/click a double bridge to remove it completely.</li>
                  <li>Green islands have the correct number of bridges.</li>
                  <li>Yellow islands have too many bridges.</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="techniques" className="space-y-4 pt-4">
              <div className="space-y-2">
                <h3 className="font-medium">Beginner Techniques</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>Islands with value 1:</strong> They can only have one bridge in one direction.</li>
                  <li><strong>Islands with maximum value:</strong> If an island can connect to N other islands and its value is 2N, place double bridges to all neighbors.</li>
                  <li><strong>Single connection:</strong> If an island can only connect to one neighbor, all its bridges must go there.</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Advanced Techniques</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>Connectivity:</strong> Remember all islands must be connected. If a bridge would disconnect the puzzle, it's wrong.</li>
                  <li><strong>Forced paths:</strong> If removing a particular bridge would make it impossible to complete the puzzle, that bridge must be placed.</li>
                  <li><strong>Loop prevention:</strong> No loops can exist in the solution. If adding a bridge creates a loop, it's wrong.</li>
                  <li><strong>Counting bridges:</strong> Sometimes you can determine the exact number of bridges by analyzing how many bridges are still needed in a region.</li>
                </ul>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default HelpDialog;
