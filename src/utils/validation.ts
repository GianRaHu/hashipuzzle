import { Puzzle, Bridge } from './gameLogic';

export function validatePuzzle(puzzle: Puzzle): boolean {
  if (!puzzle.solution) return false;

  const currentBridges = new Set(
    puzzle.bridges.map(bridge => `${bridge.startIslandId}-${bridge.endIslandId}-${bridge.count}`)
  );

  const solutionBridges = new Set(
    puzzle.solution.map(bridge => `${bridge.startIslandId}-${bridge.endIslandId}-${bridge.count}`)
  );

  return (
    currentBridges.size === solutionBridges.size &&
    Array.from(currentBridges).every(bridge => solutionBridges.has(bridge))
  );
}

export function getHint(puzzle: Puzzle): Bridge | null {
  if (!puzzle.solution) return null;

  for (const solutionBridge of puzzle.solution) {
    const currentBridge = puzzle.bridges.find(
      b => b.startIslandId === solutionBridge.startIslandId && 
           b.endIslandId === solutionBridge.endIslandId
    );

    if (!currentBridge || currentBridge.count !== solutionBridge.count) {
      return solutionBridge;
    }
  }

  return null;
}

export function checkProgress(puzzle: Puzzle): number {
  if (!puzzle.solution) return 0;

  const totalBridges = puzzle.solution.reduce((sum, bridge) => sum + bridge.count, 0);
  const correctBridges = puzzle.bridges.reduce((sum, bridge) => {
    const solutionBridge = puzzle.solution?.find(
      sb => sb.startIslandId === bridge.startIslandId && 
            sb.endIslandId === bridge.endIslandId
    );
    return sum + (solutionBridge && bridge.count === solutionBridge.count ? bridge.count : 0);
  }, 0);

  return Math.round((correctBridges / totalBridges) * 100);
}
