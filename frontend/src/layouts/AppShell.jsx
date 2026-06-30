import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Bell, Command, Menu, Search, Sparkles, UserRound, X } from 'lucide-react';
import { navItems } from '../data/appData.js';
import { ThemeToggle } from '../components/ui/ThemeToggle.jsx';
import { useRealtime } from '../hooks/useRealtime.js';
import { useAuthStore } from '../store/authStore.js';

export function AppShell() {
  const [open, setOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const { connectionStatus, onlineUsers, notifications, reconnectAttempt, lastError } = useRealtime();
  const isConnected = connectionStatus === 'connected';
  const displayName = user?.fullName || user?.full_name || user?.name || user?.role || 'Profile';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 transition-colors duration-300 dark:bg-[#080b12] dark:text-white">
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 border-r bg-white/85 p-4 shadow-soft backdrop-blur-xl transition-transform dark:border-white/10 dark:bg-slate-950/80 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-8 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-500 text-white shadow-lg shadow-blue-500/25">
              <Sparkles size={19} />
            </span>
            <span>
              <strong className="block text-sm">HelixCare</strong>
              <span className="text-xs text-slate-500 dark:text-slate-400">Hospital OS</span>
            </span>
          </Link>
          <button className="grid h-10 w-10 place-items-center rounded-xl border lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="grid gap-1">
          {navItems.map((item) => (
            <NavLink
              to={item.path}
              key={item.path}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500/15 to-emerald-500/10 text-slate-950 dark:text-white'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between gap-4 border-b bg-slate-50/80 px-4 backdrop-blur-xl dark:border-white/10 dark:bg-[#080b12]/75 sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button className="grid h-11 w-11 place-items-center rounded-2xl border bg-white dark:border-white/10 dark:bg-white/5 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu size={19} />
            </button>
            <div className="hidden h-12 max-w-xl flex-1 items-center gap-3 rounded-2xl border bg-white/80 px-4 shadow-soft dark:border-white/10 dark:bg-white/5 sm:flex">
              <Search size={18} className="text-slate-400" />
              <input className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="Search patients, invoices, doctors..." />
              <kbd className="inline-flex items-center gap-1 rounded-lg border bg-slate-50 px-2 py-1 text-xs text-slate-500 dark:border-white/10 dark:bg-white/5">
                <Command size={13} /> K
              </kbd>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="hidden h-11 items-center gap-2 rounded-2xl border bg-white px-3 text-xs font-semibold text-slate-600 shadow-soft transition-colors duration-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 md:flex"
              title={lastError || connectionStatus}
            >
              <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500' : connectionStatus === 'reconnecting' ? 'bg-amber-500' : 'bg-rose-500'}`} />
              {connectionStatus === 'reconnecting' ? `Reconnecting ${reconnectAttempt}` : connectionStatus}
            </div>
            <div className="hidden h-11 items-center rounded-2xl border bg-white px-3 text-xs font-semibold text-slate-600 shadow-soft dark:border-white/10 dark:bg-white/5 dark:text-slate-300 md:flex">
              {onlineUsers.length} online
            </div>
            <button className="relative grid h-11 w-11 place-items-center rounded-2xl border bg-white shadow-soft dark:border-white/10 dark:bg-white/5" aria-label="Notifications">
              <Bell size={18} />
              {notifications.length > 0 && <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950" />}
            </button>
            <ThemeToggle compact />
            <Link to="/profile" className="hidden h-11 items-center gap-2 rounded-2xl border bg-white px-3 text-sm font-medium shadow-soft dark:border-white/10 dark:bg-white/5 sm:flex">
              <UserRound size={17} />
              {displayName}
            </Link>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
