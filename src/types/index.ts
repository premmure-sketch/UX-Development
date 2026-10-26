export type DepartmentType =
  | 'Engineering'
  | 'Product'
  | 'Sales'
  | 'Marketing'
  | 'Human Resources'
  | 'Finance'
  | 'Operations'
  | 'Customer Support'

export type LocationType =
  | 'New York HQ'
  | 'San Francisco'
  | 'London'
  | 'Berlin'
  | 'Singapore'
  | 'Remote'

export type EmployeeStatus = 'Present' | 'Late' | 'Remote' | 'On Leave' | 'Absent'

export type EmploymentType = 'Full-time' | 'Contract' | 'Part-time' | 'Intern'

export type WorkArrangement = 'In-Office' | 'Hybrid' | 'Remote'

export type DatePreset = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth'

export interface Employee {
  id: string
  name: string
  email: string
  role: string
  department: DepartmentType
  location: LocationType
  workType: EmploymentType
  workArrangement: WorkArrangement
  status: EmployeeStatus
  checkInTime: string | null
  expectedCheckIn: string
  checkInLocation: string
  lastActive: string
  leaveReason?: string
  avatarUrl?: string
  attendanceScore: number
  phone: string
}

export interface KpiMetric {
  value: number | string
  displayValue: string
  trend: number
  isPositive: boolean
  benchmarkLabel: string
  subMetrics: { label: string; value: string | number }[]
  sparkline: number[]
}

export interface DashboardKpiSummary {
  totalHeadcount: KpiMetric
  attendanceRate: KpiMetric
  onTimeArrivalRate: KpiMetric
  absenteeismRate: KpiMetric
  remoteWorkforce: KpiMetric
}

export interface AttendanceTrendPoint {
  date: string
  label: string
  present: number
  late: number
  remote: number
  absent: number
  attendanceRate: number
  benchmark: number
}

export interface DepartmentDistributionPoint {
  department: DepartmentType
  shortName: string
  headcount: number
  present: number
  late: number
  remote: number
  absent: number
  attendanceRate: number
}

export interface WorkforceBreakdownItem {
  name: string
  value: number
  percentage: number
  color: string
}

export interface DashboardFilters {
  search: string
  datePreset: DatePreset
  department: string // 'All' or DepartmentType
  location: string   // 'All' or LocationType
  status: string     // 'All' or EmployeeStatus
}

export type UIState = 'normal' | 'loading' | 'empty' | 'error'
export type ThemeMode = 'light' | 'dark'

export interface NotificationItem {
  id: string
  title: string
  description: string
  time: string
  type: 'info' | 'warning' | 'success' | 'alert'
  unread: boolean
}
