import { create } from 'zustand';

export const useAudioStore = create((set) => ({
  currentTrack: null,
  isPlaying: false,
  progress: 0,
  play: (track) => set({ currentTrack: track, isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  seek: (progress) => set({ progress }),
}));
