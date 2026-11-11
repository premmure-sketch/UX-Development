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

// ---------------------------------------------------------------------------
// Authentication, RBAC, Sessions & Audit Types
// ---------------------------------------------------------------------------

export type AppRole = 'Admin' | 'HR' | 'Manager' | 'Team Lead' | 'Employee'

export type AppPermission =
  | 'system:admin'
  | 'users:manage'
  | 'users:read'
  | 'audit:read'
  | 'security:manage'
  | 'employees:read'
  | 'employees:write'
  | 'employees:delete'
  | 'attendance:read_all'
  | 'attendance:read_dept'
  | 'attendance:read_own'
  | 'attendance:write'
  | 'analytics:view_all'
  | 'analytics:view_dept'
  | 'leave:manage'

export interface UserRow {
  id: string
  employee_id: string | null
  name: string
  email: string
  password_hash: string
  role: AppRole
  department_id: number | null
  is_active: number
  failed_login_attempts: number
  locked_until: string | null
  is_mfa_enabled: number
  mfa_secret: string | null
  created_at: string
  updated_at: string
}

export interface UserDTO {
  id: string
  employeeId: string | null
  name: string
  email: string
  role: AppRole
  departmentId: number | null
  departmentName?: string
  isActive: boolean
  isLocked: boolean
  lockedUntil: string | null
  isMfaEnabled: boolean
  permissions: string[]
  createdAt: string
}

export interface UserBackupCodeRow {
  id: number
  user_id: string
  code_hash: string
  is_used: number
  used_at: string | null
  created_at: string
}

export interface RefreshTokenRow {
  id: number
  user_id: string
  token: string
  family_id: string
  is_revoked: number
  replaced_by_token: string | null
  expires_at: string
  created_at: string
}

export interface UserSessionRow {
  id: string
  user_id: string
  ip_address: string | null
  user_agent: string | null
  device_info: string | null
  is_active: number
  last_active_at: string
  created_at: string
}

export interface UserSessionDTO {
  id: string
  userId: string
  ipAddress: string | null
  userAgent: string | null
  deviceInfo: string | null
  isActive: boolean
  isCurrent?: boolean
  lastActiveAt: string
  createdAt: string
}

export interface AuditLogRow {
  id: number
  user_id: string | null
  user_email: string | null
  action: string
  ip_address: string | null
  status: 'SUCCESS' | 'WARNING' | 'FAILURE'
  details: string | null
  created_at: string
}

export interface AuditLogDTO {
  id: number
  userId: string | null
  userEmail: string | null
  action: string
  ipAddress: string | null
  status: 'SUCCESS' | 'WARNING' | 'FAILURE'
  details: Record<string, any> | null
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface AuthSuccessResponse {
  success: true
  user: UserDTO
  tokens: AuthTokens
}

export interface MfaRequiredResponse {
  success: true
  mfaRequired: true
  mfaToken: string
  email: string
  message: string
}

export interface JwtPayload {
  userId: string
  email: string
  name: string
  role: AppRole
  permissions: string[]
  departmentId: number | null
  sessionId: string
}

