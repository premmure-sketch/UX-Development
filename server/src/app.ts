import express from 'express'
import type { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { DashboardController } from './controllers/DashboardController'
import { EmployeeController } from './controllers/EmployeeController'
import { MetadataController } from './controllers/MetadataController'
import { AuthController } from './controllers/AuthController'
import { AdminController } from './controllers/AdminController'
import { getDatabase } from './db/database'
import { seedDatabase } from './db/seed'
import { seedUsers } from './db/seedUsers'
import {
  authenticate,
  requireRole,
  loginRateLimiter,
} from './middleware/authMiddleware'

export function createApp(): Express {
  const app = express()

  // Ensure database initialized & seeded
  const db = getDatabase()
  seedDatabase(db)
  seedUsers(db)

  // API Security & Headers
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  )
  app.use(cors())
  app.use(express.json())

  // Controllers
  const dashboardController = new DashboardController()
  const employeeController = new EmployeeController()
  const metadataController = new MetadataController()
  const authController = new AuthController()
  const adminController = new AdminController()

  // -------------------------------------------------------------------------
  // Authentication & Session Endpoints
  // -------------------------------------------------------------------------
  app.post('/api/auth/login', loginRateLimiter, authController.login)
  app.post('/api/auth/mfa/login-verify', loginRateLimiter, authController.verifyMfaLogin)
  app.post('/api/auth/refresh', authController.refreshToken)
  app.post('/api/auth/logout', authenticate, authController.logout)
  app.get('/api/auth/me', authenticate, authController.getCurrentUser)

  // MFA Management (Authenticated)
  app.post('/api/auth/mfa/setup', authenticate, authController.setupMfa)
  app.post('/api/auth/mfa/confirm', authenticate, authController.confirmMfa)
  app.post('/api/auth/mfa/disable', authenticate, authController.disableMfa)

  // Session Management (Authenticated)
  app.get('/api/auth/sessions', authenticate, authController.getSessions)
  app.delete('/api/auth/sessions/:sessionId', authenticate, authController.revokeSession)
  app.post('/api/auth/sessions/revoke-others', authenticate, authController.revokeAllOtherSessions)

  // -------------------------------------------------------------------------
  // Role-Based Administration Endpoints (Admin & HR)
  // -------------------------------------------------------------------------
  app.get(
    '/api/admin/users',
    authenticate,
    requireRole(['Admin', 'HR']),
    adminController.getUsers
  )
  app.post('/api/admin/users', authenticate, requireRole(['Admin']), adminController.createUser)
  app.put('/api/admin/users/:id', authenticate, requireRole(['Admin']), adminController.updateUser)
  app.post(
    '/api/admin/users/:id/unlock',
    authenticate,
    requireRole(['Admin']),
    adminController.unlockUser
  )
  app.get(
    '/api/admin/audit-logs',
    authenticate,
    requireRole(['Admin']),
    adminController.getAuditLogs
  )
  app.get(
    '/api/admin/audit-actions',
    authenticate,
    requireRole(['Admin']),
    adminController.getAuditActions
  )

  // -------------------------------------------------------------------------
  // Core Dashboard & Analytics (Accessible to authenticated users)
  // -------------------------------------------------------------------------
  app.get('/api/dashboard/stats', dashboardController.getStats)
  app.get('/api/dashboard/trends', dashboardController.getTrends)
  app.get('/api/dashboard/departments', dashboardController.getDepartments)
  app.get('/api/dashboard/composition', dashboardController.getComposition)

  // Employee endpoints
  app.get('/api/employees', employeeController.getEmployees)
  app.get('/api/employees/:id', employeeController.getEmployeeById)
  app.post('/api/employees/:id/attendance', employeeController.updateAttendance)

  // Metadata & System Health
  app.get('/api/metadata', metadataController.getMetadata)
  app.get('/api/health', metadataController.getHealth)

  // 404 Handler
  app.use('/api', (req: Request, res: Response) => {
    res.status(404).json({ success: false, error: `Endpoint ${req.method} ${req.path} not found` })
  })

  // Global Error Handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[Express Global Error]', err)
    res.status(err.statusCode || 500).json({ success: false, error: err.message || 'Internal server error' })
  })

  return app
}
