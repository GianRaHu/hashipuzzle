
/**
 * Formats time in milliseconds to a readable MM:SS format
 * @param timeInMs Time in milliseconds
 * @returns Formatted time string
 */
export const formatTime = (timeInMs: number): string => {
  // Convert milliseconds to seconds
  const totalSeconds = Math.floor(timeInMs / 1000);
  
  // Calculate minutes and seconds
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  // Format with leading zeros
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Formats time in milliseconds to include hours if needed
 * @param timeInMs Time in milliseconds
 * @returns Formatted time string (HH:MM:SS or MM:SS)
 */
export const formatTimeExtended = (timeInMs: number): string => {
  // Convert milliseconds to seconds
  const totalSeconds = Math.floor(timeInMs / 1000);
  
  // Calculate hours, minutes and seconds
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  // Format with leading zeros
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};
