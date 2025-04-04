
/**
 * Provides haptic feedback functionality using the navigator.vibrate API
 * This will work on mobile devices with browsers that support the Vibration API
 */

// Check if the device supports vibration
const hasVibrationSupport = (): boolean => {
  return 'vibrate' in navigator;
};

// Different vibration patterns for various game events
export const hapticFeedback = {
  // Short vibration for standard interactions (placing a single bridge)
  light: (isEnabled: boolean = true) => {
    if (isEnabled && hasVibrationSupport()) {
      navigator.vibrate(10);
    }
  },
  
  // Medium vibration for more significant actions (placing a double bridge)
  medium: (isEnabled: boolean = true) => {
    if (isEnabled && hasVibrationSupport()) {
      navigator.vibrate(20);
    }
  },
  
  // Pattern for completing a puzzle
  success: (isEnabled: boolean = true) => {
    if (isEnabled && hasVibrationSupport()) {
      // Pattern: vibrate 100ms, pause 50ms, vibrate 100ms
      navigator.vibrate([100, 50, 100]);
    }
  },
  
  // Pattern for invalid moves or errors
  error: (isEnabled: boolean = true) => {
    if (isEnabled && hasVibrationSupport()) {
      // Two short bursts
      navigator.vibrate([30, 30, 30]);
    }
  }
};

// Check if haptic feedback is available on the current device
export const isHapticFeedbackAvailable = (): boolean => {
  return hasVibrationSupport();
};
