export const colors = {
  primary: '#D91E1E',
  primaryDark: '#B01818',
  primaryLight: '#F5B8B8',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  error: '#DC2626',
  success: '#16A34A',
  warning: '#D97706',
  border: '#E5E7EB',
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    disabled: '#9CA3AF',
    inverse: '#FFFFFF',
    hint: '#F87171',
  },
  status: {
    scheduled: '#3B82F6',
    in_progress: '#F59E0B',
    completed: '#10B981',
    overdue: '#EF4444',
    pending_validation: '#8B5CF6',
  },
};

export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
};

export const borderRadius = {
  sm: 4, md: 8, lg: 12, xl: 16, xxl: 40, full: 9999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const },
  h2: { fontSize: 22, fontWeight: '700' as const },
  h3: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  bodyMd: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  label: { fontSize: 13, fontWeight: '500' as const },
};