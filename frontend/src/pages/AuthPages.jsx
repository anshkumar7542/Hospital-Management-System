import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react';
import { authService } from '../services/authService.js';
import { getApiErrorMessage } from '../services/apiClient.js';
import { useAuthStore } from '../store/authStore.js';
import { useToastStore } from '../store/toastStore.js';

function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="grid flex-1 place-items-center">
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }} className="glass w-full max-w-md rounded-[2rem] p-6 sm:p-8">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
          <ArrowLeft size={16} />
          Back home
        </Link>
        <h1 className="text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{subtitle}</p>
        {children}
        {footer}
      </motion.section>
    </div>
  );
}

function Field({ label, name, value, onChange, type = 'text', placeholder, required = true }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      <input
        className="h-12 rounded-2xl border bg-white/80 px-4 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 dark:border-white/10 dark:bg-white/5"
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        required={required}
      />
    </label>
  );
}

function SubmitButton({ children, loading }) {
  return (
    <button disabled={loading} className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 font-semibold text-white shadow-soft transition disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950">
      {loading ? 'Working...' : children}
      {!loading && <ArrowRight size={18} />}
    </button>
  );
}

function FormError({ error }) {
  if (!error) return null;
  return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">{error}</div>;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const pushToast = useToastStore((state) => state.pushToast);
  const [form, setForm] = useState({ email: '', password: '', rememberLogin: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onChange = (event) => {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form);
      pushToast({ type: 'success', title: 'Signed in', message: 'Welcome back.' });
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to your secure hospital command center." footer={<p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">No account? <Link className="font-semibold text-sky-600 dark:text-sky-300" to="/register">Register</Link></p>}>
      <form className="mt-8 grid gap-4" onSubmit={onSubmit}>
        <FormError error={error} />
        <Field label="Email" name="email" value={form.email} onChange={onChange} type="email" placeholder="admin@hms.com" />
        <Field label="Password" name="password" value={form.password} onChange={onChange} type="password" placeholder="Enter password" />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-500 dark:text-slate-400"><input name="rememberLogin" checked={form.rememberLogin} onChange={onChange} type="checkbox" className="rounded" /> Remember login</label>
          <Link to="/forgot-password" className="font-semibold text-sky-600 dark:text-sky-300">Forgot?</Link>
        </div>
        <SubmitButton loading={loading}>Login</SubmitButton>
      </form>
    </AuthCard>
  );
}

export function RegisterPage() {
  const pushToast = useToastStore((state) => state.pushToast);
  const register = useAuthStore((state) => state.register);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'Patient',
    licenseNumber: '',
    specialization: '',
    qualification: '',
    consultationFee: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };
  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(form);
      pushToast({ type: 'success', title: 'Account created', message: 'Use login to continue.' });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Create your workspace" subtitle="Register a hospital user with role-aware access." footer={<p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">Already registered? <Link className="font-semibold text-sky-600 dark:text-sky-300" to="/login">Login</Link></p>}>
      <form className="mt-8 grid gap-4" onSubmit={onSubmit}>
        <FormError error={error} />
        <Field label="Full name" name="fullName" value={form.fullName} onChange={onChange} placeholder="Riya Sharma" />
        <Field label="Email" name="email" value={form.email} onChange={onChange} type="email" placeholder="riya@hms.com" />
        <Field label="Password" name="password" value={form.password} onChange={onChange} type="password" placeholder="Strong@123" />
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Role</span>
          <select name="role" value={form.role} onChange={onChange} className="h-12 rounded-2xl border bg-white/80 px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5">
            <option>Patient</option>
            <option>Receptionist</option>
            <option>Doctor</option>
            <option>Admin</option>
          </select>
        </label>
        {form.role === 'Doctor' && (
          <div className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Doctor profile details</p>
            <Field label="License number" name="licenseNumber" value={form.licenseNumber} onChange={onChange} placeholder="DOC-1234" />
            <Field label="Specialization" name="specialization" value={form.specialization} onChange={onChange} placeholder="General Medicine" />
            <Field label="Qualification" name="qualification" value={form.qualification} onChange={onChange} placeholder="MBBS" />
            <Field label="Consultation fee" name="consultationFee" value={form.consultationFee} onChange={onChange} type="number" placeholder="1200" />
          </div>
        )}
        <SubmitButton loading={loading}>Register</SubmitButton>
      </form>
    </AuthCard>
  );
}

export function ForgotPasswordPage() {
  const pushToast = useToastStore((state) => state.pushToast);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await authService.forgotPassword(email);
      pushToast({ type: 'success', title: 'Reset link generated', message: data?.resetUrl || 'Check the dummy email service output.' });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthCard title="Recover access" subtitle="Enter your email and we will generate a secure reset token.">
      <form className="mt-8 grid gap-4" onSubmit={onSubmit}>
        <FormError error={error} />
        <Field label="Email" name="email" value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="admin@hms.com" />
        <SubmitButton loading={loading}>Send reset token</SubmitButton>
      </form>
    </AuthCard>
  );
}

export function ResetPasswordPage() {
  const pushToast = useToastStore((state) => state.pushToast);
  const params = new URLSearchParams(window.location.search);
  const [form, setForm] = useState({ token: params.get('token') || '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const onChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.resetPassword(form);
      pushToast({ type: 'success', title: 'Password reset', message: 'You can now sign in.' });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthCard title="Reset password" subtitle="Use the reset token from your email verification flow.">
      <form className="mt-8 grid gap-4" onSubmit={onSubmit}>
        <FormError error={error} />
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Reset token</span>
          <div className="flex h-12 items-center gap-3 rounded-2xl border bg-white/80 px-4 dark:border-white/10 dark:bg-white/5">
            <Mail size={17} className="text-slate-400" />
            <input name="token" value={form.token} onChange={onChange} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Paste token" required />
          </div>
        </label>
        <Field label="New password" name="newPassword" value={form.newPassword} onChange={onChange} type="password" placeholder="NewStrong@123" />
        <Field label="Confirm password" name="confirmPassword" value={form.confirmPassword} onChange={onChange} type="password" placeholder="NewStrong@123" />
        <SubmitButton loading={loading}>Reset password</SubmitButton>
      </form>
    </AuthCard>
  );
}
