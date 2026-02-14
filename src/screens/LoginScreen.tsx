import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { TextField } from '../components/TextField';
import { logAnalyticsEvent } from '../services/analytics';
import { otpManager } from '../services/otpManager';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import type { RootStackParamList } from '../types/navigation';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LoginNavigation = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export const LoginScreen = () => {
  const navigation = useNavigation<LoginNavigation>();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const sanitizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);
  const isEmailValid = useMemo(() => EMAIL_REGEX.test(sanitizedEmail), [sanitizedEmail]);

  const handleSendOtp = async () => {
    if (!isEmailValid) {
      setError('Enter a valid email to continue.');
      return;
    }

    setLoading(true);
    setError('');
    setStatus('');

    try {
      const record = otpManager.generateOtp(sanitizedEmail);
      await logAnalyticsEvent('otp_generated', {
        email: sanitizedEmail,
        expiresAt: record.expiresAt,
      });
      setStatus('OTP generated successfully. Please check your email.');
      if (__DEV__) {
        setDevOtp(record.code);
      }
      navigation.navigate('Otp', {
        email: sanitizedEmail,
        debugOtp: __DEV__ ? record.code : undefined,
      });
    } catch (err) {
      setError('Unable to generate OTP. Please try again.');
      console.warn('Failed to send OTP', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer
      title="Passwordless Login"
      subtitle="Enter your email to receive a one-time password."
    >
      <View style={styles.card}>
        <TextField
          label="Work Email"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholder="you@company.com"
          error={error}
        />
        <PrimaryButton
          title="Send OTP"
          onPress={handleSendOtp}
          disabled={!isEmailValid}
          loading={loading}
        />
        {status ? <Text style={styles.status}>{status}</Text> : null}
        {__DEV__ && devOtp ? (
          <Text style={styles.debugText}>Debug OTP: {devOtp}</Text>
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
  status: {
    color: colors.success,
    marginTop: spacing.sm,
  },
  debugText: {
    marginTop: spacing.md,
    fontSize: 12,
    color: colors.textSecondary,
  },
});
