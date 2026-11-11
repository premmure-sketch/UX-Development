import type { AppRole, AppPermission } from '../types'

export const ROLE_PERMISSIONS: Record<AppRole, AppPermission[]> = {
  Admin: [
    'system:admin',
    'users:manage',
    'users:read',
    'audit:read',
    'security:manage',
    'employees:read',
    'employees:write',
    'employees:delete',
    'attendance:read_all',
    'attendance:read_dept',
    'attendance:read_own',
    'attendance:write',
    'analytics:view_all',
    'analytics:view_dept',
    'leave:manage',
  ],
  HR: [
    'users:read',
    'employees:read',
    'employees:write',
    'attendance:read_all',
    'attendance:read_dept',
    'attendance:read_own',
    'attendance:write',
    'analytics:view_all',
    'analytics:view_dept',
    'leave:manage',
  ],
  Manager: [
    'employees:read',
    'attendance:read_dept',
    'attendance:read_own',
    'attendance:write',
    'analytics:view_dept',
  ],
  'Team Lead': [
    'employees:read',
    'attendance:read_dept',
    'attendance:read_own',
    'attendance:write',
  ],
  Employee: [
    'attendance:read_own',
    'attendance:write',
  ],
}

export function getRolePermissions(role: AppRole): AppPermission[] {
  return ROLE_PERMISSIONS[role] || []
}

export function hasPermission(role: AppRole, permission: AppPermission): boolean {
  const permissions = getRolePermissions(role)
  return permissions.includes(permission)
}

export function isRoleAllowed(userRole: AppRole, allowedRoles: AppRole[]): boolean {
  return allowedRoles.includes(userRole)
}
