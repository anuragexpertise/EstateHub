
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface GlobalState {
  societyName: string;
  logoUrl: string | null;
  loginHeroUrl: string | null;
  calculationStartDate: string | null;
  setSocietyName: (name: string) => void;
  setLogoUrl: (url: string) => void;
  setLoginHeroUrl: (url: string) => void;
  setCalculationStartDate: (date: string) => void;
}

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set) => ({
      societyName: 'EstateHub',
      logoUrl: null,
      loginHeroUrl: null,
      calculationStartDate: null,
      setSocietyName: (name) => set({ societyName: name }),
      setLogoUrl: (url) => set({ logoUrl: url }),
      setLoginHeroUrl: (url) => set({ loginHeroUrl: url }),
      setCalculationStartDate: (date) => set({ calculationStartDate: date }),
    }),
    {
      name: 'global-app-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
