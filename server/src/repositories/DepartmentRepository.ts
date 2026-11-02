import { getDatabase } from '../db/database'
import type { Database } from 'better-sqlite3'
import type { DepartmentRow } from '../types'

export interface IDepartmentRepository {
  findAll(): DepartmentRow[]
  findById(id: number): DepartmentRow | null
  findByName(name: string): DepartmentRow | null
}

export class DepartmentRepository implements IDepartmentRepository {
  private db: Database

  constructor(db?: Database) {
    this.db = db || getDatabase()
  }

  findAll(): DepartmentRow[] {
    const stmt = this.db.prepare(`
      SELECT id, name, code, color, budget, created_at
      FROM departments
      ORDER BY name ASC
    `)
    return stmt.all() as DepartmentRow[]
  }

  findById(id: number): DepartmentRow | null {
    const stmt = this.db.prepare(`
      SELECT id, name, code, color, budget, created_at
      FROM departments
      WHERE id = ?
    `)
    const row = stmt.get(id) as DepartmentRow | undefined
    return row || null
  }

  findByName(name: string): DepartmentRow | null {
    const stmt = this.db.prepare(`
      SELECT id, name, code, color, budget, created_at
      FROM departments
      WHERE name = ?
    `)
    const row = stmt.get(name) as DepartmentRow | undefined
    return row || null
  }
}
