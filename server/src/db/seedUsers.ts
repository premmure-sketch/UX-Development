import { getDatabase } from './database'
import type { Database } from 'better-sqlite3'
import bcrypt from 'bcryptjs'

export function seedUsers(db?: Database, force: boolean = false): void {
  const database = db || getDatabase()

  if (force) {
    console.log('[SQLite] Force reseed users requested. Clearing user auth tables...')
    database.prepare('DELETE FROM audit_logs').run()
    database.prepare('DELETE FROM user_sessions').run()
    database.prepare('DELETE FROM refresh_tokens').run()
    database.prepare('DELETE FROM user_backup_codes').run()
    database.prepare('DELETE FROM users').run()
  }

  const userCount = (
    database.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }
  ).count

  if (userCount > 0) {
    return
  }

  console.log('[SQLite] Seeding enterprise authentication and RBAC users...')

  // Get department ids if present
  const getDept = database.prepare('SELECT id FROM departments WHERE name = ?')
  const hrDept = getDept.get('Human Resources') as { id: number } | undefined
  const engDept = getDept.get('Engineering') as { id: number } | undefined

  const insertUser = database.prepare(`
    INSERT INTO users (
      id, employee_id, name, email, password_hash, role,
      department_id, is_active, failed_login_attempts, locked_until,
      is_mfa_enabled, mfa_secret
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0, NULL, 0, NULL)
  `)

  const insertAudit = database.prepare(`
    INSERT INTO audit_logs (
      user_id, user_email, action, ip_address, status, details
    ) VALUES (?, ?, ?, ?, ?, ?)
  `)

  // Pre-seed demo users for each of the 5 roles
  const usersToSeed = [
    {
      id: 'USR-ADMIN-01',
      employeeId: null,
      name: 'Dr. Alistair Vance',
      email: 'admin@stackly.com',
      password: 'Admin@123456',
      role: 'Admin',
      departmentId: null,
    },
    {
      id: 'USR-HR-01',
      employeeId: 'EMP-1005',
      name: 'Eleanor Brooks',
      email: 'hr@stackly.com',
      password: 'Hr@123456',
      role: 'HR',
      departmentId: hrDept?.id || null,
    },
    {
      id: 'USR-MGR-01',
      employeeId: 'EMP-1001',
      name: 'Sarah Jenkins',
      email: 'manager@stackly.com',
      password: 'Manager@123456',
      role: 'Manager',
      departmentId: engDept?.id || null,
    },
    {
      id: 'USR-LEAD-01',
      employeeId: 'EMP-1002',
      name: 'Marcus Chen',
      email: 'teamlead@stackly.com',
      password: 'TeamLead@123456',
      role: 'Team Lead',
      departmentId: engDept?.id || null,
    },
    {
      id: 'USR-EMP-01',
      employeeId: 'EMP-1004',
      name: 'Devon Ramirez',
      email: 'employee@stackly.com',
      password: 'Employee@123456',
      role: 'Employee',
      departmentId: engDept?.id || null,
    },
  ]

  const transaction = database.transaction(() => {
    for (const u of usersToSeed) {
      const hash = bcrypt.hashSync(u.password, 10)
      insertUser.run(u.id, u.employeeId, u.name, u.email, hash, u.role, u.departmentId)

      insertAudit.run(
        u.id,
        u.email,
        'USER_PROVISIONED',
        '127.0.0.1',
        'SUCCESS',
        JSON.stringify({ role: u.role, seededAt: new Date().toISOString() })
      )
    }

    insertAudit.run(
      'USR-ADMIN-01',
      'system@stackly.internal',
      'SYSTEM_INITIALIZED',
      '127.0.0.1',
      'SUCCESS',
      JSON.stringify({
        feature: 'Authentication & Role-Based Access Control',
        roles: ['Admin', 'HR', 'Manager', 'Team Lead', 'Employee'],
        tables: ['users', 'user_backup_codes', 'refresh_tokens', 'user_sessions', 'audit_logs'],
      })
    )
  })

  transaction()
  console.log(
    '[SQLite] Successfully seeded 5 RBAC users: Admin, HR, Manager, Team Lead, and Employee.'
  )
}
