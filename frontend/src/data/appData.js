import {
  Activity,
  Bell,
  Building2,
  CalendarDays,
  ClipboardList,
  CreditCard,
  FileText,
  HeartPulse,
  LayoutDashboard,
  LockKeyhole,
  Pill,
  ReceiptText,
  Settings,
  ShieldCheck,
  Stethoscope,
  UserRound,
  UsersRound,
  WalletCards
} from 'lucide-react';

export const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Doctors', path: '/doctors', icon: Stethoscope },
  { label: 'Patients', path: '/patients', icon: UsersRound },
  { label: 'Appointments', path: '/appointments', icon: CalendarDays },
  { label: 'Medical Records', path: '/medical-records', icon: FileText },
  { label: 'Billing', path: '/billing', icon: ReceiptText },
  { label: 'Payments', path: '/payments', icon: WalletCards },
  { label: 'Medicines', path: '/medicines', icon: Pill },
  { label: 'Departments', path: '/departments', icon: Building2 },
  { label: 'Notifications', path: '/notifications', icon: Bell },
  { label: 'Activity Logs', path: '/activity-logs', icon: Activity },
  { label: 'Settings', path: '/settings', icon: Settings }
];

export const dashboardStats = [
  { label: "Today's Patients", value: '184', delta: '+12.8%', icon: UsersRound, tone: 'from-sky-500 to-blue-600' },
  { label: "Today's Revenue", value: '$48.2k', delta: '+8.4%', icon: CreditCard, tone: 'from-emerald-500 to-teal-600' },
  { label: 'Appointments', value: '96', delta: '14 pending', icon: CalendarDays, tone: 'from-violet-500 to-indigo-600' },
  { label: 'Doctors Online', value: '38', delta: '92% coverage', icon: Stethoscope, tone: 'from-amber-500 to-orange-600' }
];

export const tables = {
  doctors: {
    columns: ['Doctor', 'Department', 'Status', 'Load'],
    rows: [
      ['Dr. Arjun Mehta', 'Cardiology', 'In consult', '82%'],
      ['Dr. Priya Sen', 'Pediatrics', 'Available', '64%'],
      ['Dr. Kabir Shah', 'Orthopedics', 'Rounds', '76%'],
      ['Dr. Zoya Mir', 'Neurology', 'Surgery', '91%']
    ]
  },
  patients: {
    columns: ['Patient', 'Case ID', 'Department', 'Priority'],
    rows: [
      ['Maya Kapoor', 'PAT-2084', 'Cardiology', 'High'],
      ['Noah Bennett', 'PAT-2091', 'Orthopedics', 'Normal'],
      ['Anaya Rao', 'PAT-2102', 'Pediatrics', 'Normal'],
      ['Ibrahim Khan', 'PAT-2110', 'Neurology', 'Critical']
    ]
  },
  appointments: {
    columns: ['Time', 'Patient', 'Doctor', 'Status'],
    rows: [
      ['09:20', 'Maya Kapoor', 'Dr. Arjun Mehta', 'Checked in'],
      ['10:00', 'Anaya Rao', 'Dr. Priya Sen', 'Waiting'],
      ['11:30', 'Sara Nair', 'Dr. Zoya Mir', 'Confirmed'],
      ['14:15', 'Ethan Roy', 'Dr. Kabir Shah', 'Pending']
    ]
  },
  records: {
    columns: ['Record', 'Patient', 'Owner', 'Updated'],
    rows: [
      ['CBC panel', 'Aman Verma', 'Lab desk', '4m ago'],
      ['Cardiac notes', 'Maya Kapoor', 'Dr. Mehta', '18m ago'],
      ['Discharge summary', 'Noah Bennett', 'Admin', '42m ago'],
      ['MRI upload', 'Ibrahim Khan', 'Radiology', '1h ago']
    ]
  },
  billing: {
    columns: ['Invoice', 'Patient', 'Amount', 'Status'],
    rows: [
      ['INV-2026-1001', 'Maya Kapoor', '$4,820', 'Issued'],
      ['INV-2026-1002', 'Noah Bennett', '$1,280', 'Paid'],
      ['INV-2026-1003', 'Anaya Rao', '$740', 'Draft'],
      ['INV-2026-1004', 'Sara Nair', '$7,400', 'Overdue']
    ]
  },
  payments: {
    columns: ['Reference', 'Method', 'Amount', 'Status'],
    rows: [
      ['UPI-HMS-2801', 'UPI', '$800', 'Successful'],
      ['CARD-4491', 'Card', '$2,300', 'Successful'],
      ['INS-1930', 'Insurance', '$6,400', 'Pending'],
      ['CASH-7782', 'Cash', '$420', 'Reconciled']
    ]
  },
  medicines: {
    columns: ['Medicine', 'Category', 'Stock', 'Status'],
    rows: [
      ['Paracetamol 500mg', 'Analgesic', '1,000', 'Healthy'],
      ['Amoxicillin 500mg', 'Antibiotic', '500', 'Healthy'],
      ['Cetirizine 10mg', 'Antihistamine', '72', 'Low'],
      ['Insulin Glargine', 'Diabetes', '34', 'Reorder']
    ]
  },
  departments: {
    columns: ['Department', 'Head', 'Capacity', 'Status'],
    rows: [
      ['General Medicine', 'Dr. R. Iyer', '86%', 'Active'],
      ['Cardiology', 'Dr. A. Mehta', '92%', 'Active'],
      ['Orthopedics', 'Dr. K. Shah', '74%', 'Active'],
      ['Radiology', 'Dr. S. Nair', '68%', 'Active']
    ]
  },
  users: {
    columns: ['Name', 'Email', 'Role', 'Status'],
    rows: []
  },
  activity: {
    columns: ['Action', 'Actor', 'Entity', 'Time'],
    rows: [
      ['create_appointment', 'Riya Sharma', 'APT-8801', '4m ago'],
      ['upload_report', 'Lab desk', 'CBC-4201', '12m ago'],
      ['record_payment', 'Billing', 'INV-1002', '21m ago'],
      ['update_permissions', 'Admin', 'Doctor role', '1h ago']
    ]
  }
};

export const notifications = [
  { title: 'ICU occupancy reached 86%', body: 'Capacity planning recommended for the next shift.', type: 'Capacity' },
  { title: '12 pharmacy items below reorder level', body: 'Inventory team has been notified.', type: 'Inventory' },
  { title: 'Radiology queue cleared ahead of SLA', body: 'Average report turnaround improved by 18%.', type: 'Operations' }
];

export const settings = [
  { title: 'Role Based Access', body: 'Manage permissions for Super Admin, Admin, Doctor, Receptionist, Nurse, Patient, Pharmacist, and Lab Technician.', icon: ShieldCheck },
  { title: 'Authentication', body: 'JWT, HTTP-only cookies, password reset, audit logs, and secure access controls.', icon: LockKeyhole },
  { title: 'Hospital Profile', body: 'Departments, staff, rooms, beds, consultation fees, lab tests, pharmacy inventory, and resources.', icon: Building2 },
  { title: 'Clinical Preferences', body: 'Appointment windows, patient records, alerts, discharge workflows, and escalation rules.', icon: HeartPulse }
];
