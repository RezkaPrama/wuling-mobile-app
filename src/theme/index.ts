export const colors = {
  primary: '#1E40AF',
  secondary: '#3B82F6',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  error: '#DC2626',
  success: '#16A34A',
  warning: '#D97706',
  border: '#E2E8F0',
  text: {
    primary: '#0F172A',
    secondary: '#64748B',
    disabled: '#94A3B8',
    inverse: '#FFFFFF',
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
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const },
  h2: { fontSize: 22, fontWeight: '600' as const },
  h3: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  bodyMd: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  label: { fontSize: 13, fontWeight: '500' as const },
};