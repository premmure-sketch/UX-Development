import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import { DashboardController } from './controllers/DashboardController'
import { EmployeeController } from './controllers/EmployeeController'
import { MetadataController } from './controllers/MetadataController'
import { getDatabase } from './db/database'
import { seedDatabase } from './db/seed'

export function createApp(): Express {
  const app = express()

  // Ensure database initialized & seeded
  const db = getDatabase()
  seedDatabase(db)

  // Middleware
  app.use(cors())
  app.use(express.json())

  // Controllers
  const dashboardController = new DashboardController()
  const employeeController = new EmployeeController()
  const metadataController = new MetadataController()

  // Dashboard endpoints
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
    res.status(500).json({ success: false, error: err.message || 'Internal server error' })
  })

  return app
}
