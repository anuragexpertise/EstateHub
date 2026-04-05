
import { create } from 'zustand';
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

export const useDataStore = create<DataState>((set) => ({
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
}));
