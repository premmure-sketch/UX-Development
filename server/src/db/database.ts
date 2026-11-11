import Database, { type Database as DatabaseType } from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DB_DIR = path.resolve(__dirname, '../../data')
const DB_PATH = path.join(DB_DIR, 'workforce.db')

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true })
}

let dbInstance: DatabaseType | null = null

export function getDatabase(): DatabaseType {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH)
    // Optimize performance and enforce integrity
    dbInstance.pragma('journal_mode = WAL')
    dbInstance.pragma('foreign_keys = ON')
    dbInstance.pragma('synchronous = NORMAL')
    initDatabaseSchema(dbInstance)
  }
  return dbInstance
}

export function initDatabaseSchema(db: DatabaseType): void {
  // 1. Departments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      code TEXT NOT NULL,
      color TEXT NOT NULL,
      budget REAL DEFAULT 0.0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // 2. Locations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      city TEXT NOT NULL,
      country TEXT NOT NULL,
      timezone TEXT NOT NULL
    );
  `)

  // 3. Employees table
  db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      role TEXT NOT NULL,
      department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
      location_id INTEGER NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
      work_type TEXT NOT NULL CHECK(work_type IN ('Full-time', 'Contract', 'Part-time', 'Intern')),
      work_arrangement TEXT NOT NULL CHECK(work_arrangement IN ('In-Office', 'Hybrid', 'Remote')),
      attendance_score REAL DEFAULT 95.0,
      avatar_url TEXT,
      hire_date TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_employees_dept ON employees(department_id);
    CREATE INDEX IF NOT EXISTS idx_employees_loc ON employees(location_id);
    CREATE INDEX IF NOT EXISTS idx_employees_active ON employees(is_active);
  `)

  // 4. Attendance Records table
  db.exec(`
    CREATE TABLE IF NOT EXISTS attendance_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('Present', 'Late', 'Remote', 'On Leave', 'Absent')),
      check_in_time TEXT,
      check_out_time TEXT,
      check_in_location TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(employee_id, date)
    );

    CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(date);
    CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance_records(status);
    CREATE INDEX IF NOT EXISTS idx_attendance_emp_date ON attendance_records(employee_id, date);
  `)

  // 5. Users table (Authentication & RBAC)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      employee_id TEXT REFERENCES employees(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('Admin', 'HR', 'Manager', 'Team Lead', 'Employee')),
      department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
      is_active INTEGER DEFAULT 1,
      failed_login_attempts INTEGER DEFAULT 0,
      locked_until TEXT DEFAULT NULL,
      is_mfa_enabled INTEGER DEFAULT 0,
      mfa_secret TEXT DEFAULT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
  `)

  // 6. User Backup Codes table (MFA Emergency Recovery)
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_backup_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      code_hash TEXT NOT NULL,
      is_used INTEGER DEFAULT 0,
      used_at TEXT DEFAULT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_backup_codes_user ON user_backup_codes(user_id);
  `)

  // 7. Refresh Tokens table (Token Rotation & Family Reuse Detection)
  db.exec(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE,
      family_id TEXT NOT NULL,
      is_revoked INTEGER DEFAULT 0,
      replaced_by_token TEXT DEFAULT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_family ON refresh_tokens(family_id);
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
  `)

  // 8. User Sessions table (Session Management & Revocation)
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      ip_address TEXT,
      user_agent TEXT,
      device_info TEXT,
      is_active INTEGER DEFAULT 1,
      last_active_at TEXT DEFAULT CURRENT_TIMESTAMP,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_active ON user_sessions(is_active);
  `)

  // 9. Audit Logs table (Security Auditing & Compliance)
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      user_email TEXT,
      action TEXT NOT NULL,
      ip_address TEXT,
      status TEXT NOT NULL CHECK(status IN ('SUCCESS', 'WARNING', 'FAILURE')),
      details TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
  `)
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}
