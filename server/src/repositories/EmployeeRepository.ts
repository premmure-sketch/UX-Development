import { getDatabase } from '../db/database'
import type { Database } from 'better-sqlite3'
import type {
  EmployeeDetailsDTO,
  EmployeeFilterOptions,
  PaginatedResult,
} from '../types'

export interface IEmployeeRepository {
  findAll(options?: EmployeeFilterOptions): PaginatedResult<EmployeeDetailsDTO>
  findById(id: string, date?: string): EmployeeDetailsDTO | null
  getAttendanceHistory(id: string, limit?: number): any[]
  updateTodayAttendance(id: string, date: string, status: string, checkInTime?: string, notes?: string): boolean
  count(): number
}

export class EmployeeRepository implements IEmployeeRepository {
  private db: Database

  constructor(db?: Database) {
    this.db = db || getDatabase()
  }

  count(): number {
    const row = this.db.prepare('SELECT COUNT(*) as count FROM employees WHERE is_active = 1').get() as { count: number }
    return row.count
  }

  findAll(options: EmployeeFilterOptions = {}): PaginatedResult<EmployeeDetailsDTO> {
    const {
      search = '',
      department = 'All',
      location = 'All',
      status = 'All',
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      pageSize = 10,
      date = '2026-11-02',
    } = options

    const conditions: string[] = ['e.is_active = 1']
    const params: any[] = [date]

    if (search && search.trim()) {
      const q = `%${search.trim().toLowerCase()}%`
      conditions.push(`(
        LOWER(e.first_name || ' ' || e.last_name) LIKE ? OR
        LOWER(e.email) LIKE ? OR
        LOWER(e.role) LIKE ? OR
        LOWER(e.id) LIKE ? OR
        LOWER(d.name) LIKE ? OR
        LOWER(l.name) LIKE ?
      )`)
      params.push(q, q, q, q, q, q)
    }

    if (department && department !== 'All') {
      conditions.push('d.name = ?')
      params.push(department)
    }

    if (location && location !== 'All') {
      conditions.push('l.name = ?')
      params.push(location)
    }

    if (status && status !== 'All') {
      conditions.push('COALESCE(a.status, "Absent") = ?')
      params.push(status)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // Count total query
    const countSql = `
      SELECT COUNT(*) as total
      FROM employees e
      INNER JOIN departments d ON e.department_id = d.id
      INNER JOIN locations l ON e.location_id = l.id
      LEFT JOIN attendance_records a ON e.id = a.employee_id AND a.date = ?
      ${whereClause}
    `
    const totalRow = this.db.prepare(countSql).get(...params) as { total: number }
    const total = totalRow.total

    // Sort column mapping to prevent SQL injection
    let orderColumn = 'name'
    switch (sortBy) {
      case 'name':
        orderColumn = 'e.first_name ' + (sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC') + ', e.last_name'
        break
      case 'department':
        orderColumn = 'd.name'
        break
      case 'location':
        orderColumn = 'l.name'
        break
      case 'status':
        orderColumn = 'COALESCE(a.status, "Absent")'
        break
      case 'checkInTime':
        orderColumn = 'a.check_in_time'
        break
      case 'attendanceScore':
        orderColumn = 'e.attendance_score'
        break
      default:
        orderColumn = 'e.first_name ASC, e.last_name ASC'
    }

    const direction = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'
    const orderBy = sortBy === 'name' ? orderColumn : `${orderColumn} ${direction}`

    // Pagination bounds
    const safePageSize = Math.max(1, Math.min(100, Number(pageSize)))
    const safePage = Math.max(1, Number(page))
    const offset = (safePage - 1) * safePageSize

    const selectSql = `
      SELECT
        e.id,
        e.first_name AS firstName,
        e.last_name AS lastName,
        (e.first_name || ' ' || e.last_name) AS name,
        e.email,
        e.phone,
        e.role,
        d.id AS departmentId,
        d.name AS department,
        d.color AS departmentColor,
        l.id AS locationId,
        l.name AS location,
        e.work_type AS workType,
        e.work_arrangement AS workArrangement,
        COALESCE(a.status, 'Absent') AS status,
        a.check_in_time AS checkInTime,
        a.check_out_time AS checkOutTime,
        COALESCE(a.check_in_location, l.name) AS checkInLocation,
        a.notes AS leaveReason,
        e.attendance_score AS attendanceScore,
        e.avatar_url AS avatarUrl,
        e.hire_date AS hireDate,
        CASE
          WHEN a.check_in_time IS NOT NULL THEN 'Active today (' || a.check_in_time || ')'
          ELSE 'Not checked in'
        END AS lastActive
      FROM employees e
      INNER JOIN departments d ON e.department_id = d.id
      INNER JOIN locations l ON e.location_id = l.id
      LEFT JOIN attendance_records a ON e.id = a.employee_id AND a.date = ?
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `

    const rows = this.db.prepare(selectSql).all(...params, safePageSize, offset) as EmployeeDetailsDTO[]

    return {
      items: rows,
      total,
      page: safePage,
      pageSize: safePageSize,
      totalPages: Math.ceil(total / safePageSize) || 1,
    }
  }

  findById(id: string, date: string = '2026-11-02'): EmployeeDetailsDTO | null {
    const stmt = this.db.prepare(`
      SELECT
        e.id,
        e.first_name AS firstName,
        e.last_name AS lastName,
        (e.first_name || ' ' || e.last_name) AS name,
        e.email,
        e.phone,
        e.role,
        d.id AS departmentId,
        d.name AS department,
        d.color AS departmentColor,
        l.id AS locationId,
        l.name AS location,
        e.work_type AS workType,
        e.work_arrangement AS workArrangement,
        COALESCE(a.status, 'Absent') AS status,
        a.check_in_time AS checkInTime,
        a.check_out_time AS checkOutTime,
        COALESCE(a.check_in_location, l.name) AS checkInLocation,
        a.notes AS leaveReason,
        e.attendance_score AS attendanceScore,
        e.avatar_url AS avatarUrl,
        e.hire_date AS hireDate,
        CASE
          WHEN a.check_in_time IS NOT NULL THEN 'Active today'
          ELSE 'Not checked in'
        END AS lastActive
      FROM employees e
      INNER JOIN departments d ON e.department_id = d.id
      INNER JOIN locations l ON e.location_id = l.id
      LEFT JOIN attendance_records a ON e.id = a.employee_id AND a.date = ?
      WHERE e.id = ? AND e.is_active = 1
    `)

    const row = stmt.get(date, id) as EmployeeDetailsDTO | undefined
    return row || null
  }

  getAttendanceHistory(id: string, limit: number = 30): any[] {
    const stmt = this.db.prepare(`
      SELECT date, status, check_in_time, check_out_time, check_in_location, notes
      FROM attendance_records
      WHERE employee_id = ?
      ORDER BY date DESC
      LIMIT ?
    `)
    return stmt.all(id, limit)
  }

  updateTodayAttendance(id: string, date: string, status: string, checkInTime?: string, notes?: string): boolean {
    const stmt = this.db.prepare(`
      INSERT INTO attendance_records (employee_id, date, status, check_in_time, check_in_location, notes)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(employee_id, date) DO UPDATE SET
        status = excluded.status,
        check_in_time = excluded.check_in_time,
        notes = excluded.notes
    `)
    const result = stmt.run(id, date, status, checkInTime || null, 'Manual Portal Update', notes || null)
    return result.changes > 0
  }
}
