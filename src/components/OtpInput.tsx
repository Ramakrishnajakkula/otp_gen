import { useMemo, useRef } from 'react';
import {
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from 'react-native';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface OtpInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: string;
  disabled?: boolean;
}

export const OtpInput = ({
  label = 'One-Time Password',
  value,
  onChange,
  length = 6,
  error,
  disabled,
}: OtpInputProps) => {
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const digits = useMemo(() => Array.from({ length }, (_, index) => value[index] ?? ''), [
    value,
    length,
  ]);

  const focusAt = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const handleDigitChange = (text: string, index: number) => {
    if (disabled) {
      return;
    }

    const sanitized = text.replace(/\D/g, '');

    if (sanitized.length > 1) {
      const next = sanitized.slice(0, length);
      onChange(next);
      focusAt(Math.min(next.length, length - 1));
      return;
    }

    const nextDigits = [...digits];
    nextDigits[index] = sanitized ?? '';
    const merged = nextDigits.join('');
    onChange(merged);

    if (sanitized && index < length - 1) {
      focusAt(index + 1);
    }
  };

  const handleKeyPress = (
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (event.nativeEvent.key !== 'Backspace') {
      return;
    }

    if (digits[index]) {
      return;
    }

    const prevIndex = Math.max(0, index - 1);
    const nextDigits = [...digits];
    nextDigits[prevIndex] = '';
    onChange(nextDigits.join(''));
    focusAt(prevIndex);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        {digits.map((digit, index) => (
          <TextInput
            key={index}
            ref={(node) => {
              inputRefs.current[index] = node;
            }}
            style={[
              styles.input,
              index < length - 1 ? styles.inputSpacing : undefined,
              error ? styles.inputError : undefined,
            ]}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleDigitChange(text, index)}
            onKeyPress={(event) => handleKeyPress(event, index)}
            editable={!disabled}
            selectTextOnFocus
            textContentType="oneTimeCode"
            importantForAutofill="yes"
          />
        ))}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },
  input: {
    flex: 1,
    minWidth: 44,
    maxWidth: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    color: colors.textPrimary,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
  },
  inputSpacing: {
    marginRight: spacing.xs,
  },
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    marginTop: spacing.xs,
    color: colors.danger,
    fontSize: 13,
  },
});
