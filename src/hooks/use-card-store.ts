
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserRole } from '@/types';

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
  'Admin-payments': ['Payment History', 'New Payment'],
  'Admin-evaluate-pass': ['Scan Pass'],
  'Admin-settings': ['User Settings', 'Apartment Rate Management', 'Utility Contractor Rate Management', 'Shift Management'],
  'Admin-customize': [],

  // Apartment
  'Apartment-dashboard': ['Profile', 'Payment History'],
  'Apartment-payments': ['Payment History'],
  'Apartment-settings': ['User Settings'],

  // Contractor
  'Contractor-dashboard': ['Profile', 'Payment History'],
  'Contractor-payments': ['Payment History'],
  'Contractor-settings': ['User Settings'],
  
  // Security
  'Security-dashboard': ['Scan Pass', 'Work Shift'],
  'Security-payments': ['Payment History'],
  'Security-settings': ['User Settings'],
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
      name: 'card-layout-storage-v2', // Changed name to prevent conflicts with old structure
      storage: createJSONStorage(() => localStorage),
       onRehydrateStorage: () => (state, error) => {
        if (state) {
          // This ensures that new default layouts are added for existing users
          // without wiping their customizations for existing pages.
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
