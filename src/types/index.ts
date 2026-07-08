export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: 'expense' | 'income';
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  budget?: number;
}

export type ViewType = 'dashboard' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'categories';

export interface MonthlySummary {
  totalSpent: number;
  totalIncome: number;
  netBalance: number;
  dailyAverage: number;
  topCategory: { name: string; amount: number } | null;
}

export interface YearlySummary {
  totalSpent: number;
  totalIncome: number;
  savingsRate: number;
  monthlyAverage: number;
}
