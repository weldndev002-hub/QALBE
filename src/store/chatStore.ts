import { create } from 'zustand';

export const useChatStore = create((set) => ({
  messages: [],
  isLoading: false,
  dailyCount: 0,
  sessionId: null,
  sendMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  clearSession: () => set({ messages: [], sessionId: null }),
  setLoading: (isLoading) => set({ isLoading }),
}));
