import { useEffect, useMemo, useState } from 'react';
import { Activity, BedDouble, Building2, CalendarClock, ClipboardList, CreditCard, FileText, HeartPulse, Pill, ShieldCheck, Stethoscope, UserCheck, Users, FlaskConical, AlertTriangle } from 'lucide-react';
import { Card, SectionTitle } from '../components/ui/Card.jsx';
import { BarChart, LineChart } from '../components/ui/Charts.jsx';
import { MotionPage } from '../components/ui/MotionPage.jsx';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { useRealtimeStore } from '../store/realtimeStore.js';
import { useAuthStore } from '../store/authStore.js';
import { useNavigate } from 'react-router-dom';
import { notifications } from '../data/appData.js';
import { apiClient } from '../services/apiClient.js';

function MetricCard({ title, value, caption, icon: Icon, accent }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
          <strong className="mt-2 block text-3xl font-semibold text-slate-950 dark:text-white">{value}</strong>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{caption}</p>
        </div>
        <span className={`grid h-11 w-11 place-items-center rounded-2xl ${accent}`}>
          <Icon size={18} />
        </span>
      </div>
    </Card>
  );
}

const normalizeRole = (value) => {
  const normalized = String(value || 'Guest').trim();
  if (!normalized) return 'Guest';
  const lower = normalized.toLowerCase();
  if (['super admin', 'super_admin', 'superadmin'].includes(lower)) return 'SuperAdmin';
  if (['admin', 'administrator'].includes(lower)) return 'Admin';
  if (['doctor', 'physician'].includes(lower)) return 'Doctor';
  if (['receptionist', 'frontdesk', 'front_desk'].includes(lower)) return 'Receptionist';
  if (['nurse', 'nursing'].includes(lower)) return 'Nurse';
  if (['patient', 'user'].includes(lower)) return 'Patient';
  if (['pharmacist', 'pharmacy'].includes(lower)) return 'Pharmacist';
  if (['lab technician', 'lab_technician', 'labtechnician', 'technician'].includes(lower)) return 'LabTechnician';
  return normalized;
};

const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(Number(value || 0));
const formatAppointmentTime = (appointment) => {
  if (!appointment?.appointment_date) return 'Pending';
  const date = new Date(appointment.appointment_date);
  return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${appointment.start_time || 'TBD'}`;
};
const normalizeStatus = (value) => String(value || 'pending').replace(/_/g, ' ');

export function DashboardPage() {
  const { onlineUsers, dashboardEvents, notifications: realtimeNotifications, connectionStatus } = useRealtimeStore();
  const user = useAuthStore((s) => s.user) || {};
  const role = normalizeRole(user.role_name || user.role || (user.roles && user.roles[0]) || 'Guest');
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [billing, setBilling] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [appointmentsRes, doctorsRes, billingRes, patientsRes] = await Promise.all([
          apiClient.get('/appointments', { params: { limit: 20, offset: 0, sortBy: 'appointment_date', sortOrder: 'asc' } }),
          apiClient.get('/doctors', { params: { limit: 100, offset: 0 } }),
          apiClient.get('/billing', { params: { limit: 100, offset: 0 } }).catch(() => ({ data: { data: [] } })),
          apiClient.get('/patients', { params: { limit: 100, offset: 0 } }).catch(() => ({ data: { data: [] } }))
        ]);
        setAppointments(appointmentsRes?.data?.data || []);
        setDoctors(doctorsRes?.data?.data || []);
        setBilling(billingRes?.data?.data || []);
        setPatients(patientsRes?.data?.data || []);
      } catch {
        setAppointments([]);
        setDoctors([]);
        setBilling([]);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [role]);

  const handleCreate = () => navigate('/appointments/create');
  const handleAppointments = () => navigate('/appointments');
  const handlePatients = () => navigate('/patients');
  const handleBillingPage = () => navigate('/billing');

  const roleMeta = {
    SuperAdmin: {
      title: 'Super Admin Dashboard',
      eyebrow: 'System command center',
      description: 'Oversee all hospital branches, operations, permissions, security, and system health from one place.',
      action: 'Open system overview',
      onAction: handleAppointments
    },
    Admin: {
      title: 'Admin Dashboard',
      eyebrow: 'Operations hub',
      description: 'Monitor approvals, appointments, staffing, admissions, bed occupancy, and hospital performance from one place.',
      action: 'Open appointments',
      onAction: handleAppointments
    },
    Doctor: {
      title: 'Doctor Dashboard',
      eyebrow: 'Clinical workspace',
      description: 'Focus on today’s patients, consultations, and care follow-ups.',
      action: 'View patients',
      onAction: handlePatients
    },
    Patient: {
      title: 'My Dashboard',
      eyebrow: 'Care portal',
      description: 'Track your upcoming visits, reports, and care updates in one place.',
      action: 'Book appointment',
      onAction: handleCreate
    },
    Receptionist: {
      title: 'Reception Dashboard',
      eyebrow: 'Front desk operations',
      description: 'Manage arrivals, check-ins, and appointment flow efficiently.',
      action: 'Manage queue',
      onAction: handleAppointments
    }
  };

  const activeMeta = roleMeta[role] || roleMeta.Admin;

  const today = new Date();
  const todayLabel = today.toDateString();

  const sortedAppointments = useMemo(() => [...appointments].sort((a, b) => new Date(a.appointment_date || 0) - new Date(b.appointment_date || 0)), [appointments]);
  const visibleAppointments = useMemo(() => {
    if (role === 'Doctor') {
      return sortedAppointments.filter((appointment) => {
        const doctorId = appointment.doctor_id ?? appointment.doctorId;
        const doctorName = appointment.doctor_name || appointment.doctorName;
        return doctorId === user?.doctor_id || doctorId === user?.id || doctorName === user?.fullName || doctorName === user?.full_name || doctorName === user?.name;
      });
    }

    if (role === 'Patient') {
      return sortedAppointments.filter((appointment) => {
        const patientId = appointment.patient_id ?? appointment.patientId;
        const patientName = appointment.patient_name || appointment.patientName;
        return patientId === user?.patient_id || patientId === user?.id || patientName === user?.fullName || patientName === user?.full_name || patientName === user?.name;
      });
    }

    return sortedAppointments;
  }, [sortedAppointments, role, user]);
  const todayAppointments = visibleAppointments.filter((appointment) => new Date(appointment.appointment_date || 0).toDateString() === todayLabel);
  const pendingAppointments = visibleAppointments.filter((appointment) => String(appointment.status || '').toLowerCase() === 'pending');
  const upcomingAppointments = visibleAppointments.filter((appointment) => new Date(appointment.appointment_date || 0) >= today && String(appointment.status || '').toLowerCase() !== 'cancelled');
  const revenueToday = billing.reduce((total, item) => total + Number(item.paid_amount || item.total_amount || 0), 0);
  const doctorCount = doctors.length;
  const patientCount = patients.length;
  const criticalAppointments = visibleAppointments.filter((appointment) => String(appointment.status || '').toLowerCase() === 'pending').length;

  const adminMetrics = [
    { title: 'Pending approvals', value: pendingAppointments.length.toString(), caption: 'Appointments waiting review', icon: ClipboardList, accent: 'bg-amber-500/10 text-amber-600 dark:text-amber-300' },
    { title: 'Today’s visits', value: todayAppointments.length.toString(), caption: 'Scheduled consults today', icon: Users, accent: 'bg-sky-500/10 text-sky-600 dark:text-sky-300' },
    { title: 'Active doctors', value: doctorCount.toString(), caption: 'Clinicians available', icon: Stethoscope, accent: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300' },
    { title: 'Revenue today', value: formatCurrency(revenueToday), caption: 'Collections and billing', icon: CreditCard, accent: 'bg-violet-500/10 text-violet-600 dark:text-violet-300' }
  ];

  const superAdminMetrics = [
    { title: 'Hospitals', value: '1', caption: 'Active hospital branch', icon: Building2, accent: 'bg-sky-500/10 text-sky-600 dark:text-sky-300' },
    { title: 'Patients', value: patientCount.toString(), caption: 'Registered patients', icon: Users, accent: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300' },
    { title: 'Critical queue', value: criticalAppointments.toString(), caption: 'Pending approvals', icon: AlertTriangle, accent: 'bg-amber-500/10 text-amber-600 dark:text-amber-300' },
    { title: 'Revenue', value: formatCurrency(revenueToday), caption: 'Hospital collections', icon: CreditCard, accent: 'bg-violet-500/10 text-violet-600 dark:text-violet-300' }
  ];

  const doctorMetrics = [
    { title: 'Today’s patients', value: todayAppointments.length.toString(), caption: 'Assigned consultations', icon: Users, accent: 'bg-sky-500/10 text-sky-600 dark:text-sky-300' },
    { title: 'Pending notes', value: pendingAppointments.length.toString(), caption: 'Follow-up records to finish', icon: FileText, accent: 'bg-amber-500/10 text-amber-600 dark:text-amber-300' },
    { title: 'Next visit', value: upcomingAppointments[0] ? upcomingAppointments[0].start_time || 'TBD' : '—', caption: 'First appointment in queue', icon: CalendarClock, accent: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300' },
    { title: 'Care tasks', value: Math.max(todayAppointments.length, 1).toString(), caption: 'Open treatment actions', icon: ShieldCheck, accent: 'bg-violet-500/10 text-violet-600 dark:text-violet-300' }
  ];

  const patientMetrics = [
    { title: 'Upcoming visit', value: upcomingAppointments[0] ? formatAppointmentTime(upcomingAppointments[0]) : 'No visit yet', caption: 'Next appointment slot', icon: CalendarClock, accent: 'bg-sky-500/10 text-sky-600 dark:text-sky-300' },
    { title: 'Prescriptions', value: Math.max(upcomingAppointments.length, 1).toString(), caption: 'Active medication plans', icon: Pill, accent: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300' },
    { title: 'Reports', value: Math.max(todayAppointments.length, 0).toString(), caption: 'Recent test results', icon: FileText, accent: 'bg-violet-500/10 text-violet-600 dark:text-violet-300' },
    { title: 'Profile', value: 'Verified', caption: 'Account and records ready', icon: UserCheck, accent: 'bg-amber-500/10 text-amber-600 dark:text-amber-300' }
  ];

  const receptionistMetrics = [
    { title: 'Pending check-ins', value: pendingAppointments.length.toString(), caption: 'Patients waiting at desk', icon: UserCheck, accent: 'bg-amber-500/10 text-amber-600 dark:text-amber-300' },
    { title: 'Arrivals today', value: todayAppointments.length.toString(), caption: 'Scheduled front-desk visits', icon: Users, accent: 'bg-sky-500/10 text-sky-600 dark:text-sky-300' },
    { title: 'Billing follow-up', value: billing.length.toString(), caption: 'Pending invoices to confirm', icon: CreditCard, accent: 'bg-violet-500/10 text-violet-600 dark:text-violet-300' },
    { title: 'Queue health', value: 'Stable', caption: 'Flow operating normally', icon: ShieldCheck, accent: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300' }
  ];

  const metricList = role === 'SuperAdmin' ? superAdminMetrics : role === 'Doctor' ? doctorMetrics : role === 'Patient' ? patientMetrics : role === 'Receptionist' ? receptionistMetrics : adminMetrics;

  return (
    <MotionPage>
      <PageHeader title={activeMeta.title} eyebrow={activeMeta.eyebrow} description={activeMeta.description} action={activeMeta.action} onAction={activeMeta.onAction} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricList.map((item) => (
          <MetricCard key={item.title} title={item.title} value={item.value} caption={item.caption} icon={item.icon} accent={item.accent} />
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <SectionTitle title="Connection Status" subtitle="Socket.IO session health" />
          <div className="flex items-center gap-3">
            <span className={`h-3 w-3 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-500' : connectionStatus === 'reconnecting' ? 'bg-amber-500' : 'bg-rose-500'}`} />
            <strong className="capitalize">{connectionStatus.replace('_', ' ')}</strong>
          </div>
        </Card>
        {role !== 'Patient' && (
          <Card>
            <SectionTitle title="Online Users" subtitle="Authenticated realtime sessions" />
            <strong className="text-3xl">{onlineUsers.length}</strong>
          </Card>
        )}
        <Card>
          <SectionTitle title="Realtime Events" subtitle="Live dashboard stream" />
          <strong className="text-3xl">{dashboardEvents.length}</strong>
        </Card>
      </section>

      <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => navigate('/appointments')} className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">Open appointments</button>
          <button type="button" onClick={() => navigate('/patients')} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-white/10 dark:text-slate-200">Open patients</button>
          <button type="button" onClick={() => navigate('/doctors')} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-white/10 dark:text-slate-200">Open doctors</button>
          <button type="button" onClick={() => navigate('/billing')} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-white/10 dark:text-slate-200">Open billing</button>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{loading ? 'Loading live hospital data…' : `Showing ${visibleAppointments.length} relevant appointment records, ${patientCount} patient profiles, and ${doctors.length} doctor profiles.`}</p>
      </section>

      {role === 'SuperAdmin' && (
        <section className="grid gap-6 xl:grid-cols-12">
          <Card className="xl:col-span-7">
            <SectionTitle title="System health" subtitle="Hospitals, staff, and operations monitoring" action="View logs" />
            <div className="grid gap-3">
              {['Branch access', 'Role permissions', 'Backup and security', 'Audit trail'].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border bg-slate-50 p-4 text-sm dark:border-white/10 dark:bg-white/5">
                  <ShieldCheck className="text-sky-600" size={18} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card className="xl:col-span-5">
            <SectionTitle title="Operational alerts" subtitle="Critical reminders for leadership" />
            <div className="grid gap-3">
              {[{ title: 'Pending approvals', body: `${pendingAppointments.length} appointments need review` }, { title: 'Patient volume', body: `${patientCount} patients registered` }, { title: 'Billing follow-up', body: `${billing.length} invoices available for review` }].map((item) => (
                <div key={item.title} className="rounded-2xl border bg-slate-50 p-4 text-sm dark:border-white/10 dark:bg-white/5">
                  <strong>{item.title}</strong>
                  <p className="mt-1 text-slate-500 dark:text-slate-400">{item.body}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}

      {role === 'Admin' && (
        <section className="grid gap-6 xl:grid-cols-12">
          <Card className="xl:col-span-7">
            <SectionTitle title="Today’s Revenue" subtitle="Daily collections and settlement velocity" action="View report" />
            <BarChart />
          </Card>
          <Card className="xl:col-span-5">
            <SectionTitle title="Appointments" subtitle="Consultation flow across the day" action="Calendar" />
            <LineChart />
          </Card>
          <Card className="xl:col-span-6">
            <SectionTitle title="Pending approvals" subtitle="Appointments waiting admin review" />
            <div className="grid gap-3">
              {pendingAppointments.slice(0, 4).map((item) => (
                <div key={item.id} className="rounded-2xl border bg-slate-50 p-3 text-sm dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-center justify-between gap-2">
                    <strong>{item.reason || 'Consultation request'}</strong>
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">{normalizeStatus(item.status)}</span>
                  </div>
                  <p className="mt-1 text-slate-500 dark:text-slate-400">{formatAppointmentTime(item)} · Department {item.department_id || '—'}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card className="xl:col-span-6">
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
        </section>
      )}

      {role === 'Doctor' && (
        <section className="grid gap-6 xl:grid-cols-12">
          <Card className="xl:col-span-7">
            <SectionTitle title="Today’s Schedule" subtitle="Consultations and follow-ups" />
            <div className="grid gap-3">
              {todayAppointments.slice(0, 5).map((item) => (
                <div key={item.id} className="rounded-2xl border bg-slate-50 p-4 text-sm dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-center justify-between gap-3">
                    <strong>{item.reason || 'Consultation'}</strong>
                    <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700 dark:bg-sky-500/20 dark:text-sky-300">{item.start_time || 'TBD'}</span>
                  </div>
                  <p className="mt-1 text-slate-500 dark:text-slate-400">{formatAppointmentTime(item)} · {normalizeStatus(item.status)}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card className="xl:col-span-5">
            <SectionTitle title="Care Tasks" subtitle="Clinician actions pending" />
            <div className="grid gap-3">
              {['Review today’s appointments', 'Update treatment plan', 'Notify patient about medicine change'].map((item) => (
                <div className="flex items-center gap-3 rounded-2xl border bg-slate-50 p-4 text-sm dark:border-white/10 dark:bg-white/5" key={item}>
                  <ClipboardList className="text-sky-600" size={18} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}

      {role === 'Patient' && (
        <section className="grid gap-6 xl:grid-cols-12">
          <Card className="xl:col-span-7">
            <SectionTitle title="Upcoming Visits" subtitle="Your next care appointments" />
            <div className="grid gap-3">
              {upcomingAppointments.slice(0, 4).map((item) => (
                <div key={item.id} className="rounded-2xl border bg-slate-50 p-4 text-sm dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-center justify-between gap-3">
                    <strong>{item.reason || 'Health visit'}</strong>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">{normalizeStatus(item.status)}</span>
                  </div>
                  <p className="mt-1 text-slate-500 dark:text-slate-400">{formatAppointmentTime(item)}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card className="xl:col-span-5">
            <SectionTitle title="My Records" subtitle="Recent reports and prescriptions" />
            <div className="grid gap-3">
              {['Lab report ready', 'Prescription updated', 'Doctor note shared'].map((item) => (
                <div className="flex items-center gap-3 rounded-2xl border bg-slate-50 p-4 text-sm dark:border-white/10 dark:bg-white/5" key={item}>
                  <FileText className="text-emerald-600" size={18} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}

      {role === 'Receptionist' && (
        <section className="grid gap-6 xl:grid-cols-12">
          <Card className="xl:col-span-7">
            <SectionTitle title="Front Desk Queue" subtitle="Patients waiting for check-in" />
            <div className="grid gap-3">
              {todayAppointments.slice(0, 4).map((item) => (
                <div key={item.id} className="rounded-2xl border bg-slate-50 p-4 text-sm dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-center justify-between gap-3">
                    <strong>{item.reason || 'Appointment'}</strong>
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">{normalizeStatus(item.status)}</span>
                  </div>
                  <p className="mt-1 text-slate-500 dark:text-slate-400">{formatAppointmentTime(item)} · Department {item.department_id || '—'}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card className="xl:col-span-5">
            <SectionTitle title="Today’s Arrivals" subtitle="Appointments requiring desk support" />
            <div className="grid gap-3">
              {['Check patient in', 'Collect payment', 'Confirm doctor availability'].map((item) => (
                <div className="flex items-center gap-3 rounded-2xl border bg-slate-50 p-4 text-sm dark:border-white/10 dark:bg-white/5" key={item}>
                  <UserCheck className="text-sky-600" size={18} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}
    </MotionPage>
  );
}
