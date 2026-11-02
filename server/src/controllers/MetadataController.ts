import { Request, Response } from 'express'
import { DepartmentRepository } from '../repositories/DepartmentRepository'
import { LocationRepository } from '../repositories/LocationRepository'
import { EmployeeRepository } from '../repositories/EmployeeRepository'

export class MetadataController {
  private deptRepo: DepartmentRepository
  private locRepo: LocationRepository
  private empRepo: EmployeeRepository

  constructor() {
    this.deptRepo = new DepartmentRepository()
    this.locRepo = new LocationRepository()
    this.empRepo = new EmployeeRepository()
  }

  getMetadata = (_req: Request, res: Response): void => {
    try {
      const departments = this.deptRepo.findAll()
      const locations = this.locRepo.findAll()
      const statuses = ['All', 'Present', 'Late', 'Remote', 'On Leave', 'Absent']
      const datePresets = [
        { value: 'today', label: 'Today (Live)' },
        { value: 'yesterday', label: 'Yesterday' },
        { value: 'last7days', label: 'Last 7 Days' },
        { value: 'last30days', label: 'Last 30 Days' },
        { value: 'thisMonth', label: 'This Month' },
      ]

      res.json({
        success: true,
        data: {
          departments: departments.map((d) => ({ id: d.id, name: d.name, code: d.code, color: d.color })),
          locations: locations.map((l) => ({ id: l.id, name: l.name, city: l.city, country: l.country })),
          statuses,
          datePresets,
        },
      })
    } catch (err: any) {
      console.error('[MetadataController.getMetadata] Error:', err)
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch metadata' })
    }
  }

  getHealth = (_req: Request, res: Response): void => {
    try {
      const totalEmployees = this.empRepo.count()
      res.json({
        success: true,
        status: 'UP',
        database: 'SQLite',
        totalEmployees,
        timestamp: new Date().toISOString(),
      })
    } catch (err: any) {
      console.error('[MetadataController.getHealth] Error:', err)
      res.status(500).json({ success: false, status: 'DOWN', error: err.message })
    }
  }
}
