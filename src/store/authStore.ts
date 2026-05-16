import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

interface User {
  id: number;
  employee_id: string;  // ← tambah ini
  name: string;
  email: string;
  department: string;   // ← tambah ini
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoading: true,

  setToken: (token) => set({ token }),
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),

  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    set({ token: null, user: null });
  },

  initialize: async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      set({ token, isLoading: false });
    } catch {
      set({ token: null, isLoading: false });
    }
  },
}));