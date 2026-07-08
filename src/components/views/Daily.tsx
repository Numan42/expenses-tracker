import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Trash2, Receipt } from 'lucide-react';
import { useExpense } from '@/hooks/useExpenseContext';
import { useUI } from '@/hooks/useUIContext';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

export function Daily() {
  const { transactions, categories, addTransaction, deleteTransaction } = useExpense();
  const { showToast } = useUI();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || '');
  const [isIncome, setIsIncome] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const today = format(new Date(), 'yyyy-MM-dd');

  const todayTransactions = useMemo(() => {
    return transactions
      .filter(t => t.date === today)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, today]);

  const todayTotal = useMemo(() => {
    return todayTransactions.reduce((sum, t) => {
      return t.type === 'expense' ? sum + t.amount : sum - t.amount;
    }, 0);
  }, [todayTransactions]);

  const handleAddTransaction = () => {
    if (!amount || parseFloat(amount) <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    if (!description.trim()) {
      showToast('Please enter a description', 'error');
      return;
    }

    addTransaction({
      amount: parseFloat(amount),
      category: selectedCategory,
      description: description.trim(),
      date: today,
      type: isIncome ? 'income' : 'expense',
    });

    showToast(`${isIncome ? 'Income' : 'Expense'} added successfully`, 'success');
    setAmount('');
    setDescription('');
  };

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    setDeleteConfirm(null);
    showToast('Transaction deleted', 'info');
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 lg:grid-cols-5 gap-6"
    >
      {/* Quick Add Widget */}
      <motion.div variants={itemVariants} className="lg:col-span-2">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-slate-800">Quick Add</h3>
            <div className="flex bg-slate-100 rounded-lg p-0.5">
              <button
                onClick={() => setIsIncome(false)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                  !isIncome ? 'bg-white text-red-500 shadow-sm' : 'text-slate-500'
                )}
              >
                Expense
              </button>
              <button
                onClick={() => setIsIncome(true)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                  isIncome ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'
                )}
              >
                Income
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-4">
            <label className="text-xs text-slate-500 font-medium mb-1.5 block">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 text-2xl font-bold text-slate-800 bg-slate-50 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
              />
            </div>
          </div>

          {/* Category Selector */}
          <div className="mb-4">
            <label className="text-xs text-slate-500 font-medium mb-1.5 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all border',
                    selectedCategory === cat.id
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  )}
                >
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Description Input */}
          <div className="mb-5">
            <label className="text-xs text-slate-500 font-medium mb-1.5 block">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this for?"
              className="w-full px-4 py-2.5 text-sm text-slate-800 bg-slate-50 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleAddTransaction()}
            />
          </div>

          {/* Add Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddTransaction}
            className={cn(
              'w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-colors',
              isIncome ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-800 hover:bg-slate-900'
            )}
          >
            {isIncome ? <Plus size={18} /> : <Minus size={18} />}
            Add {isIncome ? 'Income' : 'Expense'}
          </motion.button>
        </div>
      </motion.div>

      {/* Today's Transactions */}
      <motion.div variants={itemVariants} className="lg:col-span-3">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Today's Transactions</h3>
              <p className="text-sm text-slate-400 mt-0.5">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
            </div>
            <div className="text-right">
              <p className={cn(
                'text-xl font-bold',
                todayTotal > 0 ? 'text-red-500' : todayTotal < 0 ? 'text-emerald-600' : 'text-slate-400'
              )}>
                {todayTotal > 0 ? '+' : ''}${Math.abs(todayTotal).toFixed(2)}
              </p>
              <p className="text-xs text-slate-400">Net today</p>
            </div>
          </div>

          {todayTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
                <Receipt size={24} className="text-slate-300" />
              </div>
              <p className="text-slate-400 text-sm">No transactions today</p>
              <p className="text-slate-300 text-xs mt-1">Add your first expense using the form</p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {todayTransactions.map((tx) => {
                  const category = categories.find(c => c.id === tx.category);
                  return (
                    <motion.div
                      key={tx.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${category?.color || '#94A3B8'}18` }}
                      >
                        <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: category?.color || '#94A3B8' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{tx.description}</p>
                        <p className="text-xs text-slate-400">{category?.name || tx.category}</p>
                      </div>
                      <span className={cn(
                        'text-sm font-semibold',
                        tx.type === 'expense' ? 'text-red-500' : 'text-emerald-600'
                      )}>
                        {tx.type === 'expense' ? '-' : '+'}${tx.amount.toFixed(2)}
                      </span>
                      <AnimatePresence>
                        {deleteConfirm === tx.id ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-1"
                          >
                            <button
                              onClick={() => handleDelete(tx.id)}
                              className="px-2 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-2 py-1 bg-slate-200 text-slate-600 text-xs rounded-lg hover:bg-slate-300 transition-colors"
                            >
                              Cancel
                            </button>
                          </motion.div>
                        ) : (
                          <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={() => setDeleteConfirm(tx.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                          >
                            <Trash2 size={14} />
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
