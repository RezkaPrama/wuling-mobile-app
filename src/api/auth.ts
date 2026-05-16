import * as SecureStore from 'expo-secure-store';
import { apiClient } from './client';

export const authApi = {
  login: async (employeeId: string, password: string) => {
    const { data } = await apiClient.post('/login', {
      employee_id: employeeId,  // ← sesuai controller Laravel
      password,
    });
    // response: { success, message, data: { user, token } }
    await SecureStore.setItemAsync('auth_token', data.data.token);
    return data.data; // return { user, token }
  },

  logout: async () => {
    await apiClient.post('/logout');
    await SecureStore.deleteItemAsync('auth_token');
  },

  me: async () => {
    const { data } = await apiClient.get('/me');
    return data.data; // response: { success, data: user }
  },
};