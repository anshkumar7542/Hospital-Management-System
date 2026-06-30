import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, FileText, LogOut, RefreshCcw, Search, UserRound } from 'lucide-react';
import { Card, SectionTitle } from '../components/ui/Card.jsx';
import { DataTable } from '../components/ui/DataTable.jsx';
import { EmptyState, ErrorState, TableSkeleton } from '../components/ui/AsyncStates.jsx';
import { MotionPage } from '../components/ui/MotionPage.jsx';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { useResourceQuery } from '../hooks/useResourceQuery.js';
import { notifications, settings, tables } from '../data/appData.js';
import { useAuthStore } from '../store/authStore.js';
import { useToastStore } from '../store/toastStore.js';

const pageMeta = {
  doctors: ['Doctors', 'Credentialed clinician coverage, workload, availability, and department ownership.', tables.doctors, 'full_name'],
  patients: ['Patients', 'Patient registry, triage priority, case ownership, and care journey visibility.', tables.patients, 'full_name'],
  appointments: ['Appointments', 'Daily schedule, consultation status, check-ins, cancellations, and wait time control.', tables.appointments, 'appointment_date'],
  records: ['Medical Records', 'Secure longitudinal medical documentation, reports, clinical notes, and uploads.', tables.records, 'updated_at'],
  billing: ['Billing', 'Invoices, balances, discounts, insurance coordination, and revenue operations.', tables.billing, 'invoice_number'],
  payments: ['Payments', 'Settlements, payment methods, transaction references, and reconciliation state.', tables.payments, 'payment_date'],
  medicines: ['Medicines', 'Pharmacy catalogue, stock posture, reorder signals, and expiry awareness.', tables.medicines, 'name'],
  departments: ['Departments', 'Clinical department structure, capacity, leadership, and operational status.', tables.departments, 'name'],
  activity: ['Activity Logs', 'Audit trail of sensitive actions across users, patient data, billing, and access.', tables.activity, 'created_at']
};

const aliases = {
  doctors: {
    Doctor: ['full_name', 'name', 'doctor_name', 'user_name'],
    Department: ['department_name', 'department', 'specialization'],
    Status: ['status', 'availability_status'],
    Load: ['workload', 'consultation_fee', 'experience_years']
  },
  patients: {
    Patient: ['full_name', 'name', 'patient_name'],
    'Case ID': ['patient_code', 'case_id', 'id'],
    Department: ['department_name', 'department', 'blood_group'],
    Priority: ['priority', 'status', 'gender']
  },
  appointments: {
    Time: ['appointment_time', 'scheduled_time', 'appointment_date'],
    Patient: ['patient_name', 'patient_id'],
    Doctor: ['doctor_name', 'doctor_id'],
    Status: ['status']
  },
  records: {
    Record: ['title', 'record_type', 'diagnosis', 'id'],
    Patient: ['patient_name', 'patient_id'],
    Owner: ['doctor_name', 'doctor_id'],
    Updated: ['updated_at', 'created_at']
  },
  billing: {
    Invoice: ['invoice_number', 'id'],
    Patient: ['patient_name', 'patient_id'],
    Amount: ['total_amount', 'amount', 'balance_amount'],
    Status: ['status', 'payment_status']
  },
  payments: {
    Reference: ['transaction_reference', 'reference_number', 'id'],
    Method: ['payment_method', 'method'],
    Amount: ['amount', 'paid_amount'],
    Status: ['status']
  },
  medicines: {
    Medicine: ['name', 'medicine_name'],
    Category: ['category', 'manufacturer'],
    Stock: ['stock_quantity', 'quantity'],
    Status: ['status', 'reorder_level']
  },
  departments: {
    Department: ['name', 'department_name'],
    Head: ['head_doctor_name', 'head_doctor_id'],
    Capacity: ['capacity', 'floor', 'phone'],
    Status: ['status']
  },
  activity: {
    Action: ['action', 'event_type'],
    Actor: ['actor_name', 'user_id'],
    Entity: ['entity_type', 'entity_id'],
    Time: ['created_at']
  }
};

const formatCell = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'number') return value.toLocaleString();
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) return new Date(value).toLocaleString();
  return value;
};

const resolveValue = (record, type, column) => {
  const keys = aliases[type]?.[column] || [column.toLowerCase().replaceAll(' ', '_')];
  const key = keys.find((candidate) => record[candidate] !== undefined && record[candidate] !== null && record[candidate] !== '');
  return formatCell(key ? record[key] : undefined);
};

const toTableRows = (type, columns, records) =>
  records.map((record) => ({
    id: record.id || JSON.stringify(record),
    raw: record,
    optimistic: record.optimistic,
    cells: columns.map((column) => resolveValue(record, type, column))
  }));

function ResourceToolbar({ searchDraft, onSearchDraft, params, onParams, total, isRefreshing, onRetry }) {
  return (
    <Card>
      <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-center">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            value={searchDraft}
            onChange={(event) => onSearchDraft(event.target.value)}
            placeholder="Search records"
            className="h-12 w-full rounded-2xl border bg-white/80 pl-11 pr-4 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 dark:border-white/10 dark:bg-white/5"
          />
        </label>
        <select
          value={`${params.sortBy}:${params.sortOrder}`}
          onChange={(event) => {
            const [sortBy, sortOrder] = event.target.value.split(':');
            onParams({ sortBy, sortOrder });
          }}
          className="h-12 rounded-2xl border bg-white/80 px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5"
        >
          <option value="id:desc">Newest first</option>
          <option value="id:asc">Oldest first</option>
          <option value={`${params.sortBy}:asc`}>Current field A-Z</option>
          <option value={`${params.sortBy}:desc`}>Current field Z-A</option>
        </select>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border bg-white/80 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
        >
          <RefreshCcw className={isRefreshing ? 'animate-spin' : ''} size={16} />
          {total.toLocaleString()} records
        </button>
      </div>
    </Card>
  );
}

function Pagination({ meta, onPage }) {
  if (!meta) return null;
  const page = Number(meta.page || 1);
  const totalPages = Math.max(Number(meta.totalPages || 1), 1);

  return (
    <div className="flex flex-col gap-3 rounded-3xl border bg-white/70 p-4 text-sm dark:border-white/10 dark:bg-white/5 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-slate-500 dark:text-slate-400">
        Page {page} of {totalPages} | {Number(meta.total || 0).toLocaleString()} total
      </span>
      <div className="flex gap-2">
        <button disabled={page <= 1} onClick={() => onPage(page - 1)} className="h-10 rounded-2xl border px-4 font-semibold disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10">
          Previous
        </button>
        <button disabled={page >= totalPages} onClick={() => onPage(page + 1)} className="h-10 rounded-2xl bg-slate-950 px-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-slate-950">
          Next
        </button>
      </div>
    </div>
  );
}

export function ResourcePage({ type }) {
  const [title, description, table, defaultSortBy] = pageMeta[type];
  const query = useResourceQuery(type, { sortBy: defaultSortBy });
  const [searchDraft, setSearchDraft] = useState(query.params.search || '');

  useEffect(() => {
    const timer = window.setTimeout(() => query.setParams({ search: searchDraft }), 350);
    return () => window.clearTimeout(timer);
  }, [searchDraft]);

  const rows = useMemo(() => toTableRows(type, table.columns, query.rows), [query.rows, table.columns, type]);
  const isLoading = query.status === 'loading';
  const isRefreshing = query.status === 'refreshing';
  const total = Number(query.meta?.total || query.rows.length || 0);

  return (
    <MotionPage>
      <PageHeader title={title} eyebrow="Hospital workspace" description={description} action={null} />
      <section className="grid gap-4 md:grid-cols-3">
        {[
          ['Visible', total, 'from live API'],
          ['Page size', query.params.limit, 'records per page'],
          ['Status', isRefreshing ? 'Syncing' : 'Ready', 'cached for fast return']
        ].map(([label, value, caption]) => (
          <Card key={label}>
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <strong className="mt-2 block text-3xl font-semibold">{value}</strong>
            <span className="mt-3 block text-sm text-emerald-600 dark:text-emerald-300">{caption}</span>
          </Card>
        ))}
      </section>

      <ResourceToolbar
        searchDraft={searchDraft}
        onSearchDraft={setSearchDraft}
        params={query.params}
        onParams={query.setParams}
        total={total}
        isRefreshing={isRefreshing}
        onRetry={query.retry}
      />

      {isLoading && <TableSkeleton columns={table.columns.length} />}
      {query.status === 'error' && <ErrorState message={query.error} onRetry={query.retry} />}
      {!isLoading && query.status !== 'error' && rows.length === 0 && <EmptyState title={`No ${title.toLowerCase()} found`} />}
      {!isLoading && query.status !== 'error' && rows.length > 0 && (
        <>
          <DataTable
            title={`${title} Directory`}
            subtitle="Live records with cached reads, API retries, and optimistic row actions."
            columns={table.columns}
            rows={rows}
            action={isRefreshing ? 'Syncing' : 'Live'}
            onDelete={query.optimisticDelete}
          />
          <Pagination meta={query.meta} onPage={(page) => query.setParams({ page })} />
        </>
      )}
    </MotionPage>
  );
}

export function SettingsPage() {
  return (
    <MotionPage>
      <PageHeader title="Settings" eyebrow="Admin controls" description="Configure access, authentication, hospital identity, and operational preferences." action="Save changes" />
      <section className="grid gap-4 md:grid-cols-2">
        {settings.map((item) => (
          <Card key={item.title}>
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
              <item.icon size={20} />
            </div>
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.body}</p>
          </Card>
        ))}
      </section>
    </MotionPage>
  );
}

export function ProfilePage() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const pushToast = useToastStore((state) => state.pushToast);

  const onLogout = async () => {
    await logout();
    pushToast({ type: 'success', title: 'Signed out', message: 'Your session has been closed.' });
    navigate('/login', { replace: true });
  };

  return (
    <MotionPage>
      <PageHeader title="Profile" eyebrow="Account" description="Manage your identity, role, contact information, and active hospital context." action={null} />
      <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card>
          <div className="grid place-items-center text-center">
            <span className="grid h-24 w-24 place-items-center rounded-[2rem] bg-gradient-to-br from-blue-600 to-emerald-500 text-white"><UserRound size={36} /></span>
            <h2 className="mt-5 text-2xl font-semibold">{user?.fullName || user?.full_name || user?.name || 'Hospital User'}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{user?.role || 'Authenticated'} | HelixCare Hospital</p>
            <button onClick={onLogout} className="mt-6 inline-flex h-11 items-center gap-2 rounded-2xl border px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </Card>
        <Card>
          <SectionTitle title="Account Overview" subtitle="Profile details and security posture" />
          <div className="grid gap-3 sm:grid-cols-2">
            {[user?.email || 'Email unavailable', user?.phone || 'Phone not configured', user?.isEmailVerified ? 'Email verified' : 'Email verification pending', 'JWT protected session'].map((item) => (
              <div className="rounded-2xl border bg-slate-50 p-4 text-sm font-medium dark:border-white/10 dark:bg-white/5" key={item}>{item}</div>
            ))}
          </div>
        </Card>
      </section>
    </MotionPage>
  );
}

export function NotificationsPage() {
  const query = useResourceQuery('notifications', { sortBy: 'created_at' });
  const items = query.rows.length ? query.rows : notifications;

  return (
    <MotionPage>
      <PageHeader title="Notifications" eyebrow="Signal center" description="Prioritized events from capacity, inventory, billing, and clinical workflows." action={null} />
      {query.status === 'loading' && <TableSkeleton rows={3} columns={2} />}
      {query.status === 'error' && <ErrorState message={query.error} onRetry={query.retry} />}
      {query.status !== 'loading' && query.status !== 'error' && (
        <section className="grid gap-4">
          {items.map((item) => (
            <Card key={item.id || item.title}>
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-300"><Bell size={20} /></span>
                <div>
                  <p className="text-sm font-semibold text-sky-600 dark:text-sky-300">{item.type || item.channel || 'Notification'}</p>
                  <h2 className="mt-1 text-lg font-semibold">{item.title || item.message}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.body || item.message || 'New hospital event received.'}</p>
                </div>
              </div>
            </Card>
          ))}
        </section>
      )}
    </MotionPage>
  );
}

export function NotFoundPage() {
  return (
    <div className="grid min-h-[70vh] place-items-center px-4 text-center">
      <div className="max-w-lg">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-3xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
          <FileText size={24} />
        </div>
        <h1 className="text-5xl font-semibold">404</h1>
        <p className="mt-4 text-slate-500 dark:text-slate-400">The page you are looking for does not exist in this hospital workspace.</p>
      </div>
    </div>
  );
}
