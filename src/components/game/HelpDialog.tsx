
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
            <h3 className="text-lg font-medium">Basic Rules</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Connect islands with bridges (horizontal or vertical only).</li>
              <li>Each island must have exactly the number of bridges shown on it.</li>
              <li>Bridges cannot cross other bridges.</li>
              <li>All islands must be connected to each other through bridges.</li>
              <li>Between any two islands, at most 2 bridges can be built.</li>
            </ul>
            
            <h3 className="text-lg font-medium mt-4">How to Play</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Creating bridges:</strong> Click on an island, then click on another island to build a bridge between them.</li>
              <li><strong>Double bridges:</strong> Click the same island pair again to create a second bridge.</li>
              <li><strong>Removing bridges:</strong> Click a third time to remove all bridges between the islands.</li>
              <li><strong>Undo:</strong> Use the undo button to revert your last action.</li>
              <li><strong>Restart:</strong> Reset the puzzle to its initial state without changing the layout.</li>
            </ul>
            
            <h3 className="text-lg font-medium mt-4">Basic Strategies</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Islands with 1 connection:</strong> An island with value 1 can only connect to one other island.</li>
              <li><strong>Maximum connections:</strong> Check islands where the value equals the number of available directions - they must connect to all neighboring islands.</li>
              <li><strong>Complete islands:</strong> Once an island has all its bridges, no more can be added.</li>
              <li><strong>Corner islands:</strong> Islands in corners can only have 2 possible directions for bridges.</li>
            </ul>
            
            <h3 className="text-lg font-medium mt-4">Advanced Strategies</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Forced connections:</strong> When an island has limited bridge options.</li>
              <li><strong>Bridge counting:</strong> Count the total number of bridges required for a group of islands.</li>
              <li><strong>Look ahead:</strong> Consider what would happen if you place a bridge in a certain location.</li>
              <li><strong>Avoid isolation:</strong> Make sure you don't create isolated groups of islands that can't be connected to the rest.</li>
              <li><strong>Island saturation:</strong> When an island has nearly all its bridges placed, check neighboring islands for logical next moves.</li>
            </ul>
          </DialogDescription>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default HelpDialog;
