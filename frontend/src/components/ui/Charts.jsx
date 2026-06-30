import { motion } from 'framer-motion';

export function BarChart({ values = [42, 38, 46, 52, 49, 61, 58] }) {
  const max = Math.max(...values);
  return (
    <div className="grid h-64 grid-cols-7 items-end gap-3 pt-4">
      {values.map((value, index) => (
        <div className="grid h-full grid-rows-[1fr_24px] gap-2" key={`${value}-${index}`}>
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(value / max) * 100}%` }}
            transition={{ duration: 0.75, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="self-end rounded-t-2xl rounded-b-lg bg-gradient-to-b from-sky-400 to-blue-600 shadow-lg shadow-blue-500/20"
          />
          <span className="text-center text-xs text-slate-500 dark:text-slate-400">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</span>
        </div>
      ))}
    </div>
  );
}

export function LineChart({ values = [18, 24, 21, 34, 28, 39, 44, 36, 48, 43, 51, 57] }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 88 - ((value - min) / (max - min)) * 68;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="h-64">
      <svg className="h-52 w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="flowLine" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="55%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>
        <motion.polyline
          points={points}
          fill="none"
          stroke="url(#flowLine)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        />
      </svg>
      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <span>08:00</span>
        <strong className="text-emerald-600 dark:text-emerald-300">+31% flow</strong>
        <span>20:00</span>
      </div>
    </div>
  );
}
