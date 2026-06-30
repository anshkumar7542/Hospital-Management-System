import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, ShieldCheck, Sparkles, Stethoscope, WalletCards } from 'lucide-react';

const features = [
  { title: 'Clinical command center', body: 'Patient flow, appointments, and alerts in one calm workspace.', icon: Stethoscope },
  { title: 'Secure by design', body: 'Role-aware experiences built for hospital operations.', icon: ShieldCheck },
  { title: 'Revenue clarity', body: 'Billing, payments, and collection signals without operational noise.', icon: WalletCards }
];

export function LandingPage() {
  return (
    <div className="grid flex-1 content-center gap-12 py-8 lg:grid-cols-[1fr_520px] lg:items-center">
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="max-w-4xl">
        <div className="mb-6 flex w-fit items-center gap-2 rounded-full border bg-white/70 px-3 py-1.5 text-sm font-medium text-sky-700 shadow-soft backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-sky-300">
          <Sparkles size={15} />
          Modern hospital operations
        </div>
        <h1 className="text-5xl font-semibold tracking-normal text-slate-950 dark:text-white sm:text-7xl">HelixCare Hospital OS</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
          A premium SaaS workspace for hospitals to coordinate patients, doctors, billing, medicines, records, and operational alerts.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/login" className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 font-semibold text-white shadow-soft transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950">
            Open dashboard
            <ArrowRight size={18} />
          </Link>
          <Link to="/register" className="inline-flex h-12 items-center justify-center rounded-2xl border bg-white/80 px-5 font-semibold text-slate-700 shadow-soft dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
            Create account
          </Link>
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.55, delay: 0.1 }} className="glass rounded-[2rem] p-5">
        <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white dark:bg-white/5">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Today</p>
              <strong className="text-3xl">$48.2k</strong>
            </div>
            <CalendarDays className="text-cyan-300" />
          </div>
          <div className="grid gap-3">
            {features.map((feature) => (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4" key={feature.title}>
                <feature.icon className="mb-3 text-emerald-300" size={20} />
                <strong className="block">{feature.title}</strong>
                <span className="mt-1 block text-sm leading-6 text-slate-400">{feature.body}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
}
