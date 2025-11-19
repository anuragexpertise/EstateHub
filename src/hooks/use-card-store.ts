
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
    }
  )
);
