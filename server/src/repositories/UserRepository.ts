import { getDatabase } from '../db/database'
import type { Database } from 'better-sqlite3'
import type { UserRow, UserDTO, AppRole } from '../types'
import { getRolePermissions } from '../security/rbac'

export class UserRepository {
  private db: Database

  constructor(db?: Database) {
    this.db = db || getDatabase()
  }

  findById(id: string): UserRow | null {
    const row = this.db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined
    return row || null
  }

  findByEmail(email: string): UserRow | null {
    const row = this.db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email) as UserRow | undefined
    return row || null
  }

  findAll(params: {
    search?: string
    role?: string
    isActive?: number
    page?: number
    pageSize?: number
  } = {}): { items: UserDTO[]; total: number; page: number; pageSize: number; totalPages: number } {
    const { search, role, isActive, page = 1, pageSize = 20 } = params
    const conditions: string[] = []
    const values: any[] = []

    if (search) {
      conditions.push('(u.name LIKE ? OR u.email LIKE ?)')
      const query = `%${search.trim()}%`
      values.push(query, query)
    }

    if (role && role !== 'All') {
      conditions.push('u.role = ?')
      values.push(role)
    }

    if (isActive !== undefined) {
      conditions.push('u.is_active = ?')
      values.push(isActive)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const countQuery = `SELECT COUNT(*) as total FROM users u ${whereClause}`
    const total = (this.db.prepare(countQuery).get(...values) as { total: number }).total

    const offset = (page - 1) * pageSize
    const selectQuery = `
      SELECT u.*, d.name as department_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `
    const rows = this.db.prepare(selectQuery).all(...values, pageSize, offset) as (UserRow & { department_name?: string })[]

    const items: UserDTO[] = rows.map((r) => this.toDTO(r, r.department_name))
    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    }
  }

  create(user: {
    id: string
    employeeId?: string | null
    name: string
    email: string
    passwordHash: string
    role: AppRole
    departmentId?: number | null
    isActive?: number
    isMfaEnabled?: number
    mfaSecret?: string | null
  }): UserDTO {
    const stmt = this.db.prepare(`
      INSERT INTO users (
        id, employee_id, name, email, password_hash, role,
        department_id, is_active, failed_login_attempts, locked_until,
        is_mfa_enabled, mfa_secret
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, ?, ?)
    `)

    stmt.run(
      user.id,
      user.employeeId || null,
      user.name,
      user.email.toLowerCase(),
      user.passwordHash,
      user.role,
      user.departmentId || null,
      user.isActive ?? 1,
      user.isMfaEnabled ?? 0,
      user.mfaSecret || null
    )

    const created = this.findById(user.id)!
    return this.toDTO(created)
  }

  update(id: string, updates: Partial<{
    name: string
    role: AppRole
    departmentId: number | null
    isActive: number
    passwordHash: string
  }>): UserDTO | null {
    const fields: string[] = []
    const values: any[] = []

    if (updates.name !== undefined) {
      fields.push('name = ?')
      values.push(updates.name)
    }
    if (updates.role !== undefined) {
      fields.push('role = ?')
      values.push(updates.role)
    }
    if (updates.departmentId !== undefined) {
      fields.push('department_id = ?')
      values.push(updates.departmentId)
    }
    if (updates.isActive !== undefined) {
      fields.push('is_active = ?')
      values.push(updates.isActive)
    }
    if (updates.passwordHash !== undefined) {
      fields.push('password_hash = ?')
      values.push(updates.passwordHash)
    }

    if (fields.length === 0) {
      const existing = this.findById(id)
      return existing ? this.toDTO(existing) : null
    }

    fields.push("updated_at = datetime('now')")
    values.push(id)

    this.db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values)
    const updated = this.findById(id)
    return updated ? this.toDTO(updated) : null
  }

  recordFailedAttempt(
    id: string,
    lockThreshold: number = 5,
    lockoutMinutes: number = 15
  ): { isLocked: boolean; attempts: number; lockedUntil: string | null } {
    const user = this.findById(id)
    if (!user) return { isLocked: false, attempts: 0, lockedUntil: null }

    const newAttempts = (user.failed_login_attempts || 0) + 1
    let lockedUntil: string | null = null

    if (newAttempts >= lockThreshold) {
      // Calculate lockout time
      const lockDate = new Date(Date.now() + lockoutMinutes * 60 * 1000)
      lockedUntil = lockDate.toISOString()
      this.db
        .prepare('UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?')
        .run(newAttempts, lockedUntil, id)
      return { isLocked: true, attempts: newAttempts, lockedUntil }
    } else {
      this.db
        .prepare('UPDATE users SET failed_login_attempts = ? WHERE id = ?')
        .run(newAttempts, id)
      return { isLocked: false, attempts: newAttempts, lockedUntil: null }
    }
  }

  resetFailedAttempts(id: string): void {
    this.db
      .prepare('UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?')
      .run(id)
  }

  unlockAccount(id: string): boolean {
    const res = this.db
      .prepare('UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?')
      .run(id)
    return res.changes > 0
  }

  setMfa(id: string, enabled: boolean, secret?: string | null): boolean {
    const res = this.db
      .prepare('UPDATE users SET is_mfa_enabled = ?, mfa_secret = ? WHERE id = ?')
      .run(enabled ? 1 : 0, enabled ? secret || null : null, id)
    return res.changes > 0
  }

  saveBackupCodes(userId: string, codeHashes: string[]): void {
    const deleteStmt = this.db.prepare('DELETE FROM user_backup_codes WHERE user_id = ?')
    const insertStmt = this.db.prepare(
      'INSERT INTO user_backup_codes (user_id, code_hash, is_used) VALUES (?, ?, 0)'
    )

    this.db.transaction(() => {
      deleteStmt.run(userId)
      for (const hash of codeHashes) {
        insertStmt.run(userId, hash)
      }
    })()
  }

  getBackupCodesCount(userId: string): number {
    const res = this.db
      .prepare('SELECT COUNT(*) as count FROM user_backup_codes WHERE user_id = ? AND is_used = 0')
      .get(userId) as { count: number }
    return res?.count || 0
  }

  consumeBackupCode(userId: string, codeHashChecker: (hash: string) => boolean): boolean {
    const codes = this.db
      .prepare('SELECT id, code_hash FROM user_backup_codes WHERE user_id = ? AND is_used = 0')
      .all(userId) as { id: number; code_hash: string }[]

    for (const code of codes) {
      if (codeHashChecker(code.code_hash)) {
        this.db
          .prepare(
            "UPDATE user_backup_codes SET is_used = 1, used_at = datetime('now') WHERE id = ?"
          )
          .run(code.id)
        return true
      }
    }
    return false
  }

  toDTO(row: UserRow, departmentName?: string): UserDTO {
    const now = new Date()
    const isLocked = Boolean(row.locked_until && new Date(row.locked_until) > now)

    return {
      id: row.id,
      employeeId: row.employee_id,
      name: row.name,
      email: row.email,
      role: row.role,
      departmentId: row.department_id,
      departmentName,
      isActive: Boolean(row.is_active),
      isLocked,
      lockedUntil: row.locked_until,
      isMfaEnabled: Boolean(row.is_mfa_enabled),
      permissions: getRolePermissions(row.role),
      createdAt: row.created_at,
    }
  }
}
