
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlayIcon, BookOpen } from 'lucide-react';

interface FirstTimePromptProps {
  isOpen: boolean;
  onClose: () => void;
  onShowTutorial: () => void;
  onSkipTutorial: () => void;
}

const FirstTimePrompt: React.FC<FirstTimePromptProps> = ({
  isOpen,
  onClose,
  onShowTutorial,
  onSkipTutorial
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Welcome to Hashi!</DialogTitle>
          <DialogDescription className="text-center">
            Connect islands with bridges to solve the puzzle
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-center mb-4">
            Is this your first time playing Hashi? Would you like to see a tutorial?
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={onShowTutorial}
              className="w-full flex items-center justify-center gap-2"
              variant="default"
            >
              <BookOpen className="h-4 w-4" />
              Show Tutorial
            </Button>
            
            <Button
              onClick={onSkipTutorial}
              className="w-full flex items-center justify-center gap-2"
              variant="outline"
            >
              <PlayIcon className="h-4 w-4" />
              Start Playing
            </Button>
          </div>
        </div>
        
        <DialogFooter className="flex justify-center">
          <p className="text-xs text-muted-foreground">
            You can always access help and tutorial from the game menu
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FirstTimePrompt;
