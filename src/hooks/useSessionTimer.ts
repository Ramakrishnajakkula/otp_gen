import { useEffect, useMemo, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

import { formatDuration } from '../utils/time';

export const useSessionTimer = (startTime: number | null, isActive: boolean) => {
  const [elapsedMs, setElapsedMs] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appStateListenerRef = useRef<ReturnType<typeof AppState.addEventListener> | null>(
    null,
  );

  useEffect(() => {
    if (!startTime || !isActive) {
      clearTimer();
      setElapsedMs(0);
      return;
    }

    const syncTime = () => {
      setElapsedMs(Date.now() - startTime);
    };

    syncTime();
    intervalRef.current = setInterval(syncTime, 1000);

    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        syncTime();
      }
    };

    appStateListenerRef.current = AppState.addEventListener('change', handleAppState);

    return () => {
      clearTimer();
    };
  }, [startTime, isActive]);

  const formatted = useMemo(() => formatDuration(elapsedMs), [elapsedMs]);

  return {
    elapsedMs,
    formatted,
  };

  function clearTimer() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    appStateListenerRef.current?.remove();
    appStateListenerRef.current = null;
  }
};
