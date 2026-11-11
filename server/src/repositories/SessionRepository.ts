import { getDatabase } from '../db/database'
import type { Database } from 'better-sqlite3'
import type { UserSessionRow, UserSessionDTO } from '../types'

export class SessionRepository {
  private db: Database

  constructor(db?: Database) {
    this.db = db || getDatabase()
  }

  create(data: {
    id: string
    userId: string
    ipAddress?: string | null
    userAgent?: string | null
    deviceInfo?: string | null
  }): UserSessionRow {
    const stmt = this.db.prepare(`
      INSERT INTO user_sessions (id, user_id, ip_address, user_agent, device_info, is_active)
      VALUES (?, ?, ?, ?, ?, 1)
    `)
    stmt.run(
      data.id,
      data.userId,
      data.ipAddress || null,
      data.userAgent || null,
      data.deviceInfo || null
    )
    return this.findById(data.id)!
  }

  findById(id: string): UserSessionRow | null {
    const row = this.db.prepare('SELECT * FROM user_sessions WHERE id = ?').get(id) as UserSessionRow | undefined
    return row || null
  }

  findByUserId(userId: string, currentSessionId?: string): UserSessionDTO[] {
    const rows = this.db
      .prepare('SELECT * FROM user_sessions WHERE user_id = ? AND is_active = 1 ORDER BY last_active_at DESC')
      .all(userId) as UserSessionRow[]

    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      ipAddress: r.ip_address,
      userAgent: r.user_agent,
      deviceInfo: r.device_info,
      isActive: Boolean(r.is_active),
      isCurrent: r.id === currentSessionId,
      lastActiveAt: r.last_active_at,
      createdAt: r.created_at,
    }))
  }

  updateActivity(id: string): void {
    this.db
      .prepare("UPDATE user_sessions SET last_active_at = datetime('now') WHERE id = ?")
      .run(id)
  }

  revoke(id: string): boolean {
    const res = this.db
      .prepare('UPDATE user_sessions SET is_active = 0 WHERE id = ?')
      .run(id)
    return res.changes > 0
  }

  revokeAllForUser(userId: string, exceptSessionId?: string): number {
    if (exceptSessionId) {
      const res = this.db
        .prepare('UPDATE user_sessions SET is_active = 0 WHERE user_id = ? AND id != ? AND is_active = 1')
        .run(userId, exceptSessionId)
      return res.changes
    } else {
      const res = this.db
        .prepare('UPDATE user_sessions SET is_active = 0 WHERE user_id = ? AND is_active = 1')
        .run(userId)
      return res.changes
    }
  }
}
