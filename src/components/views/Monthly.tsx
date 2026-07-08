import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronLeft, ChevronRight, Receipt } from 'lucide-react';
import { useExpense } from '@/hooks/useExpenseContext';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isSameMonth,

  isToday,
} from 'date-fns';
import { cn } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

export function Monthly() {
  const { transactions, categories } = useExpense();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = useMemo(() => {
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [calendarStart, calendarEnd]);

  const monthlyData = useMemo(() => {
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const monthTransactions = transactions.filter(t =>
      daysInMonth.some(d => format(d, 'yyyy-MM-dd') === t.date)
    );

    const totalSpent = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const dailyAverage = daysInMonth.length > 0 ? totalSpent / daysInMonth.length : 0;

    // Category breakdown
    const catTotals: Record<string, { amount: number; color: string; name: string }> = {};
    monthTransactions.filter(t => t.type === 'expense').forEach(t => {
      const cat = categories.find(c => c.id === t.category);
      if (!catTotals[t.category]) {
        catTotals[t.category] = { amount: 0, color: cat?.color || '#94A3B8', name: cat?.name || t.category };
      }
      catTotals[t.category].amount += t.amount;
    });

    const pieData = Object.values(catTotals)
      .map(c => ({ name: c.name, value: Math.round(c.amount * 100) / 100, color: c.color }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Day spending map
    const daySpending: Record<string, number> = {};
    monthTransactions.filter(t => t.type === 'expense').forEach(t => {
      daySpending[t.date] = (daySpending[t.date] || 0) + t.amount;
    });

    // Top categories
    const topCategories = Object.values(catTotals).sort((a, b) => b.amount - a.amount).slice(0, 4);

    return {
      totalSpent,
      totalIncome,
      netBalance: totalIncome - totalSpent,
      dailyAverage,
      pieData,
      daySpending,
      topCategories,
    };
  }, [transactions, categories, monthStart, monthEnd]);

  const selectedDateTransactions = useMemo(() => {
    if (!selectedDate) return [];
    return transactions
      .filter(t => t.date === selectedDate)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedDate, transactions]);

  const maxDaySpend = Math.max(...Object.values(monthlyData.daySpending), 1);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* Calendar */}
      <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
          <h3 className="text-lg font-semibold text-slate-800">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ChevronRight size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-slate-400 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const spend = monthlyData.daySpending[dateStr] || 0;
              const intensity = maxDaySpend > 0 ? spend / maxDaySpend : 0;
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = selectedDate === dateStr;
              const isTodayDate = isToday(day);

              return (
                <motion.button
                  key={dateStr}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.01 }}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  className={cn(
                    'relative p-2 rounded-xl text-center transition-all min-h-[72px] flex flex-col items-center justify-center',
                    !isCurrentMonth && 'opacity-30',
                    isSelected && 'ring-2 ring-emerald-400 bg-emerald-50',
                    !isSelected && isCurrentMonth && 'hover:bg-slate-50'
                  )}
                >
                  <span className={cn(
                    'text-sm font-medium',
                    isTodayDate ? 'text-emerald-600' : 'text-slate-700'
                  )}>
                    {format(day, 'd')}
                  </span>
                  {spend > 0 && (
                    <span className="text-[10px] text-slate-500 mt-0.5">${spend.toFixed(0)}</span>
                  )}
                  {spend > 0 && (
                    <div
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-5 h-1 rounded-full"
                      style={{
                        backgroundColor: `rgba(16, 185, 129, ${0.2 + intensity * 0.8})`,
                      }}
                    />
                  )}
                  {isTodayDate && (
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Transactions */}
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
          >
            <h4 className="text-base font-semibold text-slate-800 mb-3">
              {format(new Date(selectedDate), 'EEEE, MMMM d')}
            </h4>
            {selectedDateTransactions.length === 0 ? (
              <p className="text-sm text-slate-400">No transactions on this day</p>
            ) : (
              <div className="space-y-2">
                {selectedDateTransactions.map(tx => {
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
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Monthly Summary Sidebar */}
      <motion.div variants={itemVariants} className="space-y-4">
        {/* Summary Cards */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-lg font-semibold text-slate-800">Monthly Summary</h3>

          <div>
            <p className="text-xs text-slate-400 mb-1">Total Spent</p>
            <p className="text-2xl font-bold text-red-500">
              ${monthlyData.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs text-slate-400 mb-1">Total Income</p>
            <p className="text-2xl font-bold text-emerald-600">
              ${monthlyData.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs text-slate-400 mb-1">Net Balance</p>
            <p className={cn(
              'text-xl font-bold',
              monthlyData.netBalance >= 0 ? 'text-emerald-600' : 'text-red-500'
            )}>
              {monthlyData.netBalance >= 0 ? '+' : ''}${monthlyData.netBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs text-slate-400 mb-1">Daily Average</p>
            <p className="text-lg font-semibold text-slate-700">
              ${monthlyData.dailyAverage.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Pie Chart */}
        {monthlyData.pieData.length > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800 mb-3">Spending by Category</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={monthlyData.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {monthlyData.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {monthlyData.pieData.map(cat => (
                <div key={cat.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs text-slate-600 flex-1">{cat.name}</span>
                  <span className="text-xs font-semibold text-slate-700">${cat.value.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Categories */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="text-base font-semibold text-slate-800 mb-3">Top Spending</h3>
          {monthlyData.topCategories.length === 0 ? (
            <div className="text-center py-4">
              <Receipt size={24} className="text-slate-200 mx-auto mb-1" />
              <p className="text-xs text-slate-400">No spending this month</p>
            </div>
          ) : (
            <div className="space-y-3">
              {monthlyData.topCategories.map((cat, index) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cat.color}18` }}>
                    <span className="text-xs font-bold" style={{ color: cat.color }}>#{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">{cat.name}</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-700">${cat.amount.toFixed(0)}</span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
