import { AttendanceRepository, type IAttendanceRepository } from '../repositories/AttendanceRepository'
import { DepartmentRepository, type IDepartmentRepository } from '../repositories/DepartmentRepository'
import type {
  DashboardFilterOptions,
  DashboardKpiSummaryDTO,
  AttendanceTrendPointDTO,
  DepartmentDistributionPointDTO,
  WorkforceBreakdownItemDTO,
} from '../types'

export class DashboardService {
  private attendanceRepo: IAttendanceRepository
  private departmentRepo: IDepartmentRepository

  constructor(
    attendanceRepo?: IAttendanceRepository,
    departmentRepo?: IDepartmentRepository
  ) {
    this.attendanceRepo = attendanceRepo || new AttendanceRepository()
    this.departmentRepo = departmentRepo || new DepartmentRepository()
  }

  getKpiSummary(filters: DashboardFilterOptions): DashboardKpiSummaryDTO {
    return this.attendanceRepo.getKpiSummary(filters)
  }

  getDepartments() {
    return this.departmentRepo.findAll()
  }

  getTrends(filters: DashboardFilterOptions): AttendanceTrendPointDTO[] {
    return this.attendanceRepo.getAttendanceTrends(filters)
  }

  getDepartmentDistribution(filters: DashboardFilterOptions): DepartmentDistributionPointDTO[] {
    return this.attendanceRepo.getDepartmentDistribution(filters)
  }

  getWorkforceComposition(
    dimension: 'arrangement' | 'type',
    filters: DashboardFilterOptions
  ): WorkforceBreakdownItemDTO[] {
    return this.attendanceRepo.getWorkforceComposition(dimension, filters)
  }
}
