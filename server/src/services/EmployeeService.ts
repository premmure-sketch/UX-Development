import { EmployeeRepository, type IEmployeeRepository } from '../repositories/EmployeeRepository'
import type {
  EmployeeFilterOptions,
  EmployeeDetailsDTO,
  PaginatedResult,
} from '../types'

export class EmployeeService {
  private employeeRepo: IEmployeeRepository

  constructor(employeeRepo?: IEmployeeRepository) {
    this.employeeRepo = employeeRepo || new EmployeeRepository()
  }

  getEmployees(options: EmployeeFilterOptions): PaginatedResult<EmployeeDetailsDTO> {
    return this.employeeRepo.findAll(options)
  }

  getEmployeeById(id: string, date?: string): { employee: EmployeeDetailsDTO | null; history: any[] } {
    const employee = this.employeeRepo.findById(id, date)
    const history = employee ? this.employeeRepo.getAttendanceHistory(id, 14) : []
    return { employee, history }
  }

  updateAttendance(id: string, date: string, status: string, checkInTime?: string, notes?: string): boolean {
    return this.employeeRepo.updateTodayAttendance(id, date, status, checkInTime, notes)
  }
}
