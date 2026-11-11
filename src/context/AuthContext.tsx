import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { AuthUser, AppRole, AppPermission } from '../types/auth'
import { authApi, authStorage } from '../services/authApi'

const DEFAULT_ADMIN_USER: AuthUser = {
  id: 'USR-ADMIN-01',
  employeeId: null,
  name: 'Dr. Alistair Vance',
  email: 'admin@stackly.com',
  role: 'Admin',
  departmentId: null,
  departmentName: 'Executive Leadership',
  isActive: true,
  isLocked: false,
  lockedUntil: null,
  isMfaEnabled: false,
  permissions: [
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
  createdAt: '2026-11-01T00:00:00.000Z',
}

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  pendingMfa: { mfaToken: string; email: string } | null
  login: (email: string, password: string) => Promise<{ mfaRequired: boolean }>
  verifyMfa: (code: string, isBackupCode?: boolean) => Promise<void>
  logout: () => Promise<void>
  clearMfaState: () => void
  hasRole: (roles: AppRole[]) => boolean
  hasPermission: (permission: AppPermission) => boolean
  refreshUser: () => Promise<void>
  activeNav: string
  setActiveNav: (nav: string) => void
  switchDemoRole: (role: AppRole) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === 'undefined') return DEFAULT_ADMIN_USER
    if (localStorage.getItem('stackly_logged_out') === 'true') {
      return null
    }
    const saved = authStorage.getUser()
    return saved || DEFAULT_ADMIN_USER
  })

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [pendingMfa, setPendingMfa] = useState<{ mfaToken: string; email: string } | null>(null)
  const [activeNav, setActiveNav] = useState<string>('dashboard')

  // Verify active token on mount if present
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem('stackly_logged_out') === 'true') {
      setUser(null)
      return
    }

    const token = authStorage.getAccessToken()
    if (token) {
      authApi
        .getMe()
        .then((fetchedUser) => {
          setUser(fetchedUser)
        })
        .catch(() => {
          // Keep current user or fallback
        })
    }
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<{ mfaRequired: boolean }> => {
    setIsLoading(true)
    try {
      const res = await authApi.login(email, password)
      if (res.mfaRequired) {
        setPendingMfa({ mfaToken: res.mfaToken, email: res.email })
        return { mfaRequired: true }
      } else {
        localStorage.removeItem('stackly_logged_out')
        setUser(res.user)
        setPendingMfa(null)
        return { mfaRequired: false }
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const verifyMfa = useCallback(async (code: string, isBackupCode?: boolean): Promise<void> => {
    if (!pendingMfa) throw new Error('No pending MFA session')
    setIsLoading(true)
    try {
      const res = await authApi.verifyMfaLogin({
        mfaToken: pendingMfa.mfaToken,
        code,
        isBackupCode,
      })
      localStorage.removeItem('stackly_logged_out')
      setUser(res.user)
      setPendingMfa(null)
    } finally {
      setIsLoading(false)
    }
  }, [pendingMfa])

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    try {
      await authApi.logout()
    } finally {
      localStorage.setItem('stackly_logged_out', 'true')
      setUser(null)
      setPendingMfa(null)
      setIsLoading(false)
    }
  }, [])

  const clearMfaState = useCallback(() => {
    setPendingMfa(null)
  }, [])

  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const refreshed = await authApi.getMe()
      setUser(refreshed)
    } catch {
      // ignore
    }
  }, [])

  const hasRole = useCallback((roles: AppRole[]): boolean => {
    if (!user) return false
    return roles.includes(user.role)
  }, [user])

  const hasPermission = useCallback((permission: AppPermission): boolean => {
    if (!user) return false
    return user.permissions.includes(permission)
  }, [user])

  const switchDemoRole = useCallback(async (role: AppRole): Promise<void> => {
    const creds: Record<AppRole, { email: string; pass: string }> = {
      Admin: { email: 'admin@stackly.com', pass: 'Admin@123456' },
      HR: { email: 'hr@stackly.com', pass: 'Hr@123456' },
      Manager: { email: 'manager@stackly.com', pass: 'Manager@123456' },
      'Team Lead': { email: 'teamlead@stackly.com', pass: 'TeamLead@123456' },
      Employee: { email: 'employee@stackly.com', pass: 'Employee@123456' },
    }

    const { email, pass } = creds[role]
    await login(email, pass)
    setActiveNav('dashboard')
  }, [login])

  const value: AuthContextValue = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    pendingMfa,
    login,
    verifyMfa,
    logout,
    clearMfaState,
    hasRole,
    hasPermission,
    refreshUser,
    activeNav,
    setActiveNav,
    switchDemoRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
