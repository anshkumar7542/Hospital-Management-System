import { AnimatePresence, motion } from 'framer-motion';
import { Laptop, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext.jsx';

const themeIcons = {
  light: Sun,
  dark: Moon,
  system: Laptop
};

export function ThemeToggle({ compact = false }) {
  const { theme, setTheme, cycleTheme } = useTheme();
  const Icon = themeIcons[theme];

  if (compact) {
    return (
      <button
        className="grid h-11 w-11 place-items-center rounded-2xl border bg-white shadow-soft transition-colors duration-300 dark:border-white/10 dark:bg-white/5"
        onClick={cycleTheme}
        aria-label="Cycle theme"
        title={`Theme: ${theme}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={theme}
            initial={{ opacity: 0, rotate: -35, scale: 0.9 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 35, scale: 0.9 }}
            transition={{ duration: 0.18 }}
          >
            <Icon size={18} />
          </motion.span>
        </AnimatePresence>
      </button>
    );
  }

  return (
    <div className="grid grid-cols-3 rounded-2xl border bg-white/75 p-1 shadow-soft backdrop-blur-xl transition-colors duration-300 dark:border-white/10 dark:bg-white/5">
      {[
        ['light', Sun],
        ['dark', Moon],
        ['system', Laptop]
      ].map(([mode, ModeIcon]) => (
        <button
          className={`flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition-all duration-300 ${
            theme === mode
              ? 'bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950'
              : 'text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
          }`}
          key={mode}
          onClick={() => setTheme(mode)}
          type="button"
        >
          <ModeIcon size={16} />
          <span className="hidden sm:inline">{mode[0].toUpperCase() + mode.slice(1)}</span>
        </button>
      ))}
    </div>
  );
}
