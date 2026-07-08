import { AnimatePresence, motion } from 'framer-motion';
import { ExpenseProvider } from '@/hooks/useExpenseContext';
import { UIProvider, useUI } from '@/hooks/useUIContext';
import { Sidebar } from '@/components/Sidebar';
import { Toast } from '@/components/Toast';
import { Dashboard } from '@/components/views/Dashboard';
import { Daily } from '@/components/views/Daily';
import { Weekly } from '@/components/views/Weekly';
import { Monthly } from '@/components/views/Monthly';
import { Yearly } from '@/components/views/Yearly';
import { Categories } from '@/components/views/Categories';
import './App.css';

const viewComponents: Record<string, React.ComponentType> = {
  dashboard: Dashboard,
  daily: Daily,
  weekly: Weekly,
  monthly: Monthly,
  yearly: Yearly,
  categories: Categories,
};

const viewTitles: Record<string, string> = {
  dashboard: 'Hi Numan',
  daily: 'Daily Tracker',
  weekly: 'Weekly Overview',
  monthly: 'Monthly Calendar',
  yearly: 'Yearly Insights',
  categories: 'Categories',
};

function AppContent() {
  const { activeView, sidebarCollapsed } = useUI();
  const CurrentView = viewComponents[activeView] || Dashboard;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar />

      {/* Main Content */}
      <motion.main
        initial={false}
        animate={{ marginLeft: sidebarCollapsed ? 72 : 240 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="min-h-screen p-6 lg:p-8"
      >
        {/* Header */}
        <div className="mb-8">
          <motion.h1
            key={activeView}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl lg:text-3xl font-bold text-slate-800"
          >
            {viewTitles[activeView]}
          </motion.h1>
          <motion.p
            key={`${activeView}-subtitle`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-slate-400 mt-1"
          >
            Track and manage your expenses
          </motion.p>
        </div>

        {/* View Content with Transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <CurrentView />
          </motion.div>
        </AnimatePresence>
      </motion.main>

      <Toast />
    </div>
  );
}

function App() {
  return (
    <ExpenseProvider>
      <UIProvider>
        <AppContent />
      </UIProvider>
    </ExpenseProvider>
  );
}

export default App;
