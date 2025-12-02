import { useState, useEffect } from 'react';

interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export function useTestTimer(deadline?: string) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);
  const [isOvertime, setIsOvertime] = useState(false);

  useEffect(() => {
    if (!deadline) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(deadline).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setIsOvertime(true);
        setTimeRemaining(null);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ hours, minutes, seconds, total: diff });
      setIsOvertime(false);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  return { timeRemaining, isOvertime };
}

