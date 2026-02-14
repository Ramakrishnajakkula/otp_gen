import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { OtpInput } from '../components/OtpInput';
import { useSessionContext } from '../context/SessionProvider';
import { useOtpCountdown } from '../hooks/useOtpCountdown';
import { logAnalyticsEvent } from '../services/analytics';
import { otpManager } from '../services/otpManager';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import type { RootStackParamList } from '../types/navigation';

const OTP_LENGTH = 6;

type OtpRoute = RouteProp<RootStackParamList, 'Otp'>;
type OtpNavigation = NativeStackNavigationProp<RootStackParamList, 'Otp'>;

export const OtpScreen = () => {
  const navigation = useNavigation<OtpNavigation>();
  const route = useRoute<OtpRoute>();
  const { startSession } = useSessionContext();
  const { email, debugOtp: initialDebugOtp } = route.params;

  const [otpValue, setOtpValue] = useState('');
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [otpVersion, setOtpVersion] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(() => otpManager.getAttemptsLeft(email));
  const [debugOtp, setDebugOtp] = useState<string | null>(initialDebugOtp ?? null);

  const countdown = useOtpCountdown(email, otpVersion);

  const formattedEmail = useMemo(() => email.toLowerCase(), [email]);
  const canVerify =
    otpValue.length === OTP_LENGTH && !countdown.isExpired && attemptsLeft > 0;

  const handleVerify = async () => {
    setError('');
    setFeedback('');

    const result = otpManager.validateOtp(email, otpValue);

    if (result.status === 'success') {
      await logAnalyticsEvent('otp_validation_success', { email: formattedEmail });
      startSession(email);
      navigation.reset({ index: 0, routes: [{ name: 'Session' }] });
      return;
    }

    await logAnalyticsEvent('otp_validation_failure', {
      email: formattedEmail,
      reason: result.status,
    });

    switch (result.status) {
      case 'expired':
      case 'missing':
        setError('OTP expired. Please request a new code.');
        break;
      case 'attempts_exceeded':
        setError('Maximum attempts exceeded. Generate a new OTP.');
        setAttemptsLeft(0);
        break;
      case 'invalid':
        setError('Incorrect OTP. Please try again.');
        setAttemptsLeft(result.attemptsLeft);
        break;
      default:
        setError('Something went wrong. Try again.');
        break;
    }
  };

  const handleResend = async () => {
    const record = otpManager.generateOtp(email);
    await logAnalyticsEvent('otp_generated', {
      email: formattedEmail,
      expiresAt: record.expiresAt,
      reason: 'resend',
    });
    setOtpVersion((prev) => prev + 1);
    setAttemptsLeft(otpManager.getAttemptsLeft(email));
    setOtpValue('');
    setError('');
    setFeedback('A fresh OTP has been sent.');
    if (__DEV__) {
      setDebugOtp(record.code);
    }
  };

  return (
    <ScreenContainer
      title="Enter OTP"
      subtitle={`We sent a 6-digit code to ${formattedEmail}.`}
    >
      <View style={styles.card}>
        <OtpInput value={otpValue} onChange={setOtpValue} error={error} disabled={attemptsLeft <= 0} />
        <Text style={styles.countdownLabel}>OTP expires in</Text>
        <Text style={[styles.countdownValue, countdown.isExpired && styles.expiredCountdown]}>
          {countdown.formatted}
        </Text>
        <Text style={styles.metaText}>Attempts left: {attemptsLeft}</Text>
        {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
        <PrimaryButton title="Verify" onPress={handleVerify} disabled={!canVerify} />
        <PrimaryButton title="Resend OTP" onPress={handleResend} variant="outline" />
        <Text style={styles.helperText}>Resending invalidates existing codes and resets attempts.</Text>
        {__DEV__ && debugOtp ? (
          <Text style={styles.debugText}>Debug OTP: {debugOtp}</Text>
        ) : null}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  countdownLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  countdownValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.accent,
  },
  expiredCountdown: {
    color: colors.danger,
  },
  metaText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
  },
  feedback: {
    marginTop: spacing.sm,
    color: colors.success,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  debugText: {
    marginTop: spacing.sm,
    fontSize: 12,
    color: colors.textSecondary,
  },
});
