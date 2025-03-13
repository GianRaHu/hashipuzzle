import React from 'react';
import { formatTime } from '@/utils/storage';

interface TimerProps {
  startTime: number;
  endTime?: number;
}

const Timer: React.FC<TimerProps> = ({ startTime, endTime }) => {
  const [currentTime, setCurrentTime] = React.useState<number>(0);

  React.useEffect(() => {
    if (!startTime) return;

    // If the game has ended, just show the final time
    if (endTime) {
      const elapsed = endTime - startTime;
      setCurrentTime(elapsed);
      return;
    }

    // Otherwise, update the timer every second
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setCurrentTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, endTime]);

  return (
    <div className="text-lg font-mono">
      {formatTime(currentTime)}
    </div>
  );
};

export default React.memo(Timer);
