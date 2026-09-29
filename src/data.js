import { Users, ClipboardList, IndianRupee, Wrench, Sun, CheckCircle2, Clock, UserCheck, Workflow, LayoutGrid, LayoutDashboard, Mail } from 'lucide-react';

export const menuGroups = [
  {
    id: 'main',
    label: 'Main Menu',
    icon: LayoutGrid,
    items: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    id: 'workflow',
    label: 'Workflow',
    icon: Workflow,
    items: [{ id: 'email-requests', label: 'Email Requests', icon: Mail }],
  },
];

export const stats = [
  { icon: Users, tone: 'green', value: '6857', label: 'Total Customers', sub: '6857 active', go: 'dashboard' },
  { icon: ClipboardList, tone: 'red', value: '9', label: 'Pending Tasks', sub: '6 overdue', go: 'dashboard' },
  { icon: CheckCircle2, tone: 'blue', value: '178', label: 'Completed Tasks', sub: '95% completion rate', go: 'dashboard' },
  { icon: Sun, tone: 'green', value: '28.95 MW', label: 'Capacity Installed', sub: '6857 installations', go: 'dashboard' },
  { icon: IndianRupee, tone: 'green', value: '₹71.09Cr', label: 'Revenue Collected', sub: 'This month: ₹4.04Cr', badge: '73.8%', go: 'dashboard' },
  { icon: Clock, tone: 'red', value: '₹83.8L', label: 'Pending Payments', sub: '103 in progress', go: 'dashboard' },
  { icon: Wrench, tone: 'green', value: '290', label: 'Active Installations', sub: 'On the installation floor', go: 'dashboard' },
  { icon: UserCheck, tone: 'blue', value: '28', label: 'Team Members', sub: '5 field staff', go: 'dashboard' },
];

export const revenue = [
  { m: 'Apr', v: 190 }, { m: 'May', v: 220 }, { m: 'Jun', v: 265 },
  { m: 'Jul', v: 320 }, { m: 'Aug', v: 205 }, { m: 'Sep', v: 430 },
];

export const customerStatus = [
  { label: 'Active', value: 6857, color: '#5fba54' },
  { label: 'AMC', value: 0, color: '#3b82f6' },
  { label: 'Service', value: 0, color: '#f59e0b' },
  { label: 'Inactive', value: 0, color: '#9ca3af' },
];
