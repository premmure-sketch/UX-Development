import { getDatabase } from '../db/database'
import type { Database } from 'better-sqlite3'
import type { LocationRow } from '../types'

export interface ILocationRepository {
  findAll(): LocationRow[]
  findById(id: number): LocationRow | null
  findByName(name: string): LocationRow | null
}

export class LocationRepository implements ILocationRepository {
  private db: Database

  constructor(db?: Database) {
    this.db = db || getDatabase()
  }

  findAll(): LocationRow[] {
    const stmt = this.db.prepare(`
      SELECT id, name, city, country, timezone
      FROM locations
      ORDER BY name ASC
    `)
    return stmt.all() as LocationRow[]
  }

  findById(id: number): LocationRow | null {
    const stmt = this.db.prepare(`
      SELECT id, name, city, country, timezone
      FROM locations
      WHERE id = ?
    `)
    const row = stmt.get(id) as LocationRow | undefined
    return row || null
  }

  findByName(name: string): LocationRow | null {
    const stmt = this.db.prepare(`
      SELECT id, name, city, country, timezone
      FROM locations
      WHERE name = ?
    `)
    const row = stmt.get(name) as LocationRow | undefined
    return row || null
  }
}
