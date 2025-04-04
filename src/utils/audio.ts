
/**
 * Manages background music functionality for the game
 */

class AudioManager {
  private bgMusic: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.5;

  constructor() {
    // Create audio element when the manager is instantiated
    if (typeof window !== 'undefined') {
      this.bgMusic = new Audio('/music/relaxing-background.mp3');
      this.bgMusic.loop = true;
      this.bgMusic.volume = this.volume;
    }
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.bgMusic) {
      this.bgMusic.volume = this.volume;
    }
  }

  public play(): void {
    if (this.bgMusic && !this.isPlaying) {
      const playPromise = this.bgMusic.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.isPlaying = true;
          })
          .catch(error => {
            console.error('Audio playback failed:', error);
            // Most browsers require user interaction before playing audio
          });
      }
    }
  }

  public pause(): void {
    if (this.bgMusic && this.isPlaying) {
      this.bgMusic.pause();
      this.isPlaying = false;
    }
  }

  public toggle(shouldPlay: boolean): void {
    if (shouldPlay) {
      this.play();
    } else {
      this.pause();
    }
  }
}

// Create a singleton instance
const audioManager = new AudioManager();
export default audioManager;
