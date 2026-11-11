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

export interface AuthUser {
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
  permissions: AppPermission[]
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface UserSession {
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

export interface AuditLogItem {
  id: number
  userId: string | null
  userEmail: string | null
  action: string
  ipAddress: string | null
  status: 'SUCCESS' | 'WARNING' | 'FAILURE'
  details: Record<string, any> | null
  createdAt: string
}

export interface MfaSetupData {
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
}
