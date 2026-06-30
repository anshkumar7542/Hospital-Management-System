import { Activity, CalendarClock, HeartPulse } from 'lucide-react';
import { Card, SectionTitle } from '../components/ui/Card.jsx';
import { BarChart, LineChart } from '../components/ui/Charts.jsx';
import { MotionPage } from '../components/ui/MotionPage.jsx';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { StatCard } from '../components/ui/StatCard.jsx';
import { dashboardStats, notifications, tables } from '../data/appData.js';
import { DataTable } from '../components/ui/DataTable.jsx';
import { useRealtimeStore } from '../store/realtimeStore.js';

export function DashboardPage() {
  const { onlineUsers, dashboardEvents, notifications: realtimeNotifications, connectionStatus } = useRealtimeStore();

  return (
    <MotionPage>
      <PageHeader title="Hospital Dashboard" eyebrow="Live command center" description="A real-time operating view across patients, doctors, revenue, appointments, alerts, and clinical activity." action="Create appointment" />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => <StatCard stat={stat} key={stat.label} />)}
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <SectionTitle title="Connection Status" subtitle="Socket.IO session health" />
          <div className="flex items-center gap-3">
            <span className={`h-3 w-3 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-500' : connectionStatus === 'reconnecting' ? 'bg-amber-500' : 'bg-rose-500'}`} />
            <strong className="capitalize">{connectionStatus.replace('_', ' ')}</strong>
          </div>
        </Card>
        <Card>
          <SectionTitle title="Online Users" subtitle="Authenticated realtime sessions" />
          <strong className="text-3xl">{onlineUsers.length}</strong>
        </Card>
        <Card>
          <SectionTitle title="Realtime Events" subtitle="Live dashboard stream" />
          <strong className="text-3xl">{dashboardEvents.length}</strong>
        </Card>
      </section>
      <section className="grid gap-6 xl:grid-cols-12">
        <Card className="xl:col-span-7">
          <SectionTitle title="Today's Revenue" subtitle="Daily collections and settlement velocity" action="View report" />
          <BarChart />
        </Card>
        <Card className="xl:col-span-5">
          <SectionTitle title="Appointments" subtitle="Consultation flow across the day" action="Calendar" />
          <LineChart />
        </Card>
        <div className="xl:col-span-8">
          <DataTable title="Today's Patients" subtitle="Live queue with clinical ownership" columns={tables.patients.columns} rows={tables.patients.rows} action="Triage" />
        </div>
        <Card className="xl:col-span-4">
          <SectionTitle title="Notifications" subtitle="Priority operational signals" />
          <div className="grid gap-3">
            {(realtimeNotifications.length ? realtimeNotifications : notifications).slice(0, 4).map((item) => (
              <div className="rounded-2xl border bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5" key={item.title}>
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-sky-600 dark:text-sky-300">
                  <HeartPulse size={16} />
                  {item.type || 'Realtime'}
                </div>
                <strong className="block text-slate-950 dark:text-white">{item.title}</strong>
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.body || item.message}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="xl:col-span-5">
          <SectionTitle title="Upcoming Surgeries" subtitle="Operating room schedule" />
          <div className="grid gap-3">
            {['11:30 CABG prep · OT-3', '13:00 Knee arthroscopy · OT-1', '15:20 Appendectomy · OT-2'].map((item) => (
              <div className="flex items-center gap-3 rounded-2xl border bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5" key={item}>
                <CalendarClock className="text-violet-500" size={18} />
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="xl:col-span-7">
          <SectionTitle title="Recent Activity" subtitle="Audited and realtime changes from care and operations teams" action="Audit log" />
          <div className="grid gap-3 sm:grid-cols-2">
            {(dashboardEvents.length ? dashboardEvents.slice(0, 4).map((event) => [event.type, 'Socket.IO', event.payload?.id || 'live', event.emittedAt || 'now']) : tables.activity.rows).map((row) => (
              <div className="flex items-center gap-3 rounded-2xl border bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5" key={row.join('-')}>
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-300"><Activity size={17} /></span>
                <div>
                  <strong className="block text-sm">{row[0]}</strong>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{row[1]} · {row[3]}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </MotionPage>
  );
}
