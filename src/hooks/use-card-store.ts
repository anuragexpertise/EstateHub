
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { sidebarOptions } from '@/lib/data';

type CardLayout = string[];

interface CardState {
  layouts: { [key: string]: CardLayout };
  getLayout: (page: string) => CardLayout;
  setLayout: (page: string, layout: CardLayout) => void;
}

const defaultLayouts: { [key: string]: CardLayout } = {
  dashboard: [
    'Info',
    'Profile',
  ],
  payments: [
    'Payment History',
    'New Payment',
  ],
  'evaluate-pass': [
    'Scan Pass',
  ],
  settings: [
    'User Settings',
    'Rate Management',
    'Shift Management'
  ],
  customize: [],
};


export const useCardStore = create<CardState>()(
  persist(
    (set, get) => ({
      layouts: defaultLayouts,
      getLayout: (page) => {
        const state = get();
        // If a layout for the page doesn't exist, return default or empty array
        return state.layouts[page] || defaultLayouts[page] || [];
      },
      setLayout: (page, layout) =>
        set((state) => ({
          layouts: {
            ...state.layouts,
            [page]: layout,
          },
        })),
    }),
    {
      name: 'card-layout-storage', 
      storage: createJSONStorage(() => localStorage),
       onRehydrateStorage: () => (state, error) => {
        if (state) {
          // This ensures that new default cards are added for existing users
          // without wiping their customizations for existing cards.
          Object.keys(defaultLayouts).forEach(page => {
            const currentLayout = state.layouts[page] || [];
            const defaultLayout = defaultLayouts[page];
            if (defaultLayout) {
                const newCards = defaultLayout.filter(card => !currentLayout.includes(card));
                if (newCards.length > 0) {
                  state.layouts[page] = [...currentLayout, ...newCards];
                }
            }
          });
        }
      }
    }
  )
);
