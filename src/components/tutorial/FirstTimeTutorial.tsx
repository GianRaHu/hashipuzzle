
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface TutorialStep {
  title: string;
  content: React.ReactNode;
  image?: string;
}

const FirstTimeTutorial: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const tutorialSteps: TutorialStep[] = [
    {
      title: "Welcome to Hashi!",
      content: (
        <div>
          <p className="mb-4">
            Hashi (橋, Japanese for "bridges") is a logic puzzle with simple rules but
            challenging solutions.
          </p>
          <p>
            Let's learn how to play!
          </p>
        </div>
      ),
    },
    {
      title: "The Basic Rules",
      content: (
        <div>
          <ul className="list-disc pl-5 space-y-2">
            <li>The board contains islands (circles with numbers)</li>
            <li>The number on each island shows how many bridges must connect to it</li>
            <li>Bridges can only be built horizontally or vertically</li>
            <li>Bridges cannot cross each other</li>
            <li>All islands must be connected to form one group</li>
          </ul>
        </div>
      ),
    },
    {
      title: "Building Bridges",
      content: (
        <div>
          <p className="mb-4">
            To build a bridge, tap or click on an island, then tap/click on another island in the 
            same row or column.
          </p>
          <p className="mb-4">
            A bridge will form between them if possible.
          </p>
          <p>
            Double-clicking will create a double bridge if possible.
          </p>
        </div>
      ),
    },
    {
      title: "Double Bridges",
      content: (
        <div>
          <p className="mb-4">
            You can build up to two bridges between the same two islands.
          </p>
          <p>
            Click on an existing bridge to cycle through: single bridge → double bridge → no bridge.
          </p>
        </div>
      ),
    },
    {
      title: "Solving Techniques",
      content: (
        <div>
          <p className="mb-4">Look for islands with a value of 1 - they can only connect in one direction.</p>
          <p className="mb-4">Islands with a value equal to the number of possible directions must connect to all neighbors.</p>
          <p className="mb-4">When an island has almost all its bridges built, complete it.</p>
          <p>Remember that all islands must be connected in one group!</p>
        </div>
      ),
    },
    {
      title: "You're Ready!",
      content: (
        <div>
          <p className="mb-4">
            Now you know the basics of Hashi. Start with an easy puzzle and work your way up to more difficult ones.
          </p>
          <p>
            Good luck and enjoy the game!
          </p>
        </div>
      ),
    }
  ];
  
  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prevStep => prevStep + 1);
    } else {
      onClose();
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prevStep => prevStep - 1);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{tutorialSteps[currentStep].title}</DialogTitle>
          <DialogDescription>
            Step {currentStep + 1} of {tutorialSteps.length}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {tutorialSteps[currentStep].content}
          
          {tutorialSteps[currentStep].image && (
            <div className="mt-4 flex justify-center">
              <img 
                src={tutorialSteps[currentStep].image} 
                alt={`Tutorial step ${currentStep + 1}`}
                className="max-w-full rounded-md border"
              />
            </div>
          )}
        </div>
        
        <Separator />
        
        <DialogFooter className="sm:justify-between flex gap-2">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex-1"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <Button
            onClick={nextStep}
            className="flex-1"
          >
            {currentStep === tutorialSteps.length - 1 ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Close
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FirstTimeTutorial;
