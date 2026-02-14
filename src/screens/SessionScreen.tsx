import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { useSessionContext } from '../context/SessionProvider';
import { useSessionTimer } from '../hooks/useSessionTimer';
import { logAnalyticsEvent } from '../services/analytics';
import { getSessionHistory } from '../services/sessionHistory';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import type { SessionHistoryEntry } from '../types/auth';
import type { RootStackParamList } from '../types/navigation';
import { formatDuration } from '../utils/time';

const formatter = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

type SessionNavigation = NativeStackNavigationProp<RootStackParamList, 'Session'>;

export const SessionScreen = () => {
  const navigation = useNavigation<SessionNavigation>();
  const { session, endSession } = useSessionContext();
  const { formatted } = useSessionTimer(session?.startedAt ?? null, Boolean(session));
  const [history, setHistory] = useState<SessionHistoryEntry[]>([]);

  const sessionStartText = useMemo(() => {
    if (!session) {
      return '--:--:--';
    }
    return formatter.format(session.startedAt);
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      getSessionHistory().then((entries) => {
        if (mounted) {
          setHistory(entries);
        }
      });
      return () => {
        mounted = false;
      };
    }, []),
  );

  const handleLogout = async () => {
    if (session) {
      await logAnalyticsEvent('logout', {
        email: session.email,
        durationMs: Date.now() - session.startedAt,
      });
    }
    endSession();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  if (!session) {
    return (
      <ScreenContainer title="Session" subtitle="No active session found.">
        <View style={styles.card}>
          <PrimaryButton title="Back to Login" onPress={handleLogout} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer title="Active Session" subtitle={`Signed in as ${session.email}`}>
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Session Duration</Text>
        <Text style={styles.timer}>{formatted}</Text>
        <View style={styles.divider} />
        <Text style={styles.sectionLabel}>Started</Text>
        <Text style={styles.metaValue}>{sessionStartText}</Text>
      </View>
      {history.length > 0 ? (
        <View style={styles.historyCard}>
          <Text style={styles.sectionLabel}>Recent Sessions</Text>
          {history.slice(0, 3).map((entry) => (
            <View key={`${entry.startedAt}-${entry.endedAt}`} style={styles.historyRow}>
              <View>
                <Text style={styles.historyEmail}>{entry.email}</Text>
                <Text style={styles.historyMeta}>
                  {formatter.format(entry.startedAt)} → {formatter.format(entry.endedAt)}
                </Text>
              </View>
              <Text style={styles.historyDuration}>{formatDuration(entry.durationMs)}</Text>
            </View>
          ))}
        </View>
      ) : null}
      <PrimaryButton title="Logout" onPress={handleLogout} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionLabel: {
    color: colors.textSecondary,
    textTransform: 'uppercase',
    fontSize: 12,
    letterSpacing: 1,
  },
  timer: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.textPrimary,
    marginVertical: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  metaValue: {
    fontSize: 20,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  historyCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  historyEmail: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  historyMeta: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  historyDuration: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '700',
  },
});
