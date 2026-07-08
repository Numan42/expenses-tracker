import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  CalendarDays,
  CalendarRange,
  Calendar,
  BarChart3,
  Tags,
  Wallet,
  CircleUser,
  ChevronLeft,
  ChevronRight,
  
} from 'lucide-react';
import { useUI } from '@/hooks/useUIContext';
import type { ViewType } from '@/types';
import { cn } from '@/lib/utils';

const navItems: { view: ViewType; label: string; icon: React.ReactNode }[] = [
  { view: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { view: 'daily', label: 'Daily', icon: <CalendarDays size={20} /> },
  { view: 'weekly', label: 'Weekly', icon: <CalendarRange size={20} /> },
  { view: 'monthly', label: 'Monthly', icon: <Calendar size={20} /> },
  { view: 'yearly', label: 'Yearly', icon: <BarChart3 size={20} /> },
  { view: 'categories', label: 'Categories', icon: <Tags size={20} /> },
];

export function Sidebar() {
  const { activeView, setActiveView, sidebarCollapsed, toggleSidebar } = useUI();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 72 : 240 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col z-50 shadow-sm"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-100">
        <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
          <Wallet size={18} className="text-white" />
        </div>
        {!sidebarCollapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="font-semibold text-slate-800 text-lg whitespace-nowrap"
          >
            SpendWise
          </motion.span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => setActiveView(item.view)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative',
              activeView === item.view
                ? 'text-emerald-700'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            )}
          >
            {activeView === item.view && (
              <motion.div
                layoutId="activeNav"
                className="absolute inset-0 bg-emerald-50 rounded-xl border border-emerald-100"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex-shrink-0">{item.icon}</span>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative z-10 whitespace-nowrap"
              >
                {item.label}
              </motion.span>
            )}
          </button>
        ))}
      </nav>

      {/* Toggle Button */}
      <div className="px-3 pb-4">
      <button
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
        >
          {sidebarCollapsed ? <CircleUser  size={24} /> : <><CircleUser  size={24} /></>}
        </button>
        
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /></>}
        </button>
      </div>
    </motion.aside>
  );
}