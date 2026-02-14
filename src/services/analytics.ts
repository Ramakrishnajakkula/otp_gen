import AsyncStorage from '@react-native-async-storage/async-storage';

export type AnalyticsEventType =
  | 'otp_generated'
  | 'otp_validation_success'
  | 'otp_validation_failure'
  | 'logout';

export type AnalyticsEvent = {
  id: string;
  type: AnalyticsEventType;
  timestamp: number;
  payload?: Record<string, unknown>;
};

const STORAGE_KEY = '@secure-auth/analytics-events';
const MAX_EVENTS = 100;

export const logAnalyticsEvent = async (
  type: AnalyticsEventType,
  payload?: Record<string, unknown>,
): Promise<void> => {
  const event: AnalyticsEvent = {
    id: `${type}-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
    type,
    timestamp: Date.now(),
    payload,
  };

  try {
    const serialized = await AsyncStorage.getItem(STORAGE_KEY);
    const events: AnalyticsEvent[] = serialized ? JSON.parse(serialized) : [];
    events.push(event);
    if (events.length > MAX_EVENTS) {
      events.shift();
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (error) {
    console.warn('Failed to persist analytics event', error);
  }
};

export const readAnalyticsEvents = async (): Promise<AnalyticsEvent[]> => {
  try {
    const serialized = await AsyncStorage.getItem(STORAGE_KEY);
    return serialized ? (JSON.parse(serialized) as AnalyticsEvent[]) : [];
  } catch (error) {
    console.warn('Failed to read analytics events', error);
    return [];
  }
};
