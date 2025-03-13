import { App } from '@capacitor/app';
import { Toast } from '@capacitor/toast';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { store } from '../store';
import { toast } from '../components/Toast';

interface GameState {
  isPlaying: boolean;
  lastUpdateTime: number;
  currentPuzzle: any; // Replace with your actual puzzle type
}

export class PlatformManager {
  private static instance: PlatformManager;
  private gameState: GameState = {
    isPlaying: false,
    lastUpdateTime: Date.now(),
    currentPuzzle: null
  };

  private constructor() {
    this.setupEventListeners();
  }

  public static getInstance(): PlatformManager {
    if (!PlatformManager.instance) {
      PlatformManager.instance = new PlatformManager();
    }
    return PlatformManager.instance;
  }

  private setupEventListeners() {
    // Back button handler
    App.addListener('backButton', async ({ canGoBack }) => {
      if (this.gameState.isPlaying) {
        // If in game, show confirmation
        await this.showExitConfirmation();
      } else if (canGoBack) {
        window.history.back();
      } else {
        await App.exitApp();
      }
    });

    // App state change handler
    App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        this.handleAppResume();
      } else {
        this.handleAppPause();
      }
    });

    // Handle browser visibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.handleAppPause();
      } else {
        this.handleAppResume();
      }
    });
  }

  private async showExitConfirmation() {
    const shouldExit = window.confirm('Are you sure you want to exit? Your progress will be saved.');
    if (shouldExit) {
      this.saveGameState();
      await App.exitApp();
    }
  }

  private handleAppPause() {
    if (this.gameState.isPlaying) {
      this.saveGameState();
      store.dispatch({ type: 'GAME_PAUSED' });
    }
  }

  private handleAppResume() {
    if (this.gameState.isPlaying) {
      const now = Date.now();
      const timeDiff = now - this.gameState.lastUpdateTime;
      
      if (timeDiff > 300000) { // 5 minutes
        toast.show({
          title: 'Welcome Back',
          message: 'Your game was paused. Tap to continue.',
          action: {
            label: 'Continue',
            onClick: () => this.resumeGame()
          }
        });
      } else {
        this.resumeGame();
      }
    }
  }

  private saveGameState() {
    try {
      const state = store.getState();
      localStorage.setItem('gameState', JSON.stringify({
        puzzle: this.gameState.currentPuzzle,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  }

  public async resumeGame() {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
      store.dispatch({ type: 'GAME_RESUMED' });
      this.gameState.isPlaying = true;
      this.gameState.lastUpdateTime = Date.now();
    } catch (error) {
      console.error('Failed to resume game:', error);
    }
  }

  public async pauseGame() {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
      this.saveGameState();
      store.dispatch({ type: 'GAME_PAUSED' });
      this.gameState.isPlaying = false;
    } catch (error) {
      console.error('Failed to pause game:', error);
    }
  }

  public setCurrentPuzzle(puzzle: any) {
    this.gameState.currentPuzzle = puzzle;
  }
}

// Export singleton instance
export const platformManager = PlatformManager.getInstance();
