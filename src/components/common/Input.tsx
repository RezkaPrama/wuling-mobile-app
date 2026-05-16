import { borderRadius, colors, spacing, typography } from '@/src/theme';
import { useState } from 'react';
import {
    StyleSheet,
    Text, TextInput,
    TextInputProps,
    View
} from 'react-native';

interface InputProps extends TextInputProps {
  label: string;
  icon?: React.ReactNode;
  error?: string;
}

export function Input({ label, icon, error, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[
        styles.container,
        focused && styles.containerFocused,
        error && styles.containerError,
      ]}>
        {icon && <View style={styles.iconWrapper}>{icon}</View>}
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.text.disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { ...typography.label, color: colors.text.primary },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: spacing.md,
    height: 52,
  },
  containerFocused: { borderColor: colors.primary, backgroundColor: '#FFF5F5' },
  containerError: { borderColor: colors.error },
  iconWrapper: { marginRight: spacing.sm },
  input: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.text.primary,
  },
  error: { ...typography.caption, color: colors.error },
});