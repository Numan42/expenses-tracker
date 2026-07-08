import type { Transaction, Category } from '@/types';
import { subDays, subMonths, format, startOfMonth } from 'date-fns';

export const defaultCategories: Category[] = [
  { id: 'food', name: 'Food & Dining', color: '#10B981', icon: 'UtensilsCrossed', budget: 500 },
  { id: 'transport', name: 'Transport', color: '#3B82F6', icon: 'Car', budget: 300 },
  { id: 'shopping', name: 'Shopping', color: '#F59E0B', icon: 'ShoppingBag', budget: 400 },
  { id: 'entertainment', name: 'Entertainment', color: '#EF4444', icon: 'Film', budget: 200 },
  { id: 'bills', name: 'Bills & Utilities', color: '#8B5CF6', icon: 'Receipt', budget: 600 },
  { id: 'health', name: 'Health', color: '#EC4899', icon: 'HeartPulse', budget: 150 },
  { id: 'groceries', name: 'Groceries', color: '#06B6D4', icon: 'Apple', budget: 350 },
  { id: 'education', name: 'Education', color: '#F97316', icon: 'GraduationCap', budget: 100 },
  { id: 'travel', name: 'Travel', color: '#6366F1', icon: 'Plane', budget: 250 },
  { id: 'other', name: 'Other', color: '#94A3B8', icon: 'MoreHorizontal', budget: 100 },
];

function generateDemoTransactions(): Transaction[] {
  const transactions: Transaction[] = [];
  const today = new Date();
  const expenseDescriptions: Record<string, string[]> = {
    'food': ['Lunch at cafe', 'Dinner restaurant', 'Coffee shop', 'Pizza delivery', 'Sushi place', 'Burger joint', 'Breakfast cafe'],
    'transport': ['Uber ride', 'Gas station', 'Bus fare', 'Train ticket', 'Parking fee', 'Taxi ride'],
    'shopping': ['New shoes', 'Clothing store', 'Electronics', 'Home decor', 'Book store', 'Gift shop'],
    'entertainment': ['Movie tickets', 'Concert', 'Streaming sub', 'Game purchase', 'Bar night', 'Arcade'],
    'bills': ['Electric bill', 'Internet bill', 'Phone bill', 'Water bill', 'Rent payment', 'Insurance'],
    'health': ['Pharmacy', 'Doctor visit', 'Gym membership', 'Vitamins', 'Dental checkup'],
    'groceries': ['Supermarket', 'Fresh produce', 'Bakery', 'Butcher', 'Organic market'],
    'education': ['Online course', 'Books', 'Workshop', 'Tutorial sub', 'Certification'],
    'travel': ['Hotel booking', 'Flight ticket', 'Car rental', 'Tour package'],
    'other': ['Miscellaneous', 'Charity', 'Subscription', 'Repair', 'Maintenance'],
  };

  const incomeDescriptions: Record<string, string[]> = {
    'salary': ['Monthly salary', 'Bi-weekly pay', 'Bonus payment'],
    'freelance': ['Client project', 'Consulting fee', 'Design work', 'Dev project'],
    'investment': ['Dividend', 'Stock sale', 'Interest earned'],
  };

  // Generate transactions for the last 90 days
  for (let i = 0; i < 90; i++) {
    const date = subDays(today, i);
    const numTransactions = Math.floor(Math.random() * 3) + 1; // 1-3 transactions per day

    for (let j = 0; j < numTransactions; j++) {
      const isIncome = Math.random() < 0.15; // 15% chance of income

      if (isIncome) {
        const incomeKeys = Object.keys(incomeDescriptions);
        const category = incomeKeys[Math.floor(Math.random() * incomeKeys.length)];
        const descriptions = incomeDescriptions[category];
        transactions.push({
          id: `tx-${date.getTime()}-${j}-income`,
          amount: Math.round((Math.random() * 2000 + 500) * 100) / 100,
          category,
          description: descriptions[Math.floor(Math.random() * descriptions.length)],
          date: format(date, 'yyyy-MM-dd'),
          type: 'income',
        });
      } else {
        const expenseKeys = Object.keys(expenseDescriptions);
        const category = expenseKeys[Math.floor(Math.random() * expenseKeys.length)];
        const descriptions = expenseDescriptions[category];
        const amount = category === 'bills' || category === 'rent'
          ? Math.round((Math.random() * 100 + 50) * 100) / 100
          : Math.round((Math.random() * 80 + 10) * 100) / 100;

        transactions.push({
          id: `tx-${date.getTime()}-${j}`,
          amount,
          category,
          description: descriptions[Math.floor(Math.random() * descriptions.length)],
          date: format(date, 'yyyy-MM-dd'),
          type: 'expense',
        });
      }
    }
  }

  // Add some older transactions for yearly view
  for (let m = 1; m <= 5; m++) {
    const monthDate = subMonths(startOfMonth(today), m);
    for (let d = 0; d < 15; d++) {
      const date = subDays(monthDate, d);
      const categoryKeys = Object.keys(expenseDescriptions);
      const category = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
      transactions.push({
        id: `tx-old-${m}-${d}`,
        amount: Math.round((Math.random() * 60 + 15) * 100) / 100,
        category,
        description: expenseDescriptions[category][Math.floor(Math.random() * expenseDescriptions[category].length)],
        date: format(date, 'yyyy-MM-dd'),
        type: 'expense',
      });
    }
  }

  return transactions;
}

export const demoTransactions: Transaction[] = generateDemoTransactions();
