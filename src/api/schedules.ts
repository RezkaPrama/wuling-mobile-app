import { apiClient } from './client';

export const schedulesApi = {
  index: (params?: any) =>
    apiClient.get('/maintenance-schedules', { params }).then(r => r.data),
  show: (id: number) =>
    apiClient.get(`/maintenance-schedules/${id}`).then(r => r.data),
  dashboard: () =>
    apiClient.get('/maintenance-schedules/dashboard/summary').then(r => r.data),
};