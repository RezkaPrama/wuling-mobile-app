import { schedulesApi } from '@/src/api/schedules';
import { useQuery } from '@tanstack/react-query';

export function useSchedules(params?: any) {
  return useQuery({
    queryKey: ['schedules', params],
    queryFn: () => schedulesApi.index(params),
    staleTime: 1000 * 60 * 2,
  });
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => schedulesApi.dashboard(),
    staleTime: 1000 * 60 * 2,
  });
}