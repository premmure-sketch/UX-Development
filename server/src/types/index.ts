export type DepartmentName =
  | 'Engineering'
  | 'Product'
  | 'Sales'
  | 'Marketing'
  | 'Human Resources'
  | 'Finance'
  | 'Operations'
  | 'Customer Support'

export type LocationName =
  | 'New York HQ'
  | 'San Francisco'
  | 'London'
  | 'Berlin'
  | 'Singapore'
  | 'Remote'

export type EmployeeStatus = 'Present' | 'Late' | 'Remote' | 'On Leave' | 'Absent'
export type EmploymentType = 'Full-time' | 'Contract' | 'Part-time' | 'Intern'
export type WorkArrangement = 'In-Office' | 'Hybrid' | 'Remote'

export interface DepartmentRow {
  id: number
  name: DepartmentName
  code: string
  color: string
  budget: number
  created_at: string
}

export interface LocationRow {
  id: number
  name: LocationName
  city: string
  country: string
  timezone: string
}

export interface EmployeeRow {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  role: string
  department_id: number
  location_id: number
  work_type: EmploymentType
  work_arrangement: WorkArrangement
  attendance_score: number
  avatar_url?: string
  hire_date: string
  is_active: number
  created_at: string
}

export interface AttendanceRow {
  id: number
  employee_id: string
  date: string
  status: EmployeeStatus
  check_in_time: string | null
  check_out_time: string | null
  check_in_location: string
  notes?: string
  created_at: string
}

export interface EmployeeDetailsDTO {
  id: string
  name: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: string
  department: DepartmentName
  departmentId: number
  departmentColor: string
  location: LocationName
  locationId: number
  workType: EmploymentType
  workArrangement: WorkArrangement
  status: EmployeeStatus
  checkInTime: string | null
  checkOutTime: string | null
  checkInLocation: string
  lastActive: string
  leaveReason?: string
  avatarUrl?: string
  attendanceScore: number
  hireDate: string
}

export interface EmployeeFilterOptions {
  search?: string
  department?: string
  location?: string
  status?: string
  sortBy?: 'name' | 'department' | 'location' | 'status' | 'checkInTime' | 'attendanceScore'
  sortOrder?: 'asc' | 'desc'
  page?: number
  pageSize?: number
  date?: string
}

export interface DashboardFilterOptions {
  date?: string
  datePreset?: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth'
  department?: string
  location?: string
  status?: string
}

export interface KpiMetricDTO {
  value: number | string
  displayValue: string
  trend: number
  isPositive: boolean
  benchmarkLabel: string
  subMetrics: { label: string; value: string | number }[]
  sparkline: number[]
}

export interface DashboardKpiSummaryDTO {
  totalEmployees: KpiMetricDTO
  present: KpiMetricDTO
  absent: KpiMetricDTO
  onLeave: KpiMetricDTO
  attendanceRate: KpiMetricDTO
  // Supplementary metrics for enterprise richness
  onTimeArrivalRate: KpiMetricDTO
  remoteWorkforce: KpiMetricDTO
}

export interface AttendanceTrendPointDTO {
  date: string
  label: string
  present: number
  late: number
  remote: number
  absent: number
  attendanceRate: number
  benchmark: number
}

export interface DepartmentDistributionPointDTO {
  department: string
  shortName: string
  headcount: number
  present: number
  late: number
  remote: number
  absent: number
  attendanceRate: number
}

export interface WorkforceBreakdownItemDTO {
  name: string
  value: number
  percentage: number
  color: string
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
