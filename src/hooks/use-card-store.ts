
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type CardLayout = string[];

interface CardState {
  layouts: { [key: string]: CardLayout }; // key is `${role}-${page}`
  getLayout: (key: string) => CardLayout;
  setLayout: (key: string, layout: CardLayout) => void;
}

// Default layouts are now keyed by `${role}-${page}`
const defaultLayouts: { [key: string]: CardLayout } = {
  // Admin
  'Admin-dashboard': ['Info', 'Profile'],
  'Admin-receipts': ['Payment History', 'New Payment'],
  'Admin-evaluate-pass': ['Scan Pass'],
  'Admin-settings': [], // Settings page has its own layout
  'Admin-customize': [],

  // Apartment
  'Apartment-dashboard': ['Profile', 'Payment History'],
  'Apartment-payments': ['Payment History'],
  'Apartment-settings': [],

  // Contractor
  'Contractor-dashboard': ['Profile', 'Payment History'],
  'Contractor-payments': ['Payment History'],
  'Contractor-settings': [],
  
  // Security
  'Security-dashboard': ['Scan Pass', 'Work Shift'],
  'Security-receipts': ['Payment History'],
  'Security-settings': [],
};

export const useCardStore = create<CardState>()(
  persist(
    (set, get) => ({
      layouts: defaultLayouts,
      getLayout: (key) => {
        const state = get();
        return state.layouts[key] || defaultLayouts[key] || [];
      },
      setLayout: (key, layout) =>
        set((state) => ({
          layouts: {
            ...state.layouts,
            [key]: layout,
          },
        })),
    }),
    {
      name: 'card-layout-storage-v3', 
      storage: createJSONStorage(() => localStorage),
       onRehydrateStorage: () => (state, error) => {
        if (state) {
          Object.keys(defaultLayouts).forEach(key => {
            if (!state.layouts[key]) {
              state.layouts[key] = defaultLayouts[key];
            }
          });
        }
      }
    }
  )
);
