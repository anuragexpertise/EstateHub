
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Payment, Expense } from '@/types';
import { payments as initialPayments, expenses as initialExpenses } from '@/lib/data';

interface DataState {
  payments: Payment[];
  expenses: Expense[];
  addPayment: (payment: Payment) => void;
  addExpense: (expense: Expense) => void;
  updatePaymentStatus: (paymentId: string, status: Payment['status']) => void;
  updateExpenseStatus: (expenseId: string, status: Expense['status']) => void;
}

export const useDataStore = create<DataState>()(
    persist(
        (set) => ({
            payments: initialPayments,
            expenses: initialExpenses,
            addPayment: (payment) => set((state) => ({ 
                payments: [payment, ...state.payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) 
            })),
            addExpense: (expense) => set((state) => ({ 
                expenses: [expense, ...state.expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) 
            })),
            updatePaymentStatus: (paymentId, status) => set((state) => ({
                payments: state.payments.map(p => p.id === paymentId ? { ...p, status } : p)
            })),
            updateExpenseStatus: (expenseId, status) => set((state) => ({
                expenses: state.expenses.map(e => e.id === expenseId ? { ...e, status } : e)
            })),
        }),
        {
            name: 'financial-data-storage', 
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                if (state) {
                  // After rehydrating from localStorage, JSON.stringify would have turned Dates into strings.
                  // We need to convert them back to Date objects.
                  state.payments = state.payments.map(p => ({ ...p, date: new Date(p.date) }));
                  state.expenses = state.expenses.map(e => ({ ...e, date: new Date(e.date) }));
                }
            },
        }
    )
);
