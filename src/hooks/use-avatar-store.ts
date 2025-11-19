
import { create } from 'zustand';

interface AvatarState {
  version: number;
  newAvatarUrl: string | null;
  lastUpdatedAvatarId: string | null;
  refreshAvatar: (url: string, avatarId: string) => void;
}

export const useAvatarStore = create<AvatarState>((set) => ({
  version: 0,
  newAvatarUrl: null,
  lastUpdatedAvatarId: null,
  refreshAvatar: (url: string, avatarId: string) => set((state) => ({ 
    version: state.version + 1,
    newAvatarUrl: url,
    lastUpdatedAvatarId: avatarId,
  })),
}));
