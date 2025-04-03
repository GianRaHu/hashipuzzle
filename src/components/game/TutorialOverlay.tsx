
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface TutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish: () => void;
  targetDifficulty?: string;
}

type TutorialStep = {
  title: string;
  content: React.ReactNode;
  image?: string;
};

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ 
  isOpen, 
  onClose, 
  onFinish,
  targetDifficulty = 'easy'
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentTab, setCurrentTab] = useState('basics');
  const isMobile = useIsMobile();

  // Tailored tutorial steps based on difficulty
  const getDifficultySpecificTips = (): React.ReactNode => {
    switch(targetDifficulty) {
      case 'hard':
      case 'expert':
        return (
          <div className="space-y-4">
            <p>In harder difficulties, you'll need to use advanced techniques:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Look for forced connections - if an island has limited options, solve it first</li>
              <li>Consider connectivity - remember all islands must form one connected network</li>
              <li>Use the process of elimination to determine which bridges must be placed</li>
            </ul>
          </div>
        );
      case 'medium':
        return (
          <div className="space-y-4">
            <p>For medium difficulty puzzles:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Start with islands that have only one or two possible connections</li>
              <li>Pay attention to islands with values 6, 7, or 8 as they will usually require double bridges</li>
              <li>Check your work frequently - a wrong bridge early can make the puzzle unsolvable</li>
            </ul>
          </div>
        );
      default: // easy or custom
        return (
          <div className="space-y-4">
            <p>For beginners:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Start with islands of value 1 - they can only connect in one direction</li>
              <li>Look for corner islands as they have limited connection options</li>
              <li>Use the undo button if you make a mistake</li>
            </ul>
          </div>
        );
    }
  };

  const tutorialSteps: TutorialStep[] = [
    {
      title: "Welcome to Hashi!",
      content: (
        <div className="space-y-4">
          <p>Hashi (Bridges) is a puzzle game where you connect islands with bridges.</p>
          <p>Each island has a number that tells you exactly how many bridges must connect to it.</p>
          <p>Let's learn how to play!</p>
        </div>
      )
    },
    {
      title: "Basic Rules",
      content: (
        <div className="space-y-4">
          <p>The rules of Hashi are simple:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Connect islands with bridges so that each island has exactly the number of bridges shown on it</li>
            <li>Bridges can only run horizontally or vertically</li>
            <li>Bridges cannot cross other bridges or islands</li>
            <li>A maximum of two bridges can connect any pair of islands</li>
            <li>All islands must be connected together in a single network</li>
          </ul>
        </div>
      )
    },
    {
      title: "How to Play",
      content: (
        <div className="space-y-4">
          <p>Controls:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Mobile:</strong> Drag your finger from one island to another to connect them</li>
            <li><strong>Desktop:</strong> Click an island, then click another island to connect them, or drag between islands</li>
            <li>Tap/click the same connection again to add a second bridge</li>
            <li>Tap/click a double bridge to remove it completely</li>
          </ul>
        </div>
      )
    },
    {
      title: "Island Colors",
      content: (
        <div className="space-y-4">
          <p>Islands change color to help you track your progress:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Default color:</strong> The island needs more bridges</li>
            <li><strong>Green:</strong> The island has exactly the right number of bridges</li>
            <li><strong>Yellow/Orange:</strong> The island has incorrect connections (usually too many bridges)</li>
          </ul>
          <p>The goal is to make all islands turn green!</p>
        </div>
      )
    },
    {
      title: `Tips for ${targetDifficulty.charAt(0).toUpperCase() + targetDifficulty.slice(1)} Puzzles`,
      content: getDifficultySpecificTips()
    }
  ];

  // Handle next/previous step logic
  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    onFinish();
    onClose();
  };

  // Reset to first step when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Tutorial: {tutorialSteps[currentStep].title}</span>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6 rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {isMobile ? (
          // Mobile view - step by step tutorial
          <div className="py-4">
            <div className="space-y-4 min-h-[150px]">
              {tutorialSteps[currentStep].content}
            </div>
            
            <div className="flex items-center justify-between mt-6">
              <Button 
                variant="outline" 
                onClick={handlePrevious} 
                disabled={currentStep === 0}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              
              <span className="text-sm text-muted-foreground">
                {currentStep + 1}/{tutorialSteps.length}
              </span>
              
              <Button 
                onClick={handleNext}
                className="flex items-center gap-1"
              >
                {currentStep < tutorialSteps.length - 1 ? (
                  <>Next <ChevronRight className="h-4 w-4" /></>
                ) : (
                  'Get Started'
                )}
              </Button>
            </div>
          </div>
        ) : (
          // Desktop view - tabbed tutorial with more content
          <Tabs defaultValue="basics" value={currentTab} onValueChange={setCurrentTab} className="w-full mt-4">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="basics">Basics</TabsTrigger>
              <TabsTrigger value="controls">Controls</TabsTrigger>
              <TabsTrigger value="tips">Tips & Tricks</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basics" className="space-y-4 py-4 min-h-[200px]">
              <h3 className="font-medium text-lg">Rules of Hashi</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Connect islands with bridges</li>
                <li>Each island must have exactly the number of bridges shown on it</li>
                <li>Bridges run horizontally or vertically</li>
                <li>Bridges cannot cross other bridges or islands</li>
                <li>Maximum of two bridges between any islands</li>
                <li>All islands must form one connected network</li>
              </ul>
            </TabsContent>
            
            <TabsContent value="controls" className="space-y-4 py-4 min-h-[200px]">
              <h3 className="font-medium text-lg">How to Play</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">On Mobile:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Drag from one island to another to connect</li>
                    <li>Tap an existing bridge to upgrade it to a double bridge</li>
                    <li>Tap a double bridge to remove it</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">On Desktop:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Click an island, then click another to connect</li>
                    <li>Or drag between islands to connect</li>
                    <li>Use the undo button to revert mistakes</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-medium">Island Colors:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Green:</strong> Correct number of bridges</li>
                  <li><strong>Yellow/Orange:</strong> Incorrect connections</li>
                  <li><strong>Default:</strong> Needs more bridges</li>
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="tips" className="space-y-4 py-4 min-h-[200px]">
              <h3 className="font-medium text-lg">Strategy Tips</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">For Beginners:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Start with islands that have a value of 1</li>
                    <li>Look at corner islands - they have limited possible connections</li>
                    <li>Islands with high values (relative to how many neighbors they have) will usually need double bridges</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium">Advanced Techniques:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Count the total bridges needed in a section of the puzzle</li>
                    <li>Sometimes you must place a bridge to prevent isolated islands</li>
                    <li>Process of elimination can reveal which bridges must be added</li>
                  </ul>
                </div>
                {getDifficultySpecificTips()}
              </div>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter className="sm:justify-end">
          <Button onClick={handleFinish} variant="default">
            {isMobile ? 'Skip Tutorial' : 'Start Playing'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TutorialOverlay;
