
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Eye, Target, HelpCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Puzzle, Island } from '@/utils/gameLogic';

interface HintSystemProps {
  puzzle: Puzzle;
  onHighlightIslands?: (islands: string[]) => void;
  onHintUsed?: () => void;
  hintsRemaining: number;
}

const HintSystem: React.FC<HintSystemProps> = ({ 
  puzzle, 
  onHighlightIslands, 
  onHintUsed,
  hintsRemaining
}) => {
  const [showHintPanel, setShowHintPanel] = useState(false);
  const [lastHint, setLastHint] = useState<string>('');
  const { toast } = useToast();

  const analyzeIslandConstraints = (island: Island): string[] => {
    const hints: string[] = [];
    
    // Find islands that must connect in specific ways
    if (island.value === 1) {
      hints.push(`Island ${island.id} (value 1) can only have one connection.`);
    }
    
    // Count possible directions
    const possibleConnections = puzzle.islands.filter(other => 
      other.id !== island.id && 
      (other.row === island.row || other.col === island.col)
    );
    
    if (island.value === possibleConnections.length * 2) {
      hints.push(`Island ${island.id} must connect to all possible neighbors with double bridges.`);
    }
    
    if (island.value === possibleConnections.length) {
      hints.push(`Island ${island.id} must connect to all possible neighbors with single bridges.`);
    }
    
    return hints;
  };

  const getBasicHint = (): string => {
    // Look for obvious moves
    for (const island of puzzle.islands) {
      const currentConnections = puzzle.bridges.reduce((sum, bridge) => {
        if (bridge.startIslandId === island.id || bridge.endIslandId === island.id) {
          return sum + bridge.count;
        }
        return sum;
      }, 0);
      
      const remaining = island.value - currentConnections;
      
      if (remaining === 0) continue;
      
      // Find islands with value 1 that aren't connected
      if (island.value === 1 && currentConnections === 0) {
        return `Look for island with value 1 - it can only connect in one direction!`;
      }
      
      // Find islands that need exactly their remaining connections
      const possibleNeighbors = puzzle.islands.filter(other => 
        other.id !== island.id && 
        (other.row === island.row || other.col === island.col) &&
        !puzzle.islands.some(blocker => 
          blocker.id !== island.id && 
          blocker.id !== other.id &&
          ((blocker.row === island.row && blocker.row === other.row &&
            blocker.col > Math.min(island.col, other.col) &&
            blocker.col < Math.max(island.col, other.col)) ||
           (blocker.col === island.col && blocker.col === other.col &&
            blocker.row > Math.min(island.row, other.row) &&
            blocker.row < Math.max(island.row, other.row)))
        )
      );
      
      if (possibleNeighbors.length === 1 && remaining > 0) {
        return `Island with value ${island.value} has only one possible connection left!`;
      }
    }
    
    return "Look for islands with the fewest possible connections to start with.";
  };

  const getAdvancedHint = (): string => {
    // Look for more complex logical deductions
    const isolatedGroups = findIsolatedGroups();
    
    if (isolatedGroups.length > 1) {
      return "Some islands form separate groups. Make sure all islands are connected!";
    }
    
    // Look for forced connections to prevent isolation
    for (const island of puzzle.islands) {
      const reachableIslands = findReachableIslands(island.id);
      if (reachableIslands.length < puzzle.islands.length) {
        return "Check if any islands might become isolated from the main group.";
      }
    }
    
    return "Try working backwards from islands that are almost complete.";
  };

  const findIsolatedGroups = (): string[][] => {
    const visited = new Set<string>();
    const groups: string[][] = [];
    
    for (const island of puzzle.islands) {
      if (!visited.has(island.id)) {
        const group = findConnectedGroup(island.id, visited);
        groups.push(group);
      }
    }
    
    return groups;
  };

  const findConnectedGroup = (startId: string, visited: Set<string>): string[] => {
    const group: string[] = [];
    const queue: string[] = [startId];
    
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      
      visited.add(currentId);
      group.push(currentId);
      
      // Find connected islands through bridges
      const connectedIslands = puzzle.bridges
        .filter(bridge => bridge.startIslandId === currentId || bridge.endIslandId === currentId)
        .map(bridge => bridge.startIslandId === currentId ? bridge.endIslandId : bridge.startIslandId)
        .filter(id => !visited.has(id));
      
      queue.push(...connectedIslands);
    }
    
    return group;
  };

  const findReachableIslands = (startId: string): string[] => {
    const visited = new Set<string>();
    return findConnectedGroup(startId, visited);
  };

  const handleBasicHint = () => {
    if (hintsRemaining <= 0) {
      toast({
        title: "No hints remaining",
        description: "You've used all your hints for this puzzle.",
        variant: "destructive"
      });
      return;
    }
    
    const hint = getBasicHint();
    setLastHint(hint);
    setShowHintPanel(true);
    onHintUsed?.();
    
    toast({
      title: "Hint",
      description: hint,
      duration: 5000
    });
  };

  const handleAdvancedHint = () => {
    if (hintsRemaining <= 0) {
      toast({
        title: "No hints remaining",
        description: "You've used all your hints for this puzzle.",
        variant: "destructive"
      });
      return;
    }
    
    const hint = getAdvancedHint();
    setLastHint(hint);
    setShowHintPanel(true);
    onHintUsed?.();
    
    toast({
      title: "Advanced Hint",
      description: hint,
      duration: 7000
    });
  };

  const handleHighlightMove = () => {
    if (hintsRemaining <= 0) {
      toast({
        title: "No hints remaining",
        description: "You've used all your hints for this puzzle.",
        variant: "destructive"
      });
      return;
    }
    
    // Find islands with value 1 or obvious moves
    const obviousIslands = puzzle.islands.filter(island => {
      const currentConnections = puzzle.bridges.reduce((sum, bridge) => {
        if (bridge.startIslandId === island.id || bridge.endIslandId === island.id) {
          return sum + bridge.count;
        }
        return sum;
      }, 0);
      
      return island.value === 1 && currentConnections === 0;
    });
    
    if (obviousIslands.length > 0) {
      onHighlightIslands?.(obviousIslands.map(i => i.id));
      onHintUsed?.();
      
      toast({
        title: "Islands highlighted",
        description: "Look at the highlighted islands for obvious moves.",
        duration: 4000
      });
    } else {
      toast({
        title: "No obvious moves",
        description: "Try using a basic hint instead.",
        duration: 3000
      });
    }
  };

  return (
    <div className="space-y-2">
      {/* Hint Buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={handleBasicHint}
          disabled={hintsRemaining <= 0}
          className="flex items-center gap-1"
        >
          <Lightbulb className="h-4 w-4" />
          <span className="hidden sm:inline">Basic Hint</span>
          <span className="sm:hidden">Hint</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleAdvancedHint}
          disabled={hintsRemaining <= 0}
          className="flex items-center gap-1"
        >
          <Target className="h-4 w-4" />
          <span className="hidden sm:inline">Advanced</span>
          <span className="sm:hidden">Adv</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleHighlightMove}
          disabled={hintsRemaining <= 0}
          className="flex items-center gap-1"
        >
          <Eye className="h-4 w-4" />
          <span className="hidden sm:inline">Highlight</span>
          <span className="sm:hidden">Show</span>
        </Button>
      </div>

      {/* Hints Remaining Badge */}
      <div className="flex justify-center">
        <Badge variant={hintsRemaining > 0 ? "secondary" : "destructive"} className="text-xs">
          {hintsRemaining} hints remaining
        </Badge>
      </div>

      {/* Hint Panel */}
      {showHintPanel && lastHint && (
        <Card className="mt-3">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Hint
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHintPanel(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">{lastHint}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HintSystem;
