// src/hooks/useMaintenanceRecords.ts
import { useAuthStore } from '@/src/store/authStore';
import { useQuery } from '@tanstack/react-query';

export interface MaintenanceRecord {
  id: number;
  record_number: string;
  maintenance_date: string;
  start_time: string;
  end_time: string | null;
  status: 'in_progress' | 'completed' | 'validated' | 'rejected';
  notes: string | null;
  pm_cycle: string;
  template_name: string;
  equipment_code: string;
  equipment_name: string;
  etm_group: string;
  technician_name: string;
  checker_name: string | null;
  validator_name: string | null;
}

export interface MaintenanceRecordStats {
  total: number;
  in_progress: number;
  completed: number;
  validated: number;
  rejected: number;
}

export interface MaintenanceRecordsResponse {
  success: boolean;
  data: {
    data: MaintenanceRecord[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  stats: MaintenanceRecordStats;
}

export interface MaintenanceRecordFilters {
  search?: string;
  filter_status?: string;
  filter_cycle?: string;
  filter_month?: string; // format: YYYY-MM
  per_page?: number;
  page?: number;
}

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://maintenance.eazyfit.id/api';

async function fetchMaintenanceRecords(
  token: string,
  filters: MaintenanceRecordFilters = {},
): Promise<MaintenanceRecordsResponse> {
  const params = new URLSearchParams();
  if (filters.search)        params.append('search', filters.search);
  if (filters.filter_status) params.append('filter_status', filters.filter_status);
  if (filters.filter_cycle)  params.append('filter_cycle', filters.filter_cycle);
  if (filters.filter_month)  params.append('filter_month', filters.filter_month);
  if (filters.per_page)      params.append('per_page', String(filters.per_page));
  if (filters.page)          params.append('page', String(filters.page));

  const url = `${BASE_URL}/maintenance-record/maintenance-records?${params.toString()}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? `HTTP ${res.status}`);
  }

  return res.json();
}

export function useMaintenanceRecords(filters: MaintenanceRecordFilters = {}) {
  const { token } = useAuthStore();

  return useQuery<MaintenanceRecordsResponse, Error>({
    queryKey: ['maintenance-records', filters],
    queryFn:  () => fetchMaintenanceRecords(token!, filters),
    enabled:  !!token,
    staleTime: 1000 * 60 * 2, // 2 menit
    retry: 2,
  });
}