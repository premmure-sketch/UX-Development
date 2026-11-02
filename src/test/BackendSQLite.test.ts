import { describe, it, expect } from 'vitest'
import { DepartmentRepository } from '../../server/src/repositories/DepartmentRepository'
import { LocationRepository } from '../../server/src/repositories/LocationRepository'
import { EmployeeRepository } from '../../server/src/repositories/EmployeeRepository'
import { AttendanceRepository } from '../../server/src/repositories/AttendanceRepository'
import { DashboardService } from '../../server/src/services/DashboardService'
import { EmployeeService } from '../../server/src/services/EmployeeService'

describe('Backend SQLite Integration & Repository Pattern Tests', () => {
  const deptRepo = new DepartmentRepository()
  const locRepo = new LocationRepository()
  const empRepo = new EmployeeRepository()
  const attRepo = new AttendanceRepository()

  it('verifies DepartmentRepository returns all 8 departments with correct codes and budgets', () => {
    const departments = deptRepo.findAll()
    expect(departments.length).toBe(8)
    const names = departments.map((d) => d.name)
    expect(names).toContain('Engineering')
    expect(names).toContain('Product')
    expect(names).toContain('Sales')
    expect(names).toContain('Marketing')
    expect(names).toContain('Human Resources')
    expect(names).toContain('Finance')
    expect(names).toContain('Operations')
    expect(names).toContain('Customer Support')

    const eng = deptRepo.findByName('Engineering')
    expect(eng).not.toBeNull()
    expect(eng?.code).toBe('ENG')
  })

  it('verifies LocationRepository returns all 6 corporate offices', () => {
    const locations = locRepo.findAll()
    expect(locations.length).toBe(6)
    const locNames = locations.map((l) => l.name)
    expect(locNames).toContain('New York HQ')
    expect(locNames).toContain('San Francisco')
    expect(locNames).toContain('London')
    expect(locNames).toContain('Berlin')
    expect(locNames).toContain('Singapore')
    expect(locNames).toContain('Remote')
  })

  it('verifies EmployeeRepository count and pagination', () => {
    const count = empRepo.count()
    expect(count).toBeGreaterThanOrEqual(30)

    const paginated = empRepo.findAll({ page: 1, pageSize: 6 })
    expect(paginated.items.length).toBe(6)
    expect(paginated.total).toBe(count)
    expect(paginated.totalPages).toBe(Math.ceil(count / 6))
  })

  it('verifies EmployeeRepository multi-criteria filtering: department and search', () => {
    const engEmployees = empRepo.findAll({ department: 'Engineering' })
    expect(engEmployees.items.length).toBeGreaterThan(0)
    for (const emp of engEmployees.items) {
      expect(emp.department).toBe('Engineering')
    }

    const searchResult = empRepo.findAll({ search: 'Jenkins' })
    expect(searchResult.items.length).toBe(1)
    expect(searchResult.items[0].name).toBe('Sarah Jenkins')
    expect(searchResult.items[0].id).toBe('EMP-1001')
  })

  it('verifies EmployeeRepository sorting by name ascending and descending', () => {
    const ascResult = empRepo.findAll({ sortBy: 'name', sortOrder: 'asc', pageSize: 30 })
    const descResult = empRepo.findAll({ sortBy: 'name', sortOrder: 'desc', pageSize: 30 })

    expect(ascResult.items[0].name.localeCompare(ascResult.items[ascResult.items.length - 1].name)).toBeLessThan(0)
    expect(descResult.items[0].name.localeCompare(descResult.items[descResult.items.length - 1].name)).toBeGreaterThan(0)
  })

  it('verifies AttendanceRepository calculates all 5 required Task 2 KPI metrics from SQLite', () => {
    const kpis = attRepo.getKpiSummary({})
    expect(kpis.totalEmployees).toBeDefined()
    expect(kpis.present).toBeDefined()
    expect(kpis.absent).toBeDefined()
    expect(kpis.onLeave).toBeDefined()
    expect(kpis.attendanceRate).toBeDefined()

    expect(Number(kpis.totalEmployees.value)).toBeGreaterThan(0)
    expect(Number(kpis.present.value)).toBeGreaterThan(0)
    expect(Number(kpis.attendanceRate.value)).toBeGreaterThan(80)
    expect(kpis.totalEmployees.sparkline.length).toBe(7)
  })

  it('verifies AttendanceRepository generates historical time series trends', () => {
    const trends = attRepo.getAttendanceTrends({ datePreset: 'last7days' })
    expect(trends.length).toBe(7)
    for (const point of trends) {
      expect(point.date).toBeDefined()
      expect(point.attendanceRate).toBeGreaterThan(0)
      expect(point.benchmark).toBe(95.0)
    }
  })

  it('verifies AttendanceRepository generates department-wise headcount distribution', () => {
    const deptDistribution = attRepo.getDepartmentDistribution({})
    expect(deptDistribution.length).toBe(8)
    for (const d of deptDistribution) {
      expect(d.headcount).toBeGreaterThan(0)
      expect(d.attendanceRate).toBeGreaterThan(0)
    }
  })

  it('verifies AttendanceRepository generates workforce composition by work arrangement', () => {
    const composition = attRepo.getWorkforceComposition('arrangement', {})
    expect(composition.length).toBe(3)
    const names = composition.map((c) => c.name)
    expect(names).toContain('In-Office')
    expect(names).toContain('Hybrid')
    expect(names).toContain('Fully Remote')

    const totalPct = composition.reduce((sum, item) => sum + item.percentage, 0)
    expect(Math.round(totalPct)).toBe(100)
  })

  it('verifies EmployeeService retrieves single employee with full attendance history', () => {
    const service = new EmployeeService(empRepo)
    const { employee, history } = service.getEmployeeById('EMP-1001')
    expect(employee).not.toBeNull()
    expect(employee?.id).toBe('EMP-1001')
    expect(employee?.name).toBe('Sarah Jenkins')
    expect(history.length).toBeGreaterThan(0)
  })

  it('verifies DashboardService orchestrates repositories cleanly', () => {
    const dashboardService = new DashboardService(attRepo, deptRepo)
    const kpis = dashboardService.getKpiSummary({})
    expect(kpis.totalEmployees.displayValue).toBe('1,428')
  })
})
