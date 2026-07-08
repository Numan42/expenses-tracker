import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Receipt, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useExpense } from '@/hooks/useExpenseContext';
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export function Dashboard() {
  const { transactions, categories } = useExpense();

  const summaryData = useMemo(() => {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    // Total balance (all time income - expenses)
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalBalance = totalIncome - totalExpenses;

    // This month
    const thisMonthTransactions = transactions.filter(t =>
      isWithinInterval(new Date(t.date), { start: monthStart, end: monthEnd })
    );
    const thisMonthSpent = thisMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const thisMonthIncome = thisMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    // Top category this month
    const categoryTotals: Record<string, number> = {};
    thisMonthTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });
    const topCategory = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)[0];
    const topCategoryData = topCategory
      ? { name: categories.find(c => c.id === topCategory[0])?.name || topCategory[0], amount: topCategory[1] }
      : null;

    // Recent average (last 30 days)
    const last30Days = transactions.filter(t => {
      const daysAgo = Math.floor((today.getTime() - new Date(t.date).getTime()) / (1000 * 60 * 60 * 24));
      return daysAgo <= 30 && t.type === 'expense';
    });
    const dailyAverage = last30Days.length > 0
      ? last30Days.reduce((sum, t) => sum + t.amount, 0) / 30
      : 0;

    // Pie chart data
    const pieData = Object.entries(categoryTotals)
      .map(([catId, amount]) => ({
        name: categories.find(c => c.id === catId)?.name || catId,
        value: Math.round(amount * 100) / 100,
        color: categories.find(c => c.id === catId)?.color || '#94A3B8',
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    // Weekly trend data (last 7 days)
    const weeklyData = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i);
      const dayTotal = transactions
        .filter(t => t.date === format(date, 'yyyy-MM-dd') && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        day: format(date, 'EEE'),
        amount: Math.round(dayTotal * 100) / 100,
      };
    });

    // Recent transactions
    const recentTransactions = [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);

    return {
      totalBalance,
      thisMonthSpent,
      thisMonthIncome,
      topCategory: topCategoryData,
      dailyAverage,
      pieData,
      weeklyData,
      recentTransactions,
    };
  }, [transactions, categories]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-500 font-medium">Total Balance</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Wallet size={16} className="text-emerald-600" />
            </div>
          </div>
          <p className={cn('text-2xl font-bold', summaryData.totalBalance >= 0 ? 'text-emerald-600' : 'text-red-500')}>
            ${summaryData.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1 mt-2">
            {summaryData.totalBalance >= 0 ? (
              <ArrowUpRight size={14} className="text-emerald-500" />
            ) : (
              <ArrowDownRight size={14} className="text-red-500" />
            )}
            <span className={cn('text-xs font-medium', summaryData.totalBalance >= 0 ? 'text-emerald-500' : 'text-red-500')}>
              {summaryData.totalBalance >= 0 ? 'In good shape' : 'Spending more'}
            </span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-500 font-medium">This Month</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Receipt size={16} className="text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            ${summaryData.thisMonthSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((summaryData.thisMonthSpent / (summaryData.thisMonthIncome || 1)) * 100, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="bg-amber-500 h-1.5 rounded-full"
            />
          </div>
          <p className="text-xs text-slate-400 mt-1.5">of ${summaryData.thisMonthIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })} income</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-500 font-medium">Top Category</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <TrendingUp size={16} className="text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {summaryData.topCategory?.name || 'None'}
          </p>
          <p className="text-xs text-slate-400 mt-2">
            ${summaryData.topCategory?.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'} spent
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-500 font-medium">Daily Average</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <TrendingDown size={16} className="text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            ${summaryData.dailyAverage.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-400 mt-2">Last 30 days</p>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Pie Chart */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-3 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Spending Breakdown</h3>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-full sm:w-1/2 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summaryData.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    animationBegin={200}
                    animationDuration={800}
                  >
                    {summaryData.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full sm:w-1/2 space-y-3">
              {summaryData.pieData.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-slate-600 flex-1">{item.name}</span>
                  <span className="text-sm font-semibold text-slate-800">${item.value.toFixed(2)}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {summaryData.recentTransactions.map((tx, index) => {
              const category = categories.find(c => c.id === tx.category);
              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.06 }}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${category?.color || '#94A3B8'}20` }}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category?.color || '#94A3B8' }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{tx.description}</p>
                    <p className="text-xs text-slate-400">{format(new Date(tx.date), 'MMM d')}</p>
                  </div>
                  <span className={cn(
                    'text-sm font-semibold',
                    tx.type === 'expense' ? 'text-red-500' : 'text-emerald-600'
                  )}>
                    {tx.type === 'expense' ? '-' : '+'}${tx.amount.toFixed(2)}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Weekly Trend */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Weekly Trend</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={summaryData.weeklyData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
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
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#10B981"
                strokeWidth={2.5}
                fill="url(#colorAmount)"
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </motion.div>
  );
}
