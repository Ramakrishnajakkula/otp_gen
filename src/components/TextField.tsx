import { forwardRef } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(({ label, error, ...props }, ref) => (
  <View style={styles.container}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      ref={ref}
      placeholderTextColor={colors.textSecondary}
      style={[styles.input, error ? styles.inputError : undefined]}
      {...props}
    />
    {error ? <Text style={styles.error}>{error}</Text> : null}
  </View>
));

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 12,
    color: colors.textPrimary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
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

TextField.displayName = 'TextField';
