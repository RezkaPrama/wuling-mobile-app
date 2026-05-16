import { borderRadius, typography } from '@/src/theme';
import { StyleSheet, Text, View } from 'react-native';

type BadgeVariant = 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple';

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  blue:   { bg: '#DBEAFE', text: '#1D4ED8' },
  green:  { bg: '#D1FAE5', text: '#065F46' },
  yellow: { bg: '#FEF3C7', text: '#92400E' },
  red:    { bg: '#FEE2E2', text: '#991B1B' },
  gray:   { bg: '#F3F4F6', text: '#374151' },
  purple: { bg: '#EDE9FE', text: '#5B21B6' },
};

const statusVariantMap: Record<string, BadgeVariant> = {
  scheduled:          'blue',
  in_progress:        'blue',
  completed:          'green',
  overdue:            'red',
  pending_validation: 'purple',
  pending:            'yellow',
  upcoming:           'gray',
};

interface BadgeProps {
  status: string;
  label: string;
}

export function Badge({ status, label }: BadgeProps) {
  const variant = statusVariantMap[status] ?? 'gray';
  const { bg, text } = variantStyles[variant];

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  text: {
    ...typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});