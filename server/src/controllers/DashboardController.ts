import { Request, Response } from 'express'
import { DashboardService } from '../services/DashboardService'
import type { DashboardFilterOptions } from '../types'

export class DashboardController {
  private service: DashboardService

  constructor(service?: DashboardService) {
    this.service = service || new DashboardService()
  }

  private extractFilters(req: Request): DashboardFilterOptions {
    return {
      date: typeof req.query.date === 'string' ? req.query.date : undefined,
      datePreset: (req.query.datePreset as any) || 'last7days',
      department: typeof req.query.department === 'string' ? req.query.department : 'All',
      location: typeof req.query.location === 'string' ? req.query.location : 'All',
      status: typeof req.query.status === 'string' ? req.query.status : 'All',
    }
  }

  getStats = (req: Request, res: Response): void => {
    try {
      const filters = this.extractFilters(req)
      const stats = this.service.getKpiSummary(filters)
      res.json({ success: true, data: stats })
    } catch (err: any) {
      console.error('[DashboardController.getStats] Error:', err)
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch KPI stats' })
    }
  }

  getTrends = (req: Request, res: Response): void => {
    try {
      const filters = this.extractFilters(req)
      const trends = this.service.getTrends(filters)
      res.json({ success: true, data: trends })
    } catch (err: any) {
      console.error('[DashboardController.getTrends] Error:', err)
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch trends' })
    }
  }

  getDepartments = (req: Request, res: Response): void => {
    try {
      const filters = this.extractFilters(req)
      const distribution = this.service.getDepartmentDistribution(filters)
      res.json({ success: true, data: distribution })
    } catch (err: any) {
      console.error('[DashboardController.getDepartments] Error:', err)
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch department distribution' })
    }
  }

  getComposition = (req: Request, res: Response): void => {
    try {
      const filters = this.extractFilters(req)
      const dimension = (req.query.dimension === 'type' ? 'type' : 'arrangement') as 'arrangement' | 'type'
      const composition = this.service.getWorkforceComposition(dimension, filters)
      res.json({ success: true, data: composition })
    } catch (err: any) {
      console.error('[DashboardController.getComposition] Error:', err)
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch workforce composition' })
    }
  }
}
