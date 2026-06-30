import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { useToastStore } from '../../store/toastStore.js';

const icons = {
  success: CheckCircle2,
  error: TriangleAlert,
  info: Info
};

export function ToastViewport() {
  const { toasts, dismissToast } = useToastStore();

  return (
    <div className="fixed right-4 top-4 z-[80] grid w-[calc(100vw-32px)] max-w-sm gap-3">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type] || Info;
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="glass rounded-2xl p-4"
              role="status"
            >
              <div className="flex items-start gap-3">
                <Icon className={toast.type === 'error' ? 'text-rose-500' : toast.type === 'success' ? 'text-emerald-500' : 'text-sky-500'} size={18} />
                <div className="min-w-0 flex-1">
                  <strong className="block text-sm text-slate-950 dark:text-white">{toast.title}</strong>
                  {toast.message && <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">{toast.message}</p>}
                </div>
                <button className="rounded-lg p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white" onClick={() => dismissToast(toast.id)} aria-label="Dismiss notification">
                  <X size={15} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
