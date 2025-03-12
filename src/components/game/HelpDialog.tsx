
import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const HelpDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <HelpCircle className="h-4 w-4 mr-2" />
          Help
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>How to Play</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] mt-4 pr-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Game Rules</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Hashi (Bridges) is a logic puzzle with simple rules but challenging solutions.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium">Objective</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Connect all islands with bridges so that the number of bridges connected to each island matches its number.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium">Rules</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground mt-1 space-y-2">
                <li>Bridges can only run horizontally or vertically.</li>
                <li>Bridges cannot cross other bridges or islands.</li>
                <li>At most two bridges can connect the same pair of islands.</li>
                <li>All islands must be connected into a single group (directly or indirectly).</li>
                <li>The number on each island indicates how many bridges should connect to it.</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-medium">How to play</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground mt-1 space-y-2">
                <li><strong>Connect islands:</strong> Click on one island, then click on another island to connect them with a bridge.</li>
                <li><strong>Add a second bridge:</strong> Repeat the same action to add a second bridge (if allowed).</li>
                <li><strong>Remove bridges:</strong> Click the same pair of islands a third time to remove all bridges between them.</li>
                <li><strong>Drag to connect:</strong> You can also click and drag from one island to another to create a bridge.</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-medium">Visual Indicators</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground mt-1 space-y-2">
                <li><strong>Green:</strong> Island has exactly the right number of bridges.</li>
                <li><strong>Yellow:</strong> Island has too many bridges.</li>
                <li><strong>Red:</strong> Island has too few bridges.</li>
                <li><strong>White/Default:</strong> Island has no bridges yet.</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-medium">Tips</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground mt-1 space-y-2">
                <li>Start with islands that have high numbers or limited connection options.</li>
                <li>Islands with a value of 1 can only connect in one direction.</li>
                <li>Remember that all islands must be connected to complete the puzzle.</li>
              </ul>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default HelpDialog;
