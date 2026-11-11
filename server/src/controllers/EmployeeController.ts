import type { Request, Response } from 'express'
import { EmployeeService } from '../services/EmployeeService'
import type { EmployeeFilterOptions } from '../types'

export class EmployeeController {
  private service: EmployeeService

  constructor(service?: EmployeeService) {
    this.service = service || new EmployeeService()
  }

  getEmployees = (req: Request, res: Response): void => {
    try {
      const options: EmployeeFilterOptions = {
        search: typeof req.query.search === 'string' ? req.query.search : undefined,
        department: typeof req.query.department === 'string' ? req.query.department : undefined,
        location: typeof req.query.location === 'string' ? req.query.location : undefined,
        status: typeof req.query.status === 'string' ? req.query.status : undefined,
        sortBy: (req.query.sortBy as any) || 'name',
        sortOrder: (req.query.sortOrder as any) || 'asc',
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 10,
        date: typeof req.query.date === 'string' ? req.query.date : '2026-11-02',
      }

      const paginatedResult = this.service.getEmployees(options)
      res.json({ success: true, ...paginatedResult })
    } catch (err: any) {
      console.error('[EmployeeController.getEmployees] Error:', err)
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch employees' })
    }
  }

  getEmployeeById = (req: Request, res: Response): void => {
    try {
      const id = req.params.id as string
      const date = typeof req.query.date === 'string' ? req.query.date : '2026-11-02'
      const { employee, history } = this.service.getEmployeeById(id, date)

      if (!employee) {
        res.status(404).json({ success: false, error: `Employee ${id} not found` })
        return
      }

      res.json({ success: true, data: { ...employee, history } })
    } catch (err: any) {
      console.error('[EmployeeController.getEmployeeById] Error:', err)
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch employee dossier' })
    }
  }

  updateAttendance = (req: Request, res: Response): void => {
    try {
      const id = req.params.id as string
      const { date = '2026-11-02', status, checkInTime, notes } = req.body

      if (!status) {
        res.status(400).json({ success: false, error: 'Status is required' })
        return
      }

      const updated = this.service.updateAttendance(id, date, status, checkInTime, notes)
      res.json({ success: updated, message: 'Attendance updated successfully' })
    } catch (err: any) {
      console.error('[EmployeeController.updateAttendance] Error:', err)
      res.status(500).json({ success: false, error: err.message || 'Failed to update attendance' })
    }
  }
}
