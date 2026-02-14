import AsyncStorage from '@react-native-async-storage/async-storage';

import type { SessionHistoryEntry } from '../types/auth';

const STORAGE_KEY = '@secure-auth/session-history';
const MAX_ENTRIES = 20;

export const appendSessionHistory = async (entry: SessionHistoryEntry): Promise<void> => {
  try {
    const serialized = await AsyncStorage.getItem(STORAGE_KEY);
    const entries: SessionHistoryEntry[] = serialized ? JSON.parse(serialized) : [];
    const merged = [entry, ...entries].slice(0, MAX_ENTRIES);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch (error) {
    console.warn('Failed to append session history', error);
  }
};

export const getSessionHistory = async (): Promise<SessionHistoryEntry[]> => {
  try {
    const serialized = await AsyncStorage.getItem(STORAGE_KEY);
    return serialized ? (JSON.parse(serialized) as SessionHistoryEntry[]) : [];
  } catch (error) {
    console.warn('Failed to read session history', error);
    return [];
  }
};
