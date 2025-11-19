
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserRole } from '@/types';

type CardLayout = string[];

interface CardState {
  layouts: { [key in UserRole]?: CardLayout };
  getLayout: (role: UserRole) => CardLayout;
  setLayout: (role: UserRole, layout: CardLayout) => void;
}

const defaultLayouts: { [key in UserRole]: CardLayout } = {
  Admin: [
    'Info',
    'Enrollment',
    'Payment History',
    'New Payment',
    'Rate Management',
    'Shift Management'
  ],
  Apartment: [
    'Payment History',
    'User Settings'
  ],
  Contractor: [
    'Payment History',
    'User Settings'
  ],
  Security: [
    'Scan Pass',
    'Work Shift',
    'Salary History',
    'New Payment',
  ],
};


export const useCardStore = create<CardState>()(
  persist(
    (set, get) => ({
      layouts: defaultLayouts,
      getLayout: (role) => {
        const state = get();
        // If a layout for the role doesn't exist in the persisted state, use the default.
        return state.layouts[role] || defaultLayouts[role];
      },
      setLayout: (role, layout) =>
        set((state) => ({
          layouts: {
            ...state.layouts,
            [role]: layout,
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
          Object.keys(defaultLayouts).forEach(role => {
            const r = role as UserRole;
            const currentLayout = state.layouts[r] || [];
            const defaultLayout = defaultLayouts[r];
            const newCards = defaultLayout.filter(card => !currentLayout.includes(card));
            if (newCards.length > 0) {
              state.layouts[r] = [...currentLayout, ...newCards];
            }
          });
        }
      }
    }
  )
);
