import { getDatabase } from '../db/database'
import type { Database } from 'better-sqlite3'
import type { RefreshTokenRow } from '../types'

export class RefreshTokenRepository {
  private db: Database

  constructor(db?: Database) {
    this.db = db || getDatabase()
  }

  create(data: {
    userId: string
    token: string
    familyId: string
    expiresAt: string
  }): RefreshTokenRow {
    const stmt = this.db.prepare(`
      INSERT INTO refresh_tokens (user_id, token, family_id, is_revoked, expires_at)
      VALUES (?, ?, ?, 0, ?)
    `)
    const res = stmt.run(data.userId, data.token, data.familyId, data.expiresAt)
    return this.findById(Number(res.lastInsertRowid))!
  }

  findById(id: number): RefreshTokenRow | null {
    const row = this.db.prepare('SELECT * FROM refresh_tokens WHERE id = ?').get(id) as RefreshTokenRow | undefined
    return row || null
  }

  findByToken(token: string): RefreshTokenRow | null {
    const row = this.db.prepare('SELECT * FROM refresh_tokens WHERE token = ?').get(token) as RefreshTokenRow | undefined
    return row || null
  }

  revoke(token: string, replacedByToken?: string): boolean {
    const res = this.db
      .prepare('UPDATE refresh_tokens SET is_revoked = 1, replaced_by_token = ? WHERE token = ?')
      .run(replacedByToken || null, token)
    return res.changes > 0
  }

  revokeFamily(familyId: string): number {
    const res = this.db
      .prepare('UPDATE refresh_tokens SET is_revoked = 1 WHERE family_id = ? AND is_revoked = 0')
      .run(familyId)
    return res.changes
  }

  revokeAllForUser(userId: string): number {
    const res = this.db
      .prepare('UPDATE refresh_tokens SET is_revoked = 1 WHERE user_id = ? AND is_revoked = 0')
      .run(userId)
    return res.changes
  }

  cleanExpired(): number {
    const res = this.db
      .prepare("DELETE FROM refresh_tokens WHERE expires_at < datetime('now')")
      .run()
    return res.changes
  }
}
