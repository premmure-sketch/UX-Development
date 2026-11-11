import { getDatabase } from '../db/database'
import type { Database } from 'better-sqlite3'
import type { AuditLogRow, AuditLogDTO } from '../types'

export class AuditRepository {
  private db: Database

  constructor(db?: Database) {
    this.db = db || getDatabase()
  }

  log(entry: {
    userId?: string | null
    userEmail?: string | null
    action: string
    ipAddress?: string | null
    status: 'SUCCESS' | 'WARNING' | 'FAILURE'
    details?: Record<string, any> | string | null
  }): AuditLogDTO {
    const detailsStr =
      entry.details === null || entry.details === undefined
        ? null
        : typeof entry.details === 'string'
        ? entry.details
        : JSON.stringify(entry.details)

    const stmt = this.db.prepare(`
      INSERT INTO audit_logs (user_id, user_email, action, ip_address, status, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    const res = stmt.run(
      entry.userId || null,
      entry.userEmail || null,
      entry.action,
      entry.ipAddress || null,
      entry.status,
      detailsStr
    )

    const row = this.db
      .prepare('SELECT * FROM audit_logs WHERE id = ?')
      .get(Number(res.lastInsertRowid)) as AuditLogRow

    return this.toDTO(row)
  }

  findAll(params: {
    action?: string
    userEmail?: string
    status?: string
    page?: number
    pageSize?: number
  } = {}): { items: AuditLogDTO[]; total: number; page: number; pageSize: number; totalPages: number } {
    const { action, userEmail, status, page = 1, pageSize = 25 } = params
    const conditions: string[] = []
    const values: any[] = []

    if (action && action !== 'All') {
      conditions.push('action = ?')
      values.push(action)
    }

    if (userEmail) {
      conditions.push('LOWER(user_email) LIKE LOWER(?)')
      values.push(`%${userEmail.trim()}%`)
    }

    if (status && status !== 'All') {
      conditions.push('status = ?')
      values.push(status)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const countQuery = `SELECT COUNT(*) as total FROM audit_logs ${whereClause}`
    const total = (this.db.prepare(countQuery).get(...values) as { total: number }).total

    const offset = (page - 1) * pageSize
    const selectQuery = `
      SELECT * FROM audit_logs
      ${whereClause}
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `
    const rows = this.db.prepare(selectQuery).all(...values, pageSize, offset) as AuditLogRow[]

    return {
      items: rows.map((r) => this.toDTO(r)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    }
  }

  getDistinctActions(): string[] {
    const rows = this.db
      .prepare('SELECT DISTINCT action FROM audit_logs ORDER BY action ASC')
      .all() as { action: string }[]
    return rows.map((r) => r.action)
  }

  toDTO(row: AuditLogRow): AuditLogDTO {
    let parsedDetails: Record<string, any> | null = null
    if (row.details) {
      try {
        parsedDetails = JSON.parse(row.details)
      } catch {
        parsedDetails = { raw: row.details }
      }
    }

    return {
      id: row.id,
      userId: row.user_id,
      userEmail: row.user_email,
      action: row.action,
      ipAddress: row.ip_address,
      status: row.status,
      details: parsedDetails,
      createdAt: row.created_at,
    }
  }
}
