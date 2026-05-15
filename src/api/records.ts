import { apiClient } from './client';

export const recordsApi = {
  index: (params?: any) =>
    apiClient.get('/maintenance-records', { params }).then(r => r.data),

  store: (body: any) =>
    apiClient.post('/maintenance-records', body).then(r => r.data),

  show: (id: number) =>
    apiClient.get(`/maintenance-records/${id}`).then(r => r.data),

  fromQr: (equipmentId: number) =>
    apiClient.get('/maintenance-records/from-qr', {
      params: { equipment_id: equipmentId },
    }).then(r => r.data),

  complete: (id: number) =>
    apiClient.post(`/maintenance-records/${id}/complete`).then(r => r.data),

  validasi: (id: number, body: any) =>
    apiClient.post(`/maintenance-records/${id}/validasi`, body).then(r => r.data),

  updateItem: (recordId: number, itemId: number, body: any) =>
    apiClient.put(`/maintenance-records/${recordId}/items/${itemId}`, body).then(r => r.data),

  uploadPhoto: (recordId: number, itemId: number, formData: FormData) =>
    apiClient.post(`/maintenance-records/${recordId}/photos/${itemId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),

  export: (id: number) =>
    apiClient.get(`/maintenance-records/${id}/export`, {
      responseType: 'blob',
    }).then(r => r.data),
};