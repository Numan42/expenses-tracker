import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChevronLeft, ChevronRight, Receipt } from 'lucide-react';
import { useExpense } from '@/hooks/useExpenseContext';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval } from 'date-fns';
import { cn } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

export function Weekly() {
  const { transactions, categories } = useExpense();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  const weekDays = useMemo(() => {
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [weekStart, weekEnd]);

  const weeklyData = useMemo(() => {
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayTransactions = transactions.filter(t => t.date === dateStr && t.type === 'expense');
      const total = dayTransactions.reduce((sum, t) => sum + t.amount, 0);

      // Find dominant category
      const catTotals: Record<string, number> = {};
      dayTransactions.forEach(t => {
        catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
      });
      const dominantCat = Object.entries(catTotals).sort(([, a], [, b]) => b - a)[0];
      const category = dominantCat ? categories.find(c => c.id === dominantCat[0]) : null;

      return {
        day: format(day, 'EEE'),
        date: dateStr,
        dateLabel: format(day, 'MMM d'),
        amount: Math.round(total * 100) / 100,
        color: category?.color || '#E2E8F0',
        transactions: dayTransactions,
      };
    });
  }, [transactions, categories, weekStart, weekEnd]);

  const weekTotal = weeklyData.reduce((sum, d) => sum + d.amount, 0);

  const categoryBreakdown = useMemo(() => {
    const allWeekTransactions = transactions.filter(t => {
      return t.type === 'expense' && weekDays.some(d => format(d, 'yyyy-MM-dd') === t.date);
    });

    const catTotals: Record<string, { amount: number; color: string; name: string }> = {};
    allWeekTransactions.forEach(t => {
      const cat = categories.find(c => c.id === t.category);
      if (!catTotals[t.category]) {
        catTotals[t.category] = { amount: 0, color: cat?.color || '#94A3B8', name: cat?.name || t.category };
      }
      catTotals[t.category].amount += t.amount;
    });

    return Object.values(catTotals).sort((a, b) => b.amount - a.amount);
  }, [transactions, categories, weekDays]);

  const selectedDayTransactions = useMemo(() => {
    if (!selectedDay) return [];
    return transactions
      .filter(t => t.date === selectedDay)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedDay, transactions]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Week Navigation */}
      <motion.div variants={itemVariants} className="flex items-center justify-between bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <button
          onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ChevronLeft size={20} className="text-slate-600" />
        </button>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-800">
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </h3>
          <p className="text-sm text-slate-400">Total: ${weekTotal.toFixed(2)}</p>
        </div>
        <button
          onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ChevronRight size={20} className="text-slate-600" />
        </button>
      </motion.div>

      {/* Bar Chart */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Weekly Spending</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} barSize={40}>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#94A3B8' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#94A3B8' }}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spent']}
                contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]} animationDuration={800}>
                {weeklyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Day Cards */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-7 gap-2">
          {weeklyData.map((day, index) => (
            <motion.button
              key={day.date}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedDay(selectedDay === day.date ? null : day.date)}
              className={cn(
                'p-3 rounded-xl border transition-all text-center',
                selectedDay === day.date
                  ? 'border-emerald-300 bg-emerald-50 shadow-sm'
                  : 'border-gray-100 bg-white hover:border-gray-200'
              )}
            >
              <p className="text-xs text-slate-400 font-medium">{day.day}</p>
              <p className="text-xs text-slate-500 mt-0.5">{day.dateLabel}</p>
              <p className={cn(
                'text-sm font-bold mt-1.5',
                day.amount > 0 ? 'text-slate-700' : 'text-slate-300'
              )}>
                ${day.amount.toFixed(0)}
              </p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Selected Day Transactions */}
      {selectedDay && selectedDayTransactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-slate-800 mb-3">
            {format(new Date(selectedDay), 'EEEE, MMM d')}
          </h3>
          <div className="space-y-2">
            {selectedDayTransactions.map((tx) => {
              const category = categories.find(c => c.id === tx.category);
              return (
                <div key={tx.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${category?.color || '#94A3B8'}18` }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: category?.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">{tx.description}</p>
                    <p className="text-xs text-slate-400">{category?.name}</p>
                  </div>
                  <span className={cn(
                    'text-sm font-semibold',
                    tx.type === 'expense' ? 'text-red-500' : 'text-emerald-600'
                  )}>
                    {tx.type === 'expense' ? '-' : '+'}${tx.amount.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Category Breakdown */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Category Breakdown</h3>
        <div className="space-y-4">
          {categoryBreakdown.map((cat, index) => {
            const percentage = weekTotal > 0 ? (cat.amount / weekTotal) * 100 : 0;
            return (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm text-slate-600">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700">${cat.amount.toFixed(2)}</span>
                    <span className="text-xs text-slate-400">{percentage.toFixed(0)}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="h-2 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                </div>
              </motion.div>
            );
          })}
          {categoryBreakdown.length === 0 && (
            <div className="text-center py-8">
              <Receipt size={32} className="text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No expenses this week</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
