import { create } from 'zustand';

export const useMoodStore = create((set) => ({
  todayMood: null,
  history: [],
  submitMood: (mood) => set((state) => ({ todayMood: mood, history: [...state.history, mood] })),
  fetchHistory: (history) => set({ history }),
}));
