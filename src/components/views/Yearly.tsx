import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { useExpense } from '@/hooks/useExpenseContext';
import {
  format,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  subYears,
  addYears,
} from 'date-fns';
import { cn } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

export function Yearly() {
  const { transactions, categories } = useExpense();
  const [currentYear, setCurrentYear] = useState(new Date());
  const [chartMode, setChartMode] = useState<'spending' | 'net'>('spending');

  const months = eachMonthOfInterval({ start: startOfYear(currentYear), end: endOfYear(currentYear) });

  const yearlyData = useMemo(() => {
    const monthData = months.map(month => {
      const monthTransactions = transactions.filter(t => {
        const tDate = t.date.substring(0, 7);
        return tDate === format(month, 'yyyy-MM');
      });

      const spent = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        month: format(month, 'MMM'),
        fullMonth: format(month, 'MMMM'),
        spent: Math.round(spent * 100) / 100,
        income: Math.round(income * 100) / 100,
        net: Math.round((income - spent) * 100) / 100,
      };
    });

    const totalSpent = monthData.reduce((sum, m) => sum + m.spent, 0);
    const totalIncome = monthData.reduce((sum, m) => sum + m.income, 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpent) / totalIncome) * 100 : 0;
    const monthlyAverage = totalSpent / 12;

    // Category heatmap data
    const categoryHeatmap: { category: string; color: string; monthly: number[] }[] = [];
    const expenseCategories = categories.filter(c => !['salary', 'freelance', 'investment'].includes(c.id));
    
    expenseCategories.forEach(cat => {
      const monthly: number[] = [];
      months.forEach((month) => {
        const monthStr = format(month, 'yyyy-MM');
        const total = transactions
          .filter(t => t.type === 'expense' && t.category === cat.id && t.date.startsWith(monthStr))
          .reduce((sum, t) => sum + t.amount, 0);
        monthly.push(Math.round(total * 100) / 100);
      });
      const yearTotal = monthly.reduce((a, b) => a + b, 0);
      if (yearTotal > 0) {
        categoryHeatmap.push({ category: cat.name, color: cat.color, monthly });
      }
    });

    // Sort by total spending
    categoryHeatmap.sort((a, b) => {
      const totalA = a.monthly.reduce((x, y) => x + y, 0);
      const totalB = b.monthly.reduce((x, y) => x + y, 0);
      return totalB - totalA;
    });

    // Normalize for heatmap
    const maxVal = Math.max(...categoryHeatmap.flatMap(c => c.monthly), 1);
    const normalizedHeatmap = categoryHeatmap.map(cat => ({
      ...cat,
      monthly: cat.monthly.map(v => v / maxVal),
      rawMonthly: cat.monthly,
    }));

    return {
      monthData,
      totalSpent,
      totalIncome,
      savingsRate,
      monthlyAverage,
      heatmap: normalizedHeatmap.slice(0, 8),
    };
  }, [transactions, categories, months]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Year Navigation */}
      <motion.div variants={itemVariants} className="flex items-center justify-between bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <button
          onClick={() => setCurrentYear(subYears(currentYear, 1))}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ChevronLeft size={20} className="text-slate-600" />
        </button>
        <h3 className="text-lg font-semibold text-slate-800">
          {format(currentYear, 'yyyy')}
        </h3>
        <button
          onClick={() => setCurrentYear(addYears(currentYear, 1))}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ChevronRight size={20} className="text-slate-600" />
        </button>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <TrendingDown size={16} className="text-red-500" />
            </div>
            <span className="text-xs text-slate-500 font-medium">Total Spent</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            ${yearlyData.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <TrendingUp size={16} className="text-emerald-600" />
            </div>
            <span className="text-xs text-slate-500 font-medium">Total Income</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600">
            ${yearlyData.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <PiggyBank size={16} className="text-amber-600" />
            </div>
            <span className="text-xs text-slate-500 font-medium">Savings Rate</span>
          </div>
          <p className={cn(
            'text-2xl font-bold',
            yearlyData.savingsRate >= 0 ? 'text-emerald-600' : 'text-red-500'
          )}>
            {yearlyData.savingsRate.toFixed(1)}%
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <TrendingUp size={16} className="text-blue-600" />
            </div>
            <span className="text-xs text-slate-500 font-medium">Monthly Avg</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            ${yearlyData.monthlyAverage.toFixed(0)}
          </p>
        </motion.div>
      </div>

      {/* Area Chart */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Yearly Overview</h3>
          <div className="flex bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => setChartMode('spending')}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                chartMode === 'spending' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
              )}
            >
              Spending
            </button>
            <button
              onClick={() => setChartMode('net')}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                chartMode === 'net' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
              )}
            >
              Net
            </button>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={yearlyData.monthData}>
              <defs>
                <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#94A3B8' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#94A3B8' }}
                tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              />
              <Tooltip
                formatter={(value: number) => [`$${value.toFixed(2)}`, chartMode === 'spending' ? 'Spent' : 'Net']}
                contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Area
                type="monotone"
                dataKey={chartMode === 'spending' ? 'spent' : 'net'}
                stroke={chartMode === 'spending' ? '#EF4444' : '#10B981'}
                strokeWidth={2.5}
                fill={chartMode === 'spending' ? 'url(#colorSpent)' : 'url(#colorNet)'}
                animationDuration={1200}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Category Heatmap */}
      {yearlyData.heatmap.length > 0 && (
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Category Heatmap</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left text-xs text-slate-400 font-medium pb-3 pr-4">Category</th>
                  {months.map(m => (
                    <th key={m.getTime()} className="text-center text-xs text-slate-400 font-medium pb-3 w-12">
                      {format(m, 'MMM')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {yearlyData.heatmap.map((row, rowIndex) => (
                  <motion.tr
                    key={row.category}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: rowIndex * 0.05 }}
                  >
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: row.color }} />
                        <span className="text-xs text-slate-600 whitespace-nowrap">{row.category}</span>
                      </div>
                    </td>
                    {row.monthly.map((intensity, colIndex) => (
                      <td key={colIndex} className="py-1 px-0.5">
                        <div
                          className="w-full h-8 rounded-md transition-all"
                          style={{
                            backgroundColor: intensity > 0 ? row.color : '#F1F5F9',
                            opacity: intensity > 0 ? 0.15 + intensity * 0.85 : 1,
                          }}
                          title={`${row.category} - ${format(months[colIndex], 'MMMM')}: $${row.rawMonthly[colIndex].toFixed(2)}`}
                        />
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-2 mt-3 justify-end">
            <span className="text-xs text-slate-400">Less</span>
            <div className="flex gap-0.5">
              {[0.15, 0.4, 0.65, 0.9, 1].map((op, i) => (
                <div key={i} className="w-4 h-4 rounded-sm bg-emerald-500" style={{ opacity: op }} />
              ))}
            </div>
            <span className="text-xs text-slate-400">More</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
