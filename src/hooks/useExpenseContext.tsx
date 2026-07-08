import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Transaction, Category } from '@/types';
import { demoTransactions, defaultCategories } from '@/data/demoData';

interface ExpenseContextType {
  transactions: Transaction[];
  categories: Category[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

const STORAGE_KEY_TX = 'expense-tracker-transactions';
const STORAGE_KEY_CAT = 'expense-tracker-categories';
const STORAGE_KEY_INITIALIZED = 'expense-tracker-initialized';

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TX);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CAT);
      return stored ? JSON.parse(stored) : defaultCategories;
    } catch {
      return defaultCategories;
    }
  });

  // Initialize demo data on first load
  useEffect(() => {
    const initialized = localStorage.getItem(STORAGE_KEY_INITIALIZED);
    if (!initialized) {
      setTransactions(demoTransactions);
      localStorage.setItem(STORAGE_KEY_INITIALIZED, 'true');
    }
  }, []);

  // Persist to localStorage with debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(transactions));
    }, 500);
    return () => clearTimeout(timeout);
  }, [transactions]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY_CAT, JSON.stringify(categories));
    }, 500);
    return () => clearTimeout(timeout);
  }, [categories]);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setTransactions(prev => [newTransaction, ...prev]);
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const addCategory = useCallback((category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setCategories(prev => [...prev, newCategory]);
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(cat =>
      cat.id === id ? { ...cat, ...updates } : cat
    ));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
  }, []);

  return (
    <ExpenseContext.Provider value={{
      transactions,
      categories,
      addTransaction,
      deleteTransaction,
      addCategory,
      updateCategory,
      deleteCategory,
    }}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpense() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within ExpenseProvider');
  }
  return context;
}
