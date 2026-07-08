import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useUI } from '@/hooks/useUIContext';
import { cn } from '@/lib/utils';

export function Toast() {
  const { toast } = useUI();

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -50, x: '-50%' }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={cn(
            'fixed top-6 left-1/2 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border',
            toast.type === 'success' && 'bg-emerald-50 border-emerald-200 text-emerald-700',
            toast.type === 'error' && 'bg-red-50 border-red-200 text-red-700',
            toast.type === 'info' && 'bg-blue-50 border-blue-200 text-blue-700'
          )}
        >
          {toast.type === 'success' && <CheckCircle size={18} />}
          {toast.type === 'error' && <AlertCircle size={18} />}
          {toast.type === 'info' && <Info size={18} />}
          <span className="text-sm font-medium">{toast.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
