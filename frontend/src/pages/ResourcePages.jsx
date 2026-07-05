import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, FileText, LogOut, RefreshCcw, Search, UploadCloud, UserRound } from 'lucide-react';
import { Card, SectionTitle } from '../components/ui/Card.jsx';
import { DataTable } from '../components/ui/DataTable.jsx';
import { EmptyState, ErrorState, TableSkeleton } from '../components/ui/AsyncStates.jsx';
import { MotionPage } from '../components/ui/MotionPage.jsx';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { useResourceQuery } from '../hooks/useResourceQuery.js';
import { notifications, settings, tables } from '../data/appData.js';
import { apiClient } from '../services/apiClient.js';
import { useAuthStore } from '../store/authStore.js';
import { useToastStore } from '../store/toastStore.js';
import { useResourceCacheStore } from '../store/resourceCacheStore.js';

const normalizeRole = (value) => {
  const normalized = String(value || 'Guest').trim();
  if (!normalized) return 'Guest';
  const lower = normalized.toLowerCase();
  if (['admin', 'administrator'].includes(lower)) return 'Admin';
  if (['doctor', 'physician'].includes(lower)) return 'Doctor';
  if (['patient', 'user'].includes(lower)) return 'Patient';
  if (['receptionist', 'frontdesk', 'front_desk'].includes(lower)) return 'Receptionist';
  return normalized;
};

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
  const navigate = useNavigate();
  const [title, description, table, defaultSortBy] = pageMeta[type];
  const query = useResourceQuery(type, { sortBy: defaultSortBy });
  const [searchDraft, setSearchDraft] = useState(query.params.search || '');
  const user = useAuthStore((s) => s.user);
  const pushToast = useToastStore((s) => s.pushToast);
  const normalizedRole = normalizeRole(user?.role_name || user?.role || 'Guest');

  useEffect(() => {
    const timer = window.setTimeout(() => query.setParams({ search: searchDraft }), 350);
    return () => window.clearTimeout(timer);
  }, [searchDraft]);

  const rows = useMemo(() => toTableRows(type, table.columns, query.rows), [query.rows, table.columns, type]);
  const isLoading = query.status === 'loading';
  const isRefreshing = query.status === 'refreshing';
  const canApproveAppointments = type === 'appointments' && normalizedRole === 'Admin';
  const canViewAppointmentDetails = type === 'appointments' && normalizedRole === 'Doctor';
  const [approvalTarget, setApprovalTarget] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [patientProfile, setPatientProfile] = useState(null);
  const [isLoadingPatient, setIsLoadingPatient] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentDraft, setPaymentDraft] = useState({ amount: '500', payment_method: 'cash', note: '' });
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [approvalDoctors, setApprovalDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [uploadDraft, setUploadDraft] = useState({ file: null, uploadType: 'medical_report', visibility: 'staff_only' });
  const [uploads, setUploads] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [clinicalDraft, setClinicalDraft] = useState({ diagnosis: '', symptoms: '', treatment_plan: '', notes: '' });
  const [prescriptionDraft, setPrescriptionDraft] = useState({ instructions: '', medicine_id: '', dosage: '', frequency: '', duration: '', quantity: '1' });
  const [medicines, setMedicines] = useState([]);
  const [isSavingClinical, setIsSavingClinical] = useState(false);
  const [isCreatingPrescription, setIsCreatingPrescription] = useState(false);
  const [activePatientId, setActivePatientId] = useState(null);
  const invalidateCache = useResourceCacheStore((s) => s.invalidate);

  const openApproveDialog = async (raw) => {
    if (!raw?.id) return;
    setApprovalTarget(raw);
    setApprovalDoctors([]);
    setSelectedDoctorId('');
    setIsLoadingDoctors(true);

    try {
      const { data } = await apiClient.get('/doctors', {
        params: { department_id: raw.department_id, limit: 100, offset: 0 }
      });
      const doctors = data?.data || [];
      setApprovalDoctors(doctors);
      if (doctors.length) {
        setSelectedDoctorId(String(doctors[0].id));
      }
    } catch (error) {
      pushToast({ type: 'error', title: 'Doctors unavailable', message: 'No doctors could be loaded for this department.' });
    } finally {
      setIsLoadingDoctors(false);
    }
  };

  const confirmApproveAppointment = async () => {
    if (!approvalTarget?.id) return;

    try {
      await apiClient.patch(`/appointments/${approvalTarget.id}/status`, {
        status: 'scheduled',
        doctor_id: selectedDoctorId ? Number(selectedDoctorId) : undefined
      });
      invalidateCache(`${type}:`);
      await query.retry();
      setApprovalTarget(null);
      setApprovalDoctors([]);
      setSelectedDoctorId('');
      pushToast({ type: 'success', title: 'Appointment approved', message: 'The appointment is now scheduled with the selected doctor.' });
    } catch (err) {
      // toast handled by global interceptor
    }
  };

  const fetchUploads = async (patientId) => {
    if (!patientId) {
      setUploads([]);
      return;
    }

    try {
      const { data } = await apiClient.get('/uploads', {
        params: { patient_id: Number(patientId), limit: 10, offset: 0 }
      });
      setUploads(data?.data || []);
    } catch {
      setUploads([]);
    }
  };

  const fetchMedicines = async () => {
    try {
      const { data } = await apiClient.get('/medicines', { params: { limit: 100, offset: 0 } });
      const list = data?.data || [];
      setMedicines(list);
      if (list.length && !prescriptionDraft.medicine_id) {
        setPrescriptionDraft((value) => ({ ...value, medicine_id: String(list[0].id) }));
      }
    } catch {
      setMedicines([]);
    }
  };

  const resolvePatientId = async (row, profile) => {
    const directIds = [
      row?.patient_id,
      row?.patientId,
      row?.patient?.id,
      row?.patient?.patient_id,
      row?.raw?.patient_id,
      row?.raw?.patientId,
      row?.raw?.patient?.id,
      profile?.id,
      profile?.patient_id,
      profile?.patientId
    ];

    const directId = directIds.find((value) => value !== undefined && value !== null && value !== '');
    if (directId) return Number(directId);

    const nameCandidate = [
      row?.patient_name,
      row?.patientName,
      row?.patient?.full_name,
      row?.patient?.name,
      row?.patient?.fullName,
      profile?.full_name,
      profile?.name,
      profile?.fullName
    ].find((value) => value);

    if (!nameCandidate) return null;

    try {
      const { data } = await apiClient.get('/patients', {
        params: { search: nameCandidate, limit: 5, offset: 0 }
      });
      const patientList = data?.data || [];
      const match = patientList.find((candidate) => {
        const candidateName = candidate.full_name || candidate.name || candidate.fullName || '';
        return String(candidateName).toLowerCase().includes(String(nameCandidate).toLowerCase());
      }) || patientList[0];
      return match?.id ? Number(match.id) : match?.patient_id ? Number(match.patient_id) : null;
    } catch {
      return null;
    }
  };

  const openAppointmentDetails = async (raw) => {
    if (!raw?.id) return;
    setSelectedAppointment(raw);
      setPatientProfile(null);
    setShowPaymentForm(false);
    setUploads([]);
    setActivePatientId(null);
    setUploadDraft({ file: null, uploadType: 'medical_report', visibility: 'staff_only' });
    setClinicalDraft({ diagnosis: '', symptoms: '', treatment_plan: '', notes: '' });
    setPrescriptionDraft({ instructions: '', medicine_id: '', dosage: '', frequency: '', duration: '', quantity: '1' });
    setPaymentDraft({ amount: raw?.consultation_fee || raw?.amount || '500', payment_method: 'cash', note: raw?.reason || 'Consultation fee' });
    // Fix: Patient missing when backend payload doesn't include patient_id
    // We’ll resolve patientId and fetch profile if possible.
    const rawPatientId = raw?.patient_id ?? raw?.patientId;
    if (!rawPatientId) {
      setActivePatientId(await resolvePatientId(raw, raw));
    }
    setIsLoadingPatient(true);

    try {
      const patientId = raw.patient_id || raw.patientId;
      if (patientId) {
        const { data } = await apiClient.get(`/patients/${patientId}`);
        const profile = data?.data || null;
        setPatientProfile(profile);
        setActivePatientId(await resolvePatientId(raw, profile));
        await Promise.all([fetchUploads(patientId), normalizedRole === 'Doctor' ? fetchMedicines() : Promise.resolve()]);
      } else {
        setPatientProfile({
          full_name: raw.patient_name || raw.patientName || 'Patient details unavailable',
          email: raw.email || null,
          phone: raw.phone || null,
          notes: raw.notes || raw.reason || null
        });
        const resolvedPatientId = await resolvePatientId(raw, null);
        setActivePatientId(resolvedPatientId);
      }
    } catch {
      setPatientProfile({
        full_name: raw.patient_name || raw.patientName || 'Patient details unavailable',
        email: raw.email || null,
        phone: raw.phone || null,
        notes: raw.notes || raw.reason || null
      });
    } finally {
      setIsLoadingPatient(false);
    }
  };

  const handleCheckInAppointment = async () => {
    if (!selectedAppointment?.id) return;

    try {
      await apiClient.patch(`/appointments/${selectedAppointment.id}/status`, { status: 'checked_in' });
      invalidateCache(`${type}:`);
      await query.retry();
      setSelectedAppointment(null);
      pushToast({ type: 'success', title: 'Patient checked in', message: 'The consultation is now marked as checked in.' });
    } catch (err) {
      // toast handled by global interceptor
    }
  };

  const handleUploadDocument = async (event) => {
    event.preventDefault();
    if (!selectedAppointment?.id || !uploadDraft.file) {
      pushToast({ type: 'error', title: 'Missing file', message: 'Please choose a document before uploading.' });
      return;
    }

    const patientId = activePatientId || selectedAppointment.patient_id || selectedAppointment.patientId || patientProfile?.id || patientProfile?.patient_id;
    if (!patientId) {
      pushToast({ type: 'error', title: 'Patient missing', message: 'The selected appointment is not linked to a patient record.' });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadDraft.file);
      formData.append('upload_type', uploadDraft.uploadType);
      formData.append('patient_id', String(patientId));
      formData.append('medical_record_id', String(selectedAppointment.id));
      formData.append('visibility', uploadDraft.visibility);

      await apiClient.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setUploadDraft({ file: null, uploadType: 'medical_report', visibility: 'staff_only' });
      await fetchUploads(patientId);
      pushToast({ type: 'success', title: 'Document uploaded', message: 'The file is now attached to the patient record.' });
    } catch (error) {
      pushToast({ type: 'error', title: 'Upload failed', message: 'The document could not be uploaded right now.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveClinicalRecord = async (event) => {
    event.preventDefault();
    if (!selectedAppointment?.id || !clinicalDraft.diagnosis.trim()) {
      pushToast({ type: 'error', title: 'Diagnosis required', message: 'Please enter a diagnosis before saving the clinical note.' });
      return;
    }

    const patientId = activePatientId || selectedAppointment.patient_id || selectedAppointment.patientId || patientProfile?.id || patientProfile?.patient_id;
    if (!patientId) {
      pushToast({ type: 'error', title: 'Patient missing', message: 'The selected appointment is not linked to a patient record.' });
      return;
    }

    setIsSavingClinical(true);
    try {
      await apiClient.post('/medical-records', {
        patient_id: Number(patientId),
        doctor_id: Number(user?.id || user?.user_id || 0),
        appointment_id: Number(selectedAppointment.id),
        diagnosis: clinicalDraft.diagnosis.trim(),
        symptoms: clinicalDraft.symptoms.trim() || undefined,
        treatment_plan: clinicalDraft.treatment_plan.trim() || undefined,
        notes: clinicalDraft.notes.trim() || undefined
      });

      await apiClient.patch(`/appointments/${selectedAppointment.id}/status`, { status: 'in_consultation' });
      invalidateCache(`${type}:`);
      await query.retry();
      setClinicalDraft({ diagnosis: '', symptoms: '', treatment_plan: '', notes: '' });
      pushToast({ type: 'success', title: 'Clinical note saved', message: 'The case has been updated and the visit is now in consultation.' });
    } catch {
      pushToast({ type: 'error', title: 'Clinical note failed', message: 'The record could not be saved right now.' });
    } finally {
      setIsSavingClinical(false);
    }
  };

  const handleIssuePrescription = async (event) => {
    event.preventDefault();
    if (!selectedAppointment?.id) return;

    const patientId = activePatientId || selectedAppointment.patient_id || selectedAppointment.patientId || patientProfile?.id || patientProfile?.patient_id;
    if (!patientId) {
      pushToast({ type: 'error', title: 'Patient missing', message: 'The selected appointment is not linked to a patient record.' });
      return;
    }

    if (!prescriptionDraft.instructions.trim() && !prescriptionDraft.medicine_id) {
      pushToast({ type: 'error', title: 'Prescription details missing', message: 'Add instructions or select a medicine before issuing the prescription.' });
      return;
    }

    setIsCreatingPrescription(true);
    try {
      const { data: prescriptionData } = await apiClient.post('/prescriptions', {
        patient_id: Number(patientId),
        doctor_id: Number(user?.id || user?.user_id || 0),
        instructions: prescriptionDraft.instructions.trim() || undefined
      });

      if (prescriptionDraft.medicine_id) {
        await apiClient.post('/prescription-items', {
          prescription_id: Number(prescriptionData?.data?.id),
          medicine_id: Number(prescriptionDraft.medicine_id),
          dosage: prescriptionDraft.dosage.trim() || '1 tab',
          frequency: prescriptionDraft.frequency.trim() || 'once daily',
          duration: prescriptionDraft.duration.trim() || '7 days',
          quantity: Number(prescriptionDraft.quantity) || 1,
          instructions: prescriptionDraft.instructions.trim() || undefined
        });
      }

      await apiClient.patch(`/appointments/${selectedAppointment.id}/status`, { status: 'in_consultation' });
      invalidateCache(`${type}:`);
      await query.retry();
      setPrescriptionDraft({ instructions: '', medicine_id: prescriptionDraft.medicine_id, dosage: '', frequency: '', duration: '', quantity: '1' });
      pushToast({ type: 'success', title: 'Prescription issued', message: 'Medication instructions have been created for this patient.' });
    } catch {
      pushToast({ type: 'error', title: 'Prescription failed', message: 'The prescription could not be issued right now.' });
    } finally {
      setIsCreatingPrescription(false);
    }
  };

  const handleRecordPayment = async (event) => {
    event.preventDefault();
    if (!selectedAppointment?.id) return;

    const amount = Number(paymentDraft.amount);
    if (!amount || amount <= 0) {
      pushToast({ type: 'error', title: 'Invalid amount', message: 'Please enter a valid payment amount.' });
      return;
    }

    const patientId = activePatientId || selectedAppointment.patient_id || selectedAppointment.patientId || patientProfile?.id || patientProfile?.patient_id;
    if (!patientId) {
      pushToast({ type: 'error', title: 'Patient missing', message: 'We could not find the associated patient for this payment.' });
      return;
    }

    setIsSavingPayment(true);
    try {
      const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-4)}`;
      const { data: billingData } = await apiClient.post('/billing', {
        patient_id: Number(patientId),
        appointment_id: Number(selectedAppointment.id),
        invoice_number: invoiceNumber,
        total_amount: amount,
        paid_amount: amount,
        balance_amount: 0,
        status: 'paid',
        notes: paymentDraft.note || `Payment for ${selectedAppointment.reason || 'consultation'}`
      });

      await apiClient.post('/payments', {
        billing_id: billingData?.data?.id,
        amount,
        payment_method: paymentDraft.payment_method,
        transaction_reference: `TXN-${Date.now()}`,
        status: 'successful',
        paid_at: new Date().toISOString()
      });

      await apiClient.patch(`/appointments/${selectedAppointment.id}/status`, { status: 'completed' });
      invalidateCache(`${type}:`);
      await query.retry();
      setShowPaymentForm(false);
      setPaymentDraft({ amount: '500', payment_method: 'cash', note: '' });
      pushToast({ type: 'success', title: 'Payment recorded', message: 'The consultation fee has been paid and the visit is marked complete.' });
    } catch (err) {
      // toast handled by global interceptor
    } finally {
      setIsSavingPayment(false);
    }
  };
  const total = Number(query.meta?.total || query.rows.length || 0);

  const handleCreate = async () => {
    if (type !== 'appointments') return;
    navigate('/appointments/create');
  };

  return (
    <MotionPage>
      <PageHeader title={title} eyebrow="Hospital workspace" description={description} action={type === 'appointments' ? 'Create appointment' : null} onAction={handleCreate} />
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

      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Appointment details</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Review the appointment information assigned to you.</p>
              </div>
              <button type="button" onClick={() => setSelectedAppointment(null)} className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10">✕</button>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-white/10 dark:bg-white/5">
                  <p className="font-semibold text-slate-700 dark:text-slate-200">Patient</p>
                  <p className="mt-1 text-slate-500 dark:text-slate-400">{selectedAppointment?.patient_name || selectedAppointment?.patient_id || 'Patient not listed'}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-white/10 dark:bg-white/5">
                  <p className="font-semibold text-slate-700 dark:text-slate-200">Patient profile</p>
                  {isLoadingPatient ? (
                    <p className="mt-2 text-slate-500 dark:text-slate-400">Loading patient details…</p>
                  ) : patientProfile ? (
                    <div className="mt-2 grid gap-2 text-slate-500 dark:text-slate-400">
                      <p><span className="font-medium text-slate-700 dark:text-slate-200">Name:</span> {patientProfile.full_name || patientProfile.name || 'Not available'}</p>
                      <p><span className="font-medium text-slate-700 dark:text-slate-200">Email:</span> {patientProfile.email || 'Not available'}</p>
                      <p><span className="font-medium text-slate-700 dark:text-slate-200">Phone:</span> {patientProfile.phone || patientProfile.contact_number || 'Not available'}</p>
                      <p><span className="font-medium text-slate-700 dark:text-slate-200">Notes:</span> {patientProfile.notes || patientProfile.medical_notes || 'No extra notes'}</p>
                    </div>
                  ) : (
                    <p className="mt-2 text-slate-500 dark:text-slate-400">No patient profile details were found.</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-white/10 dark:bg-white/5">
                    <p className="font-semibold text-slate-700 dark:text-slate-200">Date</p>
                    <p className="mt-1 text-slate-500 dark:text-slate-400">{selectedAppointment?.appointment_date || 'Not set'}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-white/10 dark:bg-white/5">
                    <p className="font-semibold text-slate-700 dark:text-slate-200">Time</p>
                    <p className="mt-1 text-slate-500 dark:text-slate-400">{selectedAppointment?.start_time || 'TBD'} - {selectedAppointment?.end_time || 'TBD'}</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-white/10 dark:bg-white/5">
                    <p className="font-semibold text-slate-700 dark:text-slate-200">Status</p>
                    <p className="mt-1 text-slate-500 dark:text-slate-400">{selectedAppointment?.status || 'pending'}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-white/10 dark:bg-white/5">
                    <p className="font-semibold text-slate-700 dark:text-slate-200">Department</p>
                    <p className="mt-1 text-slate-500 dark:text-slate-400">{selectedAppointment?.department_id || 'Not assigned'}</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-white/10 dark:bg-white/5">
                  <p className="font-semibold text-slate-700 dark:text-slate-200">Reason</p>
                  <p className="mt-1 text-slate-500 dark:text-slate-400">{selectedAppointment?.reason || selectedAppointment?.notes || 'No reason provided'}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-500/20 dark:bg-sky-500/10">
              <div className="flex items-center gap-2">
                <FileText className="text-sky-600 dark:text-sky-300" size={18} />
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Advanced clinical workflow</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Record diagnosis, issue medication plans, and keep the consultation record complete.</p>
                </div>
              </div>

              {normalizedRole === 'Doctor' && (
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <form onSubmit={handleSaveClinicalRecord} className="grid gap-3 rounded-2xl border border-sky-200 bg-white/80 p-4 dark:border-white/10 dark:bg-slate-950/60">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Clinical note</p>
                    <label className="grid gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Diagnosis
                      <input
                        value={clinicalDraft.diagnosis}
                        onChange={(event) => setClinicalDraft((value) => ({ ...value, diagnosis: event.target.value }))}
                        placeholder="Primary diagnosis"
                        className="h-11 rounded-2xl border bg-white px-3 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 dark:border-white/10 dark:bg-slate-950"
                      />
                    </label>
                    <label className="grid gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Symptoms
                      <input
                        value={clinicalDraft.symptoms}
                        onChange={(event) => setClinicalDraft((value) => ({ ...value, symptoms: event.target.value }))}
                        placeholder="Observed symptoms"
                        className="h-11 rounded-2xl border bg-white px-3 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 dark:border-white/10 dark:bg-slate-950"
                      />
                    </label>
                    <label className="grid gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Treatment plan
                      <input
                        value={clinicalDraft.treatment_plan}
                        onChange={(event) => setClinicalDraft((value) => ({ ...value, treatment_plan: event.target.value }))}
                        placeholder="Next steps for treatment"
                        className="h-11 rounded-2xl border bg-white px-3 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 dark:border-white/10 dark:bg-slate-950"
                      />
                    </label>
                    <label className="grid gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Notes
                      <textarea
                        value={clinicalDraft.notes}
                        onChange={(event) => setClinicalDraft((value) => ({ ...value, notes: event.target.value }))}
                        placeholder="Additional clinical observations"
                        rows={3}
                        className="rounded-2xl border bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 dark:border-white/10 dark:bg-slate-950"
                      />
                    </label>
                    <div className="flex justify-end">
                      <button type="submit" disabled={isSavingClinical} className="h-11 rounded-2xl bg-sky-600 px-4 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50">
                        {isSavingClinical ? 'Saving...' : 'Save clinical note'}
                      </button>
                    </div>
                  </form>

                  <form onSubmit={handleIssuePrescription} className="grid gap-3 rounded-2xl border border-sky-200 bg-white/80 p-4 dark:border-white/10 dark:bg-slate-950/60">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Prescription</p>
                    <label className="grid gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Medicine
                      <select
                        value={prescriptionDraft.medicine_id}
                        onChange={(event) => setPrescriptionDraft((value) => ({ ...value, medicine_id: event.target.value }))}
                        className="h-11 rounded-2xl border bg-white px-3 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 dark:border-white/10 dark:bg-slate-950"
                      >
                        {medicines.length ? medicines.map((medicine) => (
                          <option key={medicine.id} value={medicine.id}>{medicine.name || `Medicine ${medicine.id}`}</option>
                        )) : <option value="">No medicines available</option>}
                      </select>
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="grid gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Dosage
                        <input
                          value={prescriptionDraft.dosage}
                          onChange={(event) => setPrescriptionDraft((value) => ({ ...value, dosage: event.target.value }))}
                          placeholder="1 tab"
                          className="h-11 rounded-2xl border bg-white px-3 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 dark:border-white/10 dark:bg-slate-950"
                        />
                      </label>
                      <label className="grid gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Frequency
                        <input
                          value={prescriptionDraft.frequency}
                          onChange={(event) => setPrescriptionDraft((value) => ({ ...value, frequency: event.target.value }))}
                          placeholder="twice daily"
                          className="h-11 rounded-2xl border bg-white px-3 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 dark:border-white/10 dark:bg-slate-950"
                        />
                      </label>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="grid gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Duration
                        <input
                          value={prescriptionDraft.duration}
                          onChange={(event) => setPrescriptionDraft((value) => ({ ...value, duration: event.target.value }))}
                          placeholder="7 days"
                          className="h-11 rounded-2xl border bg-white px-3 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 dark:border-white/10 dark:bg-slate-950"
                        />
                      </label>
                      <label className="grid gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Quantity
                        <input
                          type="number"
                          min="1"
                          value={prescriptionDraft.quantity}
                          onChange={(event) => setPrescriptionDraft((value) => ({ ...value, quantity: event.target.value }))}
                          className="h-11 rounded-2xl border bg-white px-3 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 dark:border-white/10 dark:bg-slate-950"
                        />
                      </label>
                    </div>
                    <label className="grid gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Instructions
                      <textarea
                        value={prescriptionDraft.instructions}
                        onChange={(event) => setPrescriptionDraft((value) => ({ ...value, instructions: event.target.value }))}
                        placeholder="Care instructions for the patient"
                        rows={3}
                        className="rounded-2xl border bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 dark:border-white/10 dark:bg-slate-950"
                      />
                    </label>
                    <div className="flex justify-end">
                      <button type="submit" disabled={isCreatingPrescription} className="h-11 rounded-2xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50">
                        {isCreatingPrescription ? 'Issuing...' : 'Issue prescription'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {normalizedRole !== 'Doctor' && (
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Only doctors can create clinical notes and prescriptions from this workflow.</p>
              )}
            </div>

            <div className="mt-5 rounded-2xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-500/20 dark:bg-sky-500/10">
              <div className="flex items-center gap-2">
                <UploadCloud className="text-sky-600 dark:text-sky-300" size={18} />
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Upload medical document</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Attach a report, prescription, or lab file to this visit.</p>
                </div>
              </div>

              <form onSubmit={handleUploadDocument} className="mt-4 grid gap-3">
                <label className="grid gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Select file
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                    onChange={(event) => setUploadDraft((value) => ({ ...value, file: event.target.files?.[0] || null }))}
                    className="rounded-2xl border border-dashed border-sky-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 dark:border-white/10 dark:bg-slate-950"
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Document type
                    <select
                      value={uploadDraft.uploadType}
                      onChange={(event) => setUploadDraft((value) => ({ ...value, uploadType: event.target.value }))}
                      className="h-11 rounded-2xl border bg-white px-3 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 dark:border-white/10 dark:bg-slate-950"
                    >
                      <option value="medical_report">Medical report</option>
                      <option value="prescription">Prescription</option>
                      <option value="bill">Bill</option>
                      <option value="patient_document">Patient document</option>
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Visibility
                    <select
                      value={uploadDraft.visibility}
                      onChange={(event) => setUploadDraft((value) => ({ ...value, visibility: event.target.value }))}
                      className="h-11 rounded-2xl border bg-white px-3 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 dark:border-white/10 dark:bg-slate-950"
                    >
                      <option value="staff_only">Staff only</option>
                      <option value="private">Private</option>
                      <option value="patient_visible">Patient visible</option>
                    </select>
                  </label>
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={isUploading} className="h-11 rounded-2xl bg-sky-600 px-4 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50">
                    {isUploading ? 'Uploading...' : 'Upload document'}
                  </button>
                </div>
              </form>

              {uploads.length > 0 && (
                <div className="mt-4 grid gap-2">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Recent uploads</p>
                  {uploads.map((upload) => (
                    <div key={upload.id} className="flex items-center justify-between rounded-2xl border border-sky-200 bg-white/80 px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950/60">
                      <span className="font-medium text-slate-700 dark:text-slate-200">{upload.original_name || upload.file_name || `Upload ${upload.id}`}</span>
                      <span className="text-slate-500 dark:text-slate-400">{upload.upload_type || 'document'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              {normalizedRole === 'Doctor' && (selectedAppointment?.status === 'scheduled' || selectedAppointment?.status === 'pending') && (
                <button type="button" onClick={handleCheckInAppointment} className="h-12 rounded-2xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500">
                  Check in patient
                </button>
              )}
              {normalizedRole === 'Patient' && (
                <button type="button" onClick={() => setShowPaymentForm((value) => !value)} className="h-12 rounded-2xl bg-violet-600 px-4 text-sm font-semibold text-white transition hover:bg-violet-500">
                  {showPaymentForm ? 'Hide payment form' : 'Pay consultation fee'}
                </button>
              )}
              {normalizedRole !== 'Patient' && ['checked_in', 'in_consultation', 'completed'].includes(String(selectedAppointment?.status || '').toLowerCase()) && (
                <button type="button" onClick={() => setShowPaymentForm((value) => !value)} className="h-12 rounded-2xl bg-violet-600 px-4 text-sm font-semibold text-white transition hover:bg-violet-500">
                  {showPaymentForm ? 'Hide payment form' : 'Record payment'}
                </button>
              )}
              <button type="button" onClick={() => setSelectedAppointment(null)} className="h-12 rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
                Close
              </button>
            </div>

            {showPaymentForm && ['checked_in', 'in_consultation', 'completed'].includes(String(selectedAppointment?.status || '').toLowerCase()) && (
              <form onSubmit={handleRecordPayment} className="mt-4 grid gap-3 rounded-2xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-500/20 dark:bg-violet-500/10">
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="grid gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Amount
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={paymentDraft.amount}
                      onChange={(event) => setPaymentDraft((value) => ({ ...value, amount: event.target.value }))}
                      className="h-11 rounded-2xl border bg-white px-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-400/10 dark:border-white/10 dark:bg-slate-950"
                    />
                  </label>
                  <label className="grid gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Payment method
                    <select
                      value={paymentDraft.payment_method}
                      onChange={(event) => setPaymentDraft((value) => ({ ...value, payment_method: event.target.value }))}
                      className="h-11 rounded-2xl border bg-white px-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-400/10 dark:border-white/10 dark:bg-slate-950"
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="upi">UPI</option>
                      <option value="bank_transfer">Bank transfer</option>
                      <option value="insurance">Insurance</option>
                    </select>
                  </label>
                </div>
                <label className="grid gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Note
                  <input
                    value={paymentDraft.note}
                    onChange={(event) => setPaymentDraft((value) => ({ ...value, note: event.target.value }))}
                    placeholder="Consultation fee"
                    className="h-11 rounded-2xl border bg-white px-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-400/10 dark:border-white/10 dark:bg-slate-950"
                  />
                </label>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {normalizedRole === 'Patient' ? 'This payment will be recorded against your consultation and saved in your billing history.' : 'This payment will be recorded against the appointment and updated in billing.'}
                </p>
                <div className="flex justify-end">
                  <button type="submit" disabled={isSavingPayment} className="h-11 rounded-2xl bg-violet-600 px-4 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50">
                    {isSavingPayment ? 'Saving...' : normalizedRole === 'Patient' ? 'Pay now' : 'Save payment'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {approvalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Approve appointment</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Choose the doctor who will handle this appointment.</p>
              </div>
              <button type="button" onClick={() => setApprovalTarget(null)} className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10">✕</button>
            </div>

            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-white/10 dark:bg-white/5">
                <p className="font-semibold text-slate-700 dark:text-slate-200">Patient</p>
                <p className="mt-1 text-slate-500 dark:text-slate-400">{approvalTarget?.raw?.patient_name || approvalTarget?.patient_name || approvalTarget?.id}</p>
              </div>
              <label className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                Select doctor
                <select
                  value={selectedDoctorId}
                  onChange={(event) => setSelectedDoctorId(event.target.value)}
                  className="h-12 rounded-2xl border bg-white px-4 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 dark:border-white/10 dark:bg-slate-950"
                  disabled={isLoadingDoctors}
                >
                  {isLoadingDoctors ? (
                    <option value="">Loading doctors...</option>
                  ) : approvalDoctors.length ? (
                    approvalDoctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.full_name || doctor.doctor_name || doctor.name || `Doctor ${doctor.id}`}
                      </option>
                    ))
                  ) : (
                    <option value="">No doctors found for this department</option>
                  )}
                </select>
              </label>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setApprovalTarget(null)} className="h-12 rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200">
                Cancel
              </button>
              <button type="button" onClick={confirmApproveAppointment} disabled={!selectedDoctorId || isLoadingDoctors} className="h-12 rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
                {isLoadingDoctors ? 'Loading...' : 'Approve appointment'}
              </button>
            </div>
          </div>
        </div>
      )}

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
          {type === 'users' ? (
            <>
              <DataTable
                title={`${title} Directory`}
                subtitle="User registry — admin can approve pending accounts."
                columns={table.columns}
                rows={rows}
                action={isRefreshing ? 'Syncing' : 'Live'}
                onRowAction={async (raw) => {
                  try {
                    await apiClient.patch(`/users/${raw.id}/approve`);
                    query.retry();
                  } catch (err) {
                    // swallow — toast handled by global interceptor
                  }
                }}
                rowActionLabel="Approve"
              />
              <Pagination meta={query.meta} onPage={(page) => query.setParams({ page })} />
            </>
          ) : (
            <>
              <DataTable
                title={`${title} Directory`}
                subtitle="Live records with cached reads, API retries, and optimistic row actions."
                columns={table.columns}
                rows={rows}
                action={isRefreshing ? 'Syncing' : 'Live'}
                onDelete={query.optimisticDelete}
                onRowAction={canApproveAppointments ? openApproveDialog : canViewAppointmentDetails ? openAppointmentDetails : undefined}
                rowActionLabel={canApproveAppointments ? 'Approve' : canViewAppointmentDetails ? 'View patient' : undefined}
                rowActionDisabled={canApproveAppointments ? (row) => !row?.id || row.status !== 'pending' : (row) => !row?.id}
                onRowClick={canViewAppointmentDetails ? openAppointmentDetails : undefined}
              />
              <Pagination meta={query.meta} onPage={(page) => query.setParams({ page })} />
            </>
          )}
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
