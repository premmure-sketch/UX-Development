export type EmployeeStatus = 'Present' | 'Remote' | 'On leave' | 'Absent';
export type Employee = { id: number; name: string; role: string; department: string; location: string; status: EmployeeStatus; time: string; initials: string; color: string };
export const attendanceTrend = [
  { day: 'Mon', present: 842, remote: 112 }, { day: 'Tue', present: 875, remote: 128 },
  { day: 'Wed', present: 826, remote: 145 }, { day: 'Thu', present: 901, remote: 119 },
  { day: 'Fri', present: 864, remote: 137 }, { day: 'Sat', present: 318, remote: 32 },
  { day: 'Sun', present: 224, remote: 18 },
];
export const departments = [
  { name: 'Engineering', value: 324, color: '#6558d3' }, { name: 'Sales', value: 218, color: '#2e9d87' },
  { name: 'Operations', value: 186, color: '#f2a65a' }, { name: 'Marketing', value: 142, color: '#5b9de6' },
  { name: 'People & HR', value: 96, color: '#d977a8' }, { name: 'Finance', value: 82, color: '#94a3b8' },
];
export const workforceMix = [{ name: 'Full-time', value: 72, color: '#6558d3' }, { name: 'Contract', value: 18, color: '#2e9d87' }, { name: 'Part-time', value: 10, color: '#f2a65a' }];
export const employees: Employee[] = [
  { id: 1, name: 'Olivia Rhye', role: 'Product Designer', department: 'Design', location: 'New York', status: 'Present', time: '09:04 AM', initials: 'OR', color: '#e8def8' },
  { id: 2, name: 'Phoenix Baker', role: 'Engineering Lead', department: 'Engineering', location: 'London', status: 'Remote', time: '08:58 AM', initials: 'PB', color: '#dbeafe' },
  { id: 3, name: 'Lana Steiner', role: 'People Partner', department: 'People & HR', location: 'New York', status: 'On leave', time: 'Yesterday', initials: 'LS', color: '#fce7f3' },
  { id: 4, name: 'Demi Wilkinson', role: 'Marketing Manager', department: 'Marketing', location: 'Singapore', status: 'Present', time: '08:42 AM', initials: 'DW', color: '#dcfce7' },
  { id: 5, name: 'Candice Wu', role: 'Sales Executive', department: 'Sales', location: 'London', status: 'Absent', time: 'No check-in', initials: 'CW', color: '#ffedd5' },
];
