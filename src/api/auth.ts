import * as SecureStore from 'expo-secure-store';
import { apiClient } from './client';

export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await apiClient.post('/login', { email, password });
    await SecureStore.setItemAsync('auth_token', data.token);
    return data;
  },
  logout: async () => {
    await apiClient.post('/logout');
    await SecureStore.deleteItemAsync('auth_token');
  },
  me: async () => {
    const { data } = await apiClient.get('/me');
    return data;
  },
};