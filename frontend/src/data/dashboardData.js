import {
  Activity,
  Ambulance,
  BedDouble,
  Bell,
  CalendarDays,
  ClipboardList,
  CreditCard,
  HeartPulse,
  LayoutDashboard,
  MessageSquare,
  Pill,
  Settings,
  ShieldCheck,
  Stethoscope,
  UserRound,
  UsersRound
} from 'lucide-react';

export const navItems = [
  { label: 'Overview', icon: LayoutDashboard, active: true },
  { label: 'Patients', icon: UsersRound },
  { label: 'Appointments', icon: CalendarDays },
  { label: 'Doctors', icon: Stethoscope },
  { label: 'Admissions', icon: BedDouble },
  { label: 'Pharmacy', icon: Pill },
  { label: 'Billing', icon: CreditCard },
  { label: 'Messages', icon: MessageSquare },
  { label: 'Settings', icon: Settings }
];

export const stats = [
  {
    label: "Today's Patients",
    value: '184',
    delta: '+12.8%',
    tone: 'blue',
    icon: UsersRound,
    detail: '42 currently in queue'
  },
  {
    label: "Today's Revenue",
    value: '$48.2k',
    delta: '+8.4%',
    tone: 'green',
    icon: CreditCard,
    detail: '72 settled invoices'
  },
  {
    label: 'Appointments',
    value: '96',
    delta: '14 pending',
    tone: 'violet',
    icon: CalendarDays,
    detail: 'Next slot in 12 min'
  },
  {
    label: 'Doctors Online',
    value: '38',
    delta: '92% coverage',
    tone: 'amber',
    icon: Stethoscope,
    detail: '6 departments active'
  }
];

export const patientQueue = [
  { name: 'Maya Kapoor', id: 'PAT-2084', department: 'Cardiology', time: '09:20', status: 'Checked in', priority: 'High' },
  { name: 'Noah Bennett', id: 'PAT-2091', department: 'Orthopedics', time: '09:40', status: 'Vitals', priority: 'Normal' },
  { name: 'Anaya Rao', id: 'PAT-2102', department: 'Pediatrics', time: '10:00', status: 'Waiting', priority: 'Normal' },
  { name: 'Ibrahim Khan', id: 'PAT-2110', department: 'Neurology', time: '10:15', status: 'Consulting', priority: 'Critical' }
];

export const activities = [
  { icon: ShieldCheck, title: 'Consent signed', meta: 'Maya Kapoor · Surgery desk', time: '4m ago' },
  { icon: Activity, title: 'Vitals updated', meta: 'Noah Bennett · Nurse Aditi', time: '11m ago' },
  { icon: Ambulance, title: 'ER transfer created', meta: 'Trauma Bay · Dr. Mehta', time: '18m ago' },
  { icon: ClipboardList, title: 'Lab report uploaded', meta: 'Aman Verma · CBC panel', time: '24m ago' }
];

export const surgeries = [
  { patient: 'Maya Kapoor', type: 'CABG prep', room: 'OT-3', team: 'Cardiac team', time: '11:30' },
  { patient: 'Ethan Roy', type: 'Knee arthroscopy', room: 'OT-1', team: 'Ortho team', time: '13:00' },
  { patient: 'Sara Nair', type: 'Appendectomy', room: 'OT-2', team: 'General surgery', time: '15:20' }
];

export const notifications = [
  { title: 'ICU occupancy reached 86%', type: 'Capacity', accent: 'warning' },
  { title: '12 pharmacy items below reorder level', type: 'Inventory', accent: 'danger' },
  { title: 'Radiology queue cleared ahead of SLA', type: 'Ops', accent: 'success' }
];

export const doctors = [
  { name: 'Dr. Arjun Mehta', specialty: 'Cardiology', load: 82, status: 'In consult' },
  { name: 'Dr. Priya Sen', specialty: 'Pediatrics', load: 64, status: 'Available' },
  { name: 'Dr. Kabir Shah', specialty: 'Orthopedics', load: 76, status: 'Rounds' }
];

export const weekRevenue = [42, 38, 46, 52, 49, 61, 58];
export const appointmentFlow = [18, 24, 21, 34, 28, 39, 44, 36, 48, 43, 51, 57];

export const calendarDays = [
  { day: 'Mon', date: 29, active: false, load: 68 },
  { day: 'Tue', date: 30, active: true, load: 84 },
  { day: 'Wed', date: 1, active: false, load: 52 },
  { day: 'Thu', date: 2, active: false, load: 73 },
  { day: 'Fri', date: 3, active: false, load: 61 },
  { day: 'Sat', date: 4, active: false, load: 42 },
  { day: 'Sun', date: 5, active: false, load: 25 }
];

export const commandItems = [
  { label: 'ER Status', value: '14 active', icon: HeartPulse },
  { label: 'Beds', value: '218 / 260', icon: BedDouble },
  { label: 'Alerts', value: '7 unread', icon: Bell },
  { label: 'Clinician', value: 'Admin', icon: UserRound }
];
