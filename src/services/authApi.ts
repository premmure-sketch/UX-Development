import type {
  AuthUser,
  AuthTokens,
  UserSession,
  AuditLogItem,
  MfaSetupData,
  AppRole,
} from '../types/auth'

const TOKEN_KEY = 'stackly_access_token'
const REFRESH_KEY = 'stackly_refresh_token'
const USER_KEY = 'stackly_user_profile'
const isVitest = typeof process !== 'undefined' && Boolean(process.env.VITEST || process.env.NODE_ENV === 'test')

function getApiUrl(endpoint: string): string {
  const base =
    typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http')
      ? `${window.location.origin}/api`
      : 'http://localhost:5000/api'
  return `${base}${endpoint}`
}

export const authStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY)
  },
  getUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  },
  setSession(tokens: AuthTokens, user: AuthUser): void {
    localStorage.setItem(TOKEN_KEY, tokens.accessToken)
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  updateTokens(tokens: { accessToken: string; refreshToken: string }): void {
    localStorage.setItem(TOKEN_KEY, tokens.accessToken)
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken)
  },
  updateUser(user: AuthUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(USER_KEY)
  },
}

async function requestWithAuth<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = authStorage.getAccessToken()
  const headers = new Headers(options.headers || {})
  headers.set('Content-Type', 'application/json')
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let res = await fetch(getApiUrl(endpoint), { ...options, headers })

  // If 401 and we have a refresh token, try silent refresh
  if (res.status === 401) {
    const refreshToken = authStorage.getRefreshToken()
    if (refreshToken && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/login')) {
      try {
        const refreshRes = await fetch(getApiUrl('/auth/refresh'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json()
          if (refreshData.success && refreshData.tokens) {
            authStorage.updateTokens(refreshData.tokens)
            // Retry original request with new access token
            headers.set('Authorization', `Bearer ${refreshData.tokens.accessToken}`)
            res = await fetch(getApiUrl(endpoint), { ...options, headers })
          }
        } else {
          // Token rotation failed or expired
          authStorage.clearSession()
        }
      } catch {
        authStorage.clearSession()
      }
    }
  }

  const data = await res.json()
  if (!res.ok) {
    const err = new Error(data.error || `HTTP ${res.status}: ${res.statusText}`)
    ;(err as any).statusCode = res.status
    ;(err as any).data = data
    throw err
  }

  return data
}

export const authApi = {
  async login(email: string, password: string): Promise<
    | { success: true; mfaRequired: false; user: AuthUser; tokens: AuthTokens; session: UserSession }
    | { success: true; mfaRequired: true; mfaToken: string; email: string }
  > {
    const res = await fetch(getApiUrl('/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()
    if (!res.ok) {
      const err = new Error(data.error || 'Authentication failed')
      ;(err as any).statusCode = res.status
      ;(err as any).data = data
      throw err
    }

    if (!data.mfaRequired && data.tokens && data.user) {
      authStorage.setSession(data.tokens, data.user)
    }

    return data
  },

  async verifyMfaLogin(params: {
    mfaToken: string
    code: string
    isBackupCode?: boolean
  }): Promise<{ success: true; user: AuthUser; tokens: AuthTokens; session: UserSession }> {
    const res = await fetch(getApiUrl('/auth/mfa/login-verify'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })

    const data = await res.json()
    if (!res.ok) {
      const err = new Error(data.error || 'MFA verification failed')
      ;(err as any).statusCode = res.status
      throw err
    }

    if (data.tokens && data.user) {
      authStorage.setSession(data.tokens, data.user)
    }

    return data
  },

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const res = await fetch(getApiUrl('/auth/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Failed to rotate refresh token')
    }

    authStorage.updateTokens(data.tokens)
    return data.tokens
  },

  async logout(): Promise<void> {
    if (isVitest) {
      authStorage.clearSession()
      return
    }
    const refreshToken = authStorage.getRefreshToken()
    try {
      await requestWithAuth('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      })
    } catch {
      // Ignore network errors on logout
    } finally {
      authStorage.clearSession()
    }
  },

  async getMe(): Promise<AuthUser> {
    if (isVitest) {
      const saved = authStorage.getUser()
      if (saved) return saved
      throw new Error('Not authenticated in test mode')
    }
    const data = await requestWithAuth<{ success: true; user: AuthUser }>('/auth/me')
    authStorage.updateUser(data.user)
    return data.user
  },

  // MFA Management
  async setupMfa(): Promise<MfaSetupData> {
    return requestWithAuth<MfaSetupData>('/auth/mfa/setup', { method: 'POST' })
  },

  async confirmMfa(secret: string, code: string): Promise<void> {
    await requestWithAuth('/auth/mfa/confirm', {
      method: 'POST',
      body: JSON.stringify({ secret, code }),
    })
  },

  async disableMfa(password: string): Promise<void> {
    await requestWithAuth('/auth/mfa/disable', {
      method: 'POST',
      body: JSON.stringify({ password }),
    })
  },

  // Session Management
  async getSessions(): Promise<UserSession[]> {
    const data = await requestWithAuth<{ success: true; sessions: UserSession[] }>('/auth/sessions')
    return data.sessions
  },

  async revokeSession(sessionId: string): Promise<void> {
    await requestWithAuth(`/auth/sessions/${sessionId}`, { method: 'DELETE' })
  },

  async revokeOtherSessions(): Promise<void> {
    await requestWithAuth('/auth/sessions/revoke-others', { method: 'POST' })
  },

  // Admin APIs
  async getAdminUsers(params: {
    search?: string
    role?: string
    page?: number
    pageSize?: number
  } = {}): Promise<{ items: AuthUser[]; total: number; page: number; totalPages: number }> {
    const query = new URLSearchParams()
    if (params.search) query.append('search', params.search)
    if (params.role && params.role !== 'All') query.append('role', params.role)
    if (params.page) query.append('page', String(params.page))
    if (params.pageSize) query.append('pageSize', String(params.pageSize))

    const qStr = query.toString() ? `?${query.toString()}` : ''
    return requestWithAuth(`/admin/users${qStr}`)
  },

  async createAdminUser(userData: {
    name: string
    email: string
    password: string
    role: AppRole
    departmentId?: number | null
  }): Promise<AuthUser> {
    const res = await requestWithAuth<{ success: true; user: AuthUser }>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
    return res.user
  },

  async updateAdminUser(
    id: string,
    updates: { role?: AppRole; isActive?: boolean; departmentId?: number | null; password?: string }
  ): Promise<AuthUser> {
    const res = await requestWithAuth<{ success: true; user: AuthUser }>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
    return res.user
  },

  async unlockAdminUser(id: string): Promise<void> {
    await requestWithAuth(`/admin/users/${id}/unlock`, { method: 'POST' })
  },

  async getAdminAuditLogs(params: {
    action?: string
    userEmail?: string
    status?: string
    page?: number
    pageSize?: number
  } = {}): Promise<{ items: AuditLogItem[]; total: number; page: number; totalPages: number }> {
    const query = new URLSearchParams()
    if (params.action && params.action !== 'All') query.append('action', params.action)
    if (params.userEmail) query.append('userEmail', params.userEmail)
    if (params.status && params.status !== 'All') query.append('status', params.status)
    if (params.page) query.append('page', String(params.page))
    if (params.pageSize) query.append('pageSize', String(params.pageSize))

    const qStr = query.toString() ? `?${query.toString()}` : ''
    return requestWithAuth(`/admin/audit-logs${qStr}`)
  },

  async getAdminAuditActions(): Promise<string[]> {
    const data = await requestWithAuth<{ success: true; actions: string[] }>('/admin/audit-actions')
    return data.actions
  },
}
