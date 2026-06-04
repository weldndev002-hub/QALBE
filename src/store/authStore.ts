import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      role: 'user' as 'user' | 'admin' | 'super_admin',
      login: (userData: any, token: string, role: string = 'user') =>
        set({ user: userData, token, isAuthenticated: true, role }),
      logout: () => set({ user: null, token: null, isAuthenticated: false, role: 'user' }),
      refreshToken: (newToken: string) => set({ token: newToken }),
      setRole: (role: string) => set({ role }),
    }),
    {
      name: 'qalbie-auth-storage', // name of the item in the storage (must be unique)
    }
  )
);
