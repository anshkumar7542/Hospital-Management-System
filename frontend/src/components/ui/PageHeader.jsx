import { motion } from 'framer-motion';
import { Plus, Sparkles } from 'lucide-react';
import { fadeUp } from './MotionPage.jsx';

export function PageHeader({ eyebrow = 'Workspace', title, description, action = 'New record' }) {
  return (
    <motion.section
      variants={fadeUp}
      className="overflow-hidden rounded-[2rem] border bg-white/80 p-6 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60 sm:p-8"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="mb-4 flex w-fit items-center gap-2 rounded-full border bg-white/70 px-3 py-1.5 text-sm font-medium text-sky-700 dark:border-white/10 dark:bg-white/5 dark:text-sky-300">
            <Sparkles size={15} />
            {eyebrow}
          </div>
          <h1 className="text-4xl font-semibold tracking-normal text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">{description}</p>
        </div>
        {action && (
          <button className="inline-flex h-11 w-fit items-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950">
            <Plus size={17} />
            {action}
          </button>
        )}
      </div>
    </motion.section>
  );
}
