import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  role: 'user' as 'user' | 'admin' | 'super_admin',
  login: (userData: any, token: string, role: string = 'user') =>
    set({ user: userData, token, isAuthenticated: true, role }),
  logout: () => set({ user: null, token: null, isAuthenticated: false, role: 'user' }),
  refreshToken: (newToken: string) => set({ token: newToken }),
  setRole: (role: string) => set({ role }),
}));
