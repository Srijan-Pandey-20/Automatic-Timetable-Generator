import DashboardLayout from '../../components/Layout/DashboardLayout';

const adminNavItems = [
  { path: '/admin', label: 'Overview', end: true },
  { path: '/admin/branches', label: 'Branches' },
  { path: '/admin/sections', label: 'Sections' },
  { path: '/admin/subjects', label: 'Subjects' },
  { path: '/admin/faculty', label: 'Faculty' },
  { path: '/admin/rooms', label: 'Rooms' },
  { path: '/admin/generate', label: 'Generate Timetable' },
];

export default function AdminDashboard() {
  return <DashboardLayout navItems={adminNavItems} roleLabel="Admin" />;
}