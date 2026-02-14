import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { colors } from '../theme/colors';
import type { SessionState } from '../types/auth';
import { appendSessionHistory } from '../services/sessionHistory';

const STORAGE_KEY = '@secure-auth/session';

type SessionContextValue = {
  session: SessionState | null;
  startSession: (email: string) => void;
  endSession: () => void;
  hydrated: boolean;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<SessionState | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setSession(JSON.parse(stored));
        }
      } catch (error) {
        console.warn('Failed to hydrate session', error);
      } finally {
        setHydrated(true);
      }
    };

    hydrate();
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const persist = async () => {
      try {
        if (session) {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        } else {
          await AsyncStorage.removeItem(STORAGE_KEY);
        }
      } catch (error) {
        console.warn('Failed to persist session', error);
      }
    };

    persist();
  }, [session, hydrated]);

  const startSession = (email: string) => {
    setSession({ email, startedAt: Date.now() });
  };

  const endSession = () => {
    setSession((current) => {
      if (current) {
        const endedAt = Date.now();
        void appendSessionHistory({
          email: current.email,
          startedAt: current.startedAt,
          endedAt,
          durationMs: endedAt - current.startedAt,
        });
      }
      return null;
    });
  };

  const value = useMemo(
    () => ({ session, startSession, endSession, hydrated }),
    [session, hydrated],
  );

  if (!hydrated) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export const useSessionContext = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSessionContext must be used inside SessionProvider');
  }
  return context;
};
