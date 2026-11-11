import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import http from 'http'
import type { AddressInfo } from 'net'
import { createApp } from '../../server/src/app'

describe('Authentication & RBAC REST API Integration Tests', () => {
  let server: http.Server
  let baseUrl: string

  beforeAll(async () => {
    const app = createApp()
    server = http.createServer(app)
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const address = server.address() as AddressInfo
        baseUrl = `http://127.0.0.1:${address.port}`
        resolve()
      })
    })
  })

  afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()))
    }
  })

  it('rejects login with invalid password and reports remaining attempts', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@stackly.com', password: 'WrongPassword999' }),
    })

    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data.success).toBe(false)
    expect(data.error).toMatch(/Invalid email or password/)
  })

  it('authenticates valid credentials for Admin and returns JWT tokens and user claims', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@stackly.com', password: 'Admin@123456' }),
    })

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.tokens).toBeDefined()
    expect(data.tokens.accessToken).toBeDefined()
    expect(data.tokens.refreshToken).toBeDefined()
    expect(data.user.email).toBe('admin@stackly.com')
    expect(data.user.role).toBe('Admin')
    expect(data.user.permissions).toContain('system:admin')
    expect(data.user.permissions).toContain('users:manage')
  })

  it('authenticates valid credentials for Employee and assigns restricted Employee permissions', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'employee@stackly.com', password: 'Employee@123456' }),
    })

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.user.role).toBe('Employee')
    expect(data.user.permissions).toContain('attendance:read_own')
    expect(data.user.permissions).not.toContain('users:manage')
  })

  it('enforces RBAC: blocks unauthorized route access without token (401)', async () => {
    const res = await fetch(`${baseUrl}/api/admin/users`)
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data.success).toBe(false)
    expect(data.error).toMatch(/Authentication required/)
  })

  it('enforces RBAC: blocks Employee from accessing Admin-only endpoint (403 Forbidden)', async () => {
    // 1. Login as employee
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'employee@stackly.com', password: 'Employee@123456' }),
    })
    const { tokens } = await loginRes.json()

    // 2. Try to access /api/admin/users
    const adminRes = await fetch(`${baseUrl}/api/admin/users`, {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    })

    expect(adminRes.status).toBe(403)
    const errData = await adminRes.json()
    expect(errData.success).toBe(false)
    expect(errData.error).toMatch(/Access Denied/)
    expect(errData.currentRole).toBe('Employee')
    expect(errData.requiredRoles).toContain('Admin')
  })

  it('enforces RBAC: allows Admin to access user administration (200 OK)', async () => {
    // 1. Login as admin
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@stackly.com', password: 'Admin@123456' }),
    })
    const { tokens } = await loginRes.json()

    // 2. Fetch users
    const adminRes = await fetch(`${baseUrl}/api/admin/users`, {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    })

    expect(adminRes.status).toBe(200)
    const resData = await adminRes.json()
    expect(resData.success).toBe(true)
    expect(resData.items.length).toBeGreaterThanOrEqual(5)
  })

  it('rotates refresh tokens and detects token reuse', async () => {
    // 1. Login
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'hr@stackly.com', password: 'Hr@123456' }),
    })
    const { tokens } = await loginRes.json()
    const originalRefreshToken = tokens.refreshToken

    // 2. Refresh tokens
    const refreshRes = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: originalRefreshToken }),
    })

    expect(refreshRes.status).toBe(200)
    const refreshData = await refreshRes.json()
    expect(refreshData.tokens.accessToken).toBeDefined()
    expect(refreshData.tokens.refreshToken).toBeDefined()
    expect(refreshData.tokens.refreshToken).not.toBe(originalRefreshToken)

    // 3. Replay attack: try to use old originalRefreshToken again
    const replayRes = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: originalRefreshToken }),
    })

    expect(replayRes.status).toBe(401)
    const replayData = await replayRes.json()
    expect(replayData.error).toMatch(/Refresh token reuse detected/)
  })

  it('allows Admin to view compliance audit logs', async () => {
    // 1. Login as admin
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@stackly.com', password: 'Admin@123456' }),
    })
    const { tokens } = await loginRes.json()

    // 2. Query audit logs
    const auditRes = await fetch(`${baseUrl}/api/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    })

    expect(auditRes.status).toBe(200)
    const auditData = await auditRes.json()
    expect(auditData.success).toBe(true)
    expect(auditData.items.length).toBeGreaterThan(0)
    expect(auditData.items[0].action).toBeDefined()
  })

  it('tracks and returns active user sessions', async () => {
    // 1. Login
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'manager@stackly.com', password: 'Manager@123456' }),
    })
    const { tokens } = await loginRes.json()

    // 2. Get sessions
    const sessionsRes = await fetch(`${baseUrl}/api/auth/sessions`, {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    })

    expect(sessionsRes.status).toBe(200)
    const sessionsData = await sessionsRes.json()
    expect(sessionsData.success).toBe(true)
    expect(sessionsData.sessions.length).toBeGreaterThan(0)
    expect(sessionsData.sessions.some((s: any) => s.isCurrent)).toBe(true)
  })
})
