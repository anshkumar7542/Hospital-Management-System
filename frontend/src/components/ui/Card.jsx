import { motion } from 'framer-motion';
import { fadeUp } from './MotionPage.jsx';

export function Card({ children, className = '' }) {
  return (
    <motion.section variants={fadeUp} className={`surface rounded-3xl p-5 sm:p-6 ${className}`}>
      {children}
    </motion.section>
  );
}

export function SectionTitle({ title, subtitle, action }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {action && (
        <button className="rounded-xl border bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          {action}
        </button>
      )}
    </div>
  );
}
