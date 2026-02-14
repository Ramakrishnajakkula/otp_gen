import { useEffect, useMemo, useRef, useState } from 'react';

import { otpManager } from '../services/otpManager';
import { formatDuration } from '../utils/time';

export const useOtpCountdown = (email: string, refreshKey = 0) => {
  const [remainingMs, setRemainingMs] = useState(() => otpManager.getRemainingMs(email));
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setRemainingMs(otpManager.getRemainingMs(email));
  }, [email, refreshKey]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemainingMs(otpManager.getRemainingMs(email));
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [email, refreshKey]);

  const formatted = useMemo(() => formatDuration(remainingMs), [remainingMs]);
  const isExpired = remainingMs <= 0;

  return { remainingMs, formatted, isExpired };
};
