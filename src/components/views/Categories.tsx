import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Film,
  Receipt,
  HeartPulse,
  Apple,
  GraduationCap,
  Plane,
  MoreHorizontal,
  X,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { useExpense } from '@/hooks/useExpenseContext';
import { useUI } from '@/hooks/useUIContext';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

const iconMap: Record<string, React.ReactNode> = {
  UtensilsCrossed: <UtensilsCrossed size={18} />,
  Car: <Car size={18} />,
  ShoppingBag: <ShoppingBag size={18} />,
  Film: <Film size={18} />,
  Receipt: <Receipt size={18} />,
  HeartPulse: <HeartPulse size={18} />,
  Apple: <Apple size={18} />,
  GraduationCap: <GraduationCap size={18} />,
  Plane: <Plane size={18} />,
  MoreHorizontal: <MoreHorizontal size={18} />,
  TrendingUp: <TrendingUp size={18} />,
  XCircle: <XCircle size={18} />,
};

const availableIcons = [
  'UtensilsCrossed', 'Car', 'ShoppingBag', 'Film', 'Receipt',
  'HeartPulse', 'Apple', 'GraduationCap', 'Plane', 'MoreHorizontal',
  'TrendingUp', 'XCircle',
];

const availableColors = [
  '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#6366F1', '#94A3B8',
  '#14B8A6', '#F43F5E',
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

export function Categories() {
  const { transactions, categories, addCategory, deleteCategory, updateCategory } = useExpense();
  const { showToast } = useUI();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: availableIcons[0],
    color: availableColors[0],
    budget: '',
  });

  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  const getCategoryStats = (catId: string) => {
    const catTransactions = transactions.filter(t =>
      t.category === catId &&
      t.type === 'expense' &&
      isWithinInterval(new Date(t.date), { start: monthStart, end: monthEnd })
    );
    const total = catTransactions.reduce((sum, t) => sum + t.amount, 0);
    const count = catTransactions.length;
    return { total, count };
  };

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) {
      showToast('Please enter a category name', 'error');
      return;
    }

    addCategory({
      name: newCategory.name.trim(),
      icon: newCategory.icon,
      color: newCategory.color,
      budget: newCategory.budget ? parseFloat(newCategory.budget) : undefined,
    });

    showToast('Category added successfully', 'success');
    setNewCategory({ name: '', icon: availableIcons[0], color: availableColors[0], budget: '' });
    setShowAddForm(false);
  };

  const handleDeleteCategory = (id: string) => {
    const hasTransactions = transactions.some(t => t.category === id);
    if (hasTransactions) {
      showToast('Cannot delete category with transactions', 'error');
      return;
    }
    deleteCategory(id);
    setSelectedCategory(null);
    showToast('Category deleted', 'info');
  };

  const handleUpdateBudget = (id: string, budget: number | undefined) => {
    updateCategory(id, { budget });
    showToast('Budget updated', 'success');
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Spending Categories</h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors"
        >
          {showAddForm ? <X size={16} /> : <Plus size={16} />}
          {showAddForm ? 'Cancel' : 'Add Category'}
        </motion.button>
      </motion.div>

      {/* Add Category Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-base font-semibold text-slate-800">New Category</h3>

              <div>
                <label className="text-xs text-slate-500 font-medium mb-1.5 block">Name</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="Category name"
                  className="w-full px-4 py-2.5 text-sm text-slate-800 bg-slate-50 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 font-medium mb-1.5 block">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {availableIcons.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setNewCategory({ ...newCategory, icon })}
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center transition-all border',
                        newCategory.icon === icon
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-600'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                      )}
                    >
                      {iconMap[icon]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 font-medium mb-1.5 block">Color</label>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewCategory({ ...newCategory, color })}
                      className={cn(
                        'w-8 h-8 rounded-lg transition-all border-2',
                        newCategory.color === color ? 'border-slate-800 scale-110' : 'border-transparent hover:scale-105'
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 font-medium mb-1.5 block">Monthly Budget (optional)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                  <input
                    type="number"
                    value={newCategory.budget}
                    onChange={(e) => setNewCategory({ ...newCategory, budget: e.target.value })}
                    placeholder="0.00"
                    className="w-full pl-7 pr-4 py-2.5 text-sm text-slate-800 bg-slate-50 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                onClick={handleAddCategory}
                className="w-full py-2.5 bg-emerald-500 text-white rounded-xl font-semibold text-sm hover:bg-emerald-600 transition-colors"
              >
                Create Category
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const stats = getCategoryStats(cat.id);
          const budgetPercent = cat.budget && cat.budget > 0 ? Math.min((stats.total / cat.budget) * 100, 100) : 0;
          const isOverBudget = cat.budget ? stats.total > cat.budget : false;

          return (
            <motion.div
              key={cat.id}
              variants={itemVariants}
              layout
              onClick={() => setSelectedCategory(selectedCategory?.id === cat.id ? null : cat)}
              className={cn(
                'bg-white rounded-2xl p-5 border transition-all cursor-pointer hover:shadow-md',
                selectedCategory?.id === cat.id ? 'border-emerald-300 ring-1 ring-emerald-100' : 'border-gray-100'
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${cat.color}18`, color: cat.color }}
                >
                  {iconMap[cat.icon] || <MoreHorizontal size={18} />}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCategory(cat.id);
                  }}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                  style={{ opacity: 0 }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <h4 className="text-sm font-semibold text-slate-800 mb-1">{cat.name}</h4>
              <p className="text-lg font-bold text-slate-700">
                ${stats.total.toFixed(0)}
                <span className="text-xs font-normal text-slate-400 ml-1">this month</span>
              </p>

              {cat.budget && cat.budget > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">Budget</span>
                    <span className={cn('text-xs font-medium', isOverBudget ? 'text-red-500' : 'text-slate-500')}>
                      {budgetPercent.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${budgetPercent}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className={cn('h-2 rounded-full', isOverBudget ? 'bg-red-500' : 'bg-emerald-500')}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    ${stats.total.toFixed(0)} of ${cat.budget.toFixed(0)}
                  </p>
                </div>
              )}

              <p className="text-xs text-slate-400 mt-2">{stats.count} transactions</p>
            </motion.div>
          );
        })}
      </div>

      {/* Category Detail Modal */}
      <AnimatePresence>
        {selectedCategory && (
          <CategoryDetailModal
            category={selectedCategory}
            onClose={() => setSelectedCategory(null)}
            onUpdateBudget={(budget) => handleUpdateBudget(selectedCategory.id, budget)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CategoryDetailModal({
  category,
  onClose,
  onUpdateBudget,
}: {
  category: Category;
  onClose: () => void;
  onUpdateBudget: (budget: number | undefined) => void;
}) {
  const { transactions } = useExpense();
  const [editBudget, setEditBudget] = useState(category.budget?.toString() || '');

  const catTransactions = transactions
    .filter(t => t.category === category.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20);

  const totalSpent = catTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${category.color}18`, color: category.color }}
              >
                {iconMap[category.icon] || <MoreHorizontal size={20} />}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">{category.name}</h3>
                <p className="text-sm text-slate-400">${totalSpent.toFixed(2)} total spent</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X size={18} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* Budget Editor */}
        <div className="p-6 border-b border-gray-100">
          <label className="text-xs text-slate-500 font-medium mb-1.5 block">Monthly Budget</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
              <input
                type="number"
                value={editBudget}
                onChange={(e) => setEditBudget(e.target.value)}
                placeholder="No budget set"
                className="w-full pl-7 pr-4 py-2.5 text-sm text-slate-800 bg-slate-50 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
              />
            </div>
            <button
              onClick={() => onUpdateBudget(editBudget ? parseFloat(editBudget) : undefined)}
              className="px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors"
            >
              Save
            </button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="p-6 overflow-y-auto max-h-80">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Recent Transactions</h4>
          {catTransactions.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No transactions yet</p>
          ) : (
            <div className="space-y-2">
              {catTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${category.color}18` }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: category.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{tx.description}</p>
                    <p className="text-xs text-slate-400">{format(new Date(tx.date), 'MMM d, yyyy')}</p>
                  </div>
                  <span className={cn(
                    'text-sm font-semibold',
                    tx.type === 'expense' ? 'text-red-500' : 'text-emerald-600'
                  )}>
                    {tx.type === 'expense' ? '-' : '+'}${tx.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
