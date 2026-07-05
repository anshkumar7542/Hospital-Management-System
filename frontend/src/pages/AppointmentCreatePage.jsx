import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card.jsx';
import { MotionPage } from '../components/ui/MotionPage.jsx';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { apiClient } from '../services/apiClient.js';
import { useAuthStore } from '../store/authStore.js';
import { useToastStore } from '../store/toastStore.js';

export function AppointmentCreatePage() {
  const navigate = useNavigate();
  const pushToast = useToastStore((state) => state.pushToast);
  const user = useAuthStore((state) => state.user);
  const [patientName, setPatientName] = useState(user?.fullName || user?.full_name || user?.name || '');
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState([]);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [reason, setReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const { data } = await apiClient.get('/departments');
        setDepartments(data?.data || []);
      } catch {
        setDepartments([]);
      }
    };
    fetchDepartments();
  }, []);

  const canSubmit = patientName.trim() && departmentId && appointmentDate && startTime && endTime;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    setIsSaving(true);
    try {
      await apiClient.post('/appointments', {
        department_id: Number(departmentId),
        appointment_date: new Date(appointmentDate).toISOString(),
        start_time: startTime,
        end_time: endTime,
        status: 'pending',
        notes: reason.trim() ? `Patient: ${patientName.trim()} | Reason: ${reason.trim()}` : `Patient: ${patientName.trim()}`
      });
      pushToast({ type: 'success', title: 'Appointment request created', message: 'The request is pending admin approval and doctor assignment.' });
      navigate('/appointments');
    } catch (error) {
      pushToast({ type: 'error', title: 'Create failed', message: error.message || 'Unable to create appointment.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MotionPage>
      <PageHeader
        title="Create Appointment"
        eyebrow="Patient booking"
        description="Patient enters the preferred time, and the admin assigns the best available doctor from the selected department."
        action="Back to list"
        onAction={() => navigate('/appointments')}
      />

      <Card>
        <form className="grid gap-6" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Patient Name</label>
            <input
              value={patientName}
              onChange={(event) => setPatientName(event.target.value)}
              className="h-12 w-full rounded-2xl border bg-white px-4 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 dark:border-white/10 dark:bg-slate-950 dark:text-white"
              placeholder="Enter your full name"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Department</label>
            <select
              value={departmentId}
              onChange={(event) => setDepartmentId(event.target.value)}
              className="h-12 w-full rounded-2xl border bg-white px-4 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 dark:border-white/10 dark:bg-slate-950 dark:text-white"
            >
              <option value="">Select department</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2 md:grid-cols-3">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Appointment Date</label>
              <input
                type="date"
                value={appointmentDate}
                onChange={(event) => setAppointmentDate(event.target.value)}
                className="h-12 w-full rounded-2xl border bg-white px-4 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 dark:border-white/10 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Start time</label>
              <input
                type="time"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                className="h-12 w-full rounded-2xl border bg-white px-4 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 dark:border-white/10 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">End time</label>
              <input
                type="time"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                className="h-12 w-full rounded-2xl border bg-white px-4 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 dark:border-white/10 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Reason</label>
            <input
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="h-12 w-full rounded-2xl border bg-white px-4 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 dark:border-white/10 dark:bg-slate-950 dark:text-white"
              placeholder="Reason for visit"
            />
          </div>

          <div className="grid gap-2">
            <p className="text-sm text-slate-500 dark:text-slate-400">The request stays pending until an admin approves it and assigns the first available doctor in the selected department.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={() => navigate('/appointments')}
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || isSaving}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              {isSaving ? 'Saving...' : 'Create Appointment Request'}
            </button>
          </div>
        </form>
      </Card>
    </MotionPage>
  );
}
