import { motion } from 'framer-motion';
import { fadeUp } from './MotionPage.jsx';

export function StatCard({ stat }) {
  return (
    <motion.article variants={fadeUp} whileHover={{ y: -4 }} className="surface relative overflow-hidden rounded-3xl p-5">
      <div className={`mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${stat.tone} text-white shadow-lg`}>
        <stat.icon size={21} />
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
      <div className="mt-2 flex items-end justify-between gap-4">
        <strong className="text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">{stat.value}</strong>
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">{stat.delta}</span>
      </div>
    </motion.article>
  );
}
