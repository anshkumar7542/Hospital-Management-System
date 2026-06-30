import { Outlet } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { ThemeToggle } from '../components/ui/ThemeToggle.jsx';

export function PublicLayout() {
  return (
    <main className="min-h-screen bg-slate-50 bg-premium-radial px-4 py-6 transition-colors duration-300 dark:bg-[#080b12] sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-48px)] max-w-7xl flex-col">
        <div className="mb-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-500 text-white shadow-lg shadow-blue-500/25">
              <Sparkles size={19} />
            </span>
            <div>
              <strong className="block text-sm text-slate-950 dark:text-white">HelixCare</strong>
              <span className="text-xs text-slate-500 dark:text-slate-400">Hospital OS</span>
            </div>
          </div>
          <ThemeToggle />
        </div>
        <Outlet />
      </div>
    </main>
  );
}
