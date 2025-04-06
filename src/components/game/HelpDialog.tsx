
import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

const HelpDialog = () => {
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
      <DialogContent className="sm:max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>How to Play</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <ScrollArea className="h-full max-h-[60vh] pr-4">
          <DialogDescription className="space-y-4">
            <h3 className="text-lg font-medium">Rules</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Connect islands with bridges (horizontal or vertical only).</li>
              <li>Each island must have exactly the number of bridges shown on it.</li>
              <li>Bridges cannot cross each other.</li>
              <li>All islands must be connected to each other through bridges.</li>
              <li>Bridges can be single or double (click an island, then another to create a bridge; click again to add a second bridge; click a third time to remove the bridges).</li>
            </ul>
            
            <h3 className="text-lg font-medium mt-4">Techniques</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Obvious connections:</strong> Islands with a value equal to the number of possible directions must connect to all available neighboring islands.</li>
              <li><strong>Island saturation:</strong> When an island already has all required bridges, no more can be added.</li>
              <li><strong>Connectivity:</strong> All islands must eventually connect to form a single network.</li>
              <li><strong>Isolation prevention:</strong> Avoid creating isolated groups of islands.</li>
              <li><strong>Maximum bridges:</strong> Between any two islands, at most two bridges can be built.</li>
            </ul>
            
            <h3 className="text-lg font-medium mt-4">Advanced Techniques</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Forced connections:</strong> Sometimes a specific bridge must exist for the puzzle to remain solvable.</li>
              <li><strong>Contradictions:</strong> Try different bridge placements and see if they lead to impossibilities.</li>
              <li><strong>Almost-complete islands:</strong> Islands that need only one more bridge can often provide crucial information.</li>
              <li><strong>Island groups:</strong> Consider the total number of bridges needed for a group of islands versus the number of external connections available.</li>
            </ul>
          </DialogDescription>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default HelpDialog;
