import { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'solid' | 'outline' | 'ghost';
  accessory?: ReactNode;
}

export const PrimaryButton = ({
  title,
  onPress,
  disabled,
  loading,
  variant = 'solid',
  accessory,
}: PrimaryButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        isDisabled ? styles.disabled : undefined,
        pressed && !isDisabled ? styles.pressed : undefined,
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'solid' ? colors.textPrimary : colors.accent} />
      ) : (
        <View style={styles.content}>
          <Text style={[styles.label, labelStyles[variant]]}>{title}</Text>
          {accessory}
        </View>
      )}
    </Pressable>
  );
};

const baseButton: ViewStyle = {
  borderRadius: 14,
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.lg,
  alignItems: 'center',
  justifyContent: 'center',
};

const styles = StyleSheet.create({
  base: {
    ...baseButton,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const variantStyles = StyleSheet.create({
  solid: {
    backgroundColor: colors.accent,
  },
  outline: {
    backgroundColor: 'transparent',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
});

const labelStyles = StyleSheet.create({
  solid: {
    color: colors.background,
  },
  outline: {
    color: colors.textPrimary,
  },
  ghost: {
    color: colors.accentMuted,
  },
});
