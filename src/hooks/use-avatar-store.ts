
import { create } from 'zustand';

interface AvatarState {
  version: number;
  refreshAvatar: () => void;
}

export const useAvatarStore = create<AvatarState>((set) => ({
  version: 0,
  refreshAvatar: () => set((state) => ({ version: state.version + 1 })),
}));
