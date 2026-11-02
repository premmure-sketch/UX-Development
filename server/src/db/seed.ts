import { getDatabase } from './database'
import type { Database } from 'better-sqlite3'

export function seedDatabase(db?: Database): void {
  const database = db || getDatabase()

  // Check if already seeded
  const employeeCount = (database.prepare('SELECT COUNT(*) as count FROM employees').get() as { count: number }).count
  if (employeeCount > 0) {
    console.log(`[SQLite] Database already contains ${employeeCount} employees. Skipping seed.`)
    return
  }

  console.log('[SQLite] Seeding workforce database with initial enterprise telemetry...')

  const insertDept = database.prepare(`
    INSERT INTO departments (name, code, color, budget) VALUES (?, ?, ?, ?)
  `)
  const insertLoc = database.prepare(`
    INSERT INTO locations (name, city, country, timezone) VALUES (?, ?, ?, ?)
  `)
  const insertEmp = database.prepare(`
    INSERT INTO employees (
      id, first_name, last_name, email, phone, role,
      department_id, location_id, work_type, work_arrangement,
      attendance_score, avatar_url, hire_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const insertAttendance = database.prepare(`
    INSERT INTO attendance_records (
      employee_id, date, status, check_in_time, check_out_time, check_in_location, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  const transaction = database.transaction(() => {
    // 1. Departments
    const depts = [
      { name: 'Engineering', code: 'ENG', color: '#6366f1', budget: 1450000 },
      { name: 'Product', code: 'PROD', color: '#8b5cf6', budget: 950000 },
      { name: 'Sales', code: 'SALES', color: '#06b6d4', budget: 1200000 },
      { name: 'Marketing', code: 'MKTG', color: '#ec4899', budget: 850000 },
      { name: 'Human Resources', code: 'HR', color: '#f59e0b', budget: 550000 },
      { name: 'Finance', code: 'FIN', color: '#10b981', budget: 750000 },
      { name: 'Operations', code: 'OPS', color: '#3b82f6', budget: 680000 },
      { name: 'Customer Support', code: 'SUPP', color: '#14b8a6', budget: 520000 },
    ]

    const deptMap = new Map<string, number>()
    for (const d of depts) {
      const res = insertDept.run(d.name, d.code, d.color, d.budget)
      deptMap.set(d.name, Number(res.lastInsertRowid))
    }

    // 2. Locations
    const locs = [
      { name: 'New York HQ', city: 'New York', country: 'United States', timezone: 'EST' },
      { name: 'San Francisco', city: 'San Francisco', country: 'United States', timezone: 'PST' },
      { name: 'London', city: 'London', country: 'United Kingdom', timezone: 'GMT' },
      { name: 'Berlin', city: 'Berlin', country: 'Germany', timezone: 'CET' },
      { name: 'Singapore', city: 'Singapore', country: 'Singapore', timezone: 'SGT' },
      { name: 'Remote', city: 'Global / Decentralized', country: 'Remote', timezone: 'UTC' },
    ]

    const locMap = new Map<string, number>()
    for (const l of locs) {
      const res = insertLoc.run(l.name, l.city, l.country, l.timezone)
      locMap.set(l.name, Number(res.lastInsertRowid))
    }

    // 3. Employees
    const employeesList = [
      {
        id: 'EMP-1001',
        firstName: 'Sarah',
        lastName: 'Jenkins',
        email: 'sarah.jenkins@pulsework.io',
        phone: '+1 (415) 892-1049',
        role: 'VP of Engineering',
        dept: 'Engineering',
        loc: 'San Francisco',
        workType: 'Full-time',
        arrangement: 'Hybrid',
        score: 99.2,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
        hireDate: '2022-03-15',
        todayStatus: 'Present',
        todayCheckIn: '08:42 AM',
        todayLocation: 'SF Building A - 4th Fl',
        todayNotes: 'On schedule',
      },
      {
        id: 'EMP-1002',
        firstName: 'Marcus',
        lastName: 'Chen',
        email: 'marcus.chen@pulsework.io',
        phone: '+1 (415) 892-1102',
        role: 'Principal Cloud Architect',
        dept: 'Engineering',
        loc: 'San Francisco',
        workType: 'Full-time',
        arrangement: 'In-Office',
        score: 98.4,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        hireDate: '2021-06-01',
        todayStatus: 'Present',
        todayCheckIn: '08:55 AM',
        todayLocation: 'SF Building A - 4th Fl',
        todayNotes: 'On schedule',
      },
      {
        id: 'EMP-1003',
        firstName: 'Elena',
        lastName: 'Rostova',
        email: 'elena.rostova@pulsework.io',
        phone: '+44 20 7946 0912',
        role: 'Staff Product Designer',
        dept: 'Product',
        loc: 'London',
        workType: 'Full-time',
        arrangement: 'Hybrid',
        score: 96.8,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        hireDate: '2023-01-10',
        todayStatus: 'Present',
        todayCheckIn: '09:04 AM',
        todayLocation: 'London Tech Hub - Desks',
        todayNotes: 'Sprint design review',
      },
      {
        id: 'EMP-1004',
        firstName: 'David',
        lastName: "O'Connor",
        email: 'david.oconnor@pulsework.io',
        phone: '+1 (312) 555-0199',
        role: 'Senior DevOps Engineer',
        dept: 'Engineering',
        loc: 'Remote',
        workType: 'Full-time',
        arrangement: 'Remote',
        score: 97.5,
        hireDate: '2022-08-20',
        todayStatus: 'Remote',
        todayCheckIn: '08:30 AM',
        todayLocation: 'Home Office - VPN Chicago',
        todayNotes: 'Cloud cluster migration',
      },
      {
        id: 'EMP-1005',
        firstName: 'Amara',
        lastName: 'Okafor',
        email: 'amara.okafor@pulsework.io',
        phone: '+1 (212) 555-0143',
        role: 'Director of Talent Acquisition',
        dept: 'Human Resources',
        loc: 'New York HQ',
        workType: 'Full-time',
        arrangement: 'In-Office',
        score: 99.0,
        hireDate: '2020-11-12',
        todayStatus: 'Present',
        todayCheckIn: '08:48 AM',
        todayLocation: 'NYC HQ - 18th Floor',
        todayNotes: 'Executive interview day',
      },
      {
        id: 'EMP-1006',
        firstName: 'Liam',
        lastName: 'Gallagher',
        email: 'liam.gallagher@pulsework.io',
        phone: '+1 (212) 555-0177',
        role: 'Enterprise Account Executive',
        dept: 'Sales',
        loc: 'New York HQ',
        workType: 'Full-time',
        arrangement: 'Hybrid',
        score: 88.5,
        hireDate: '2023-04-05',
        todayStatus: 'Late',
        todayCheckIn: '09:47 AM',
        todayLocation: 'NYC HQ - Lobby Kiosk',
        todayNotes: 'Subway delay line 4/5',
      },
      {
        id: 'EMP-1007',
        firstName: 'Priya',
        lastName: 'Sharma',
        email: 'priya.sharma@pulsework.io',
        phone: '+65 6789 0123',
        role: 'Lead Data Scientist',
        dept: 'Engineering',
        loc: 'Singapore',
        workType: 'Full-time',
        arrangement: 'Hybrid',
        score: 98.9,
        hireDate: '2021-09-18',
        todayStatus: 'Present',
        todayCheckIn: '08:50 AM',
        todayLocation: 'Singapore Marina Bay Hub',
        todayNotes: 'Predictive model tuning',
      },
      {
        id: 'EMP-1008',
        firstName: 'Lucas',
        lastName: 'Mueller',
        email: 'lucas.mueller@pulsework.io',
        phone: '+49 30 1234567',
        role: 'Product Operations Manager',
        dept: 'Product',
        loc: 'Berlin',
        workType: 'Full-time',
        arrangement: 'In-Office',
        score: 96.0,
        hireDate: '2022-02-14',
        todayStatus: 'Present',
        todayCheckIn: '08:58 AM',
        todayLocation: 'Berlin Mitte Office',
        todayNotes: 'Roadmap sync with EU teams',
      },
      {
        id: 'EMP-1009',
        firstName: 'Chloe',
        lastName: 'Bennett',
        email: 'chloe.bennett@pulsework.io',
        phone: '+44 20 7946 0881',
        role: 'Content Strategy Lead',
        dept: 'Marketing',
        loc: 'London',
        workType: 'Full-time',
        arrangement: 'Remote',
        score: 95.4,
        hireDate: '2023-07-01',
        todayStatus: 'Remote',
        todayCheckIn: '08:52 AM',
        todayLocation: 'Home Office - London North',
        todayNotes: 'Annual brand narrative campaign',
      },
      {
        id: 'EMP-1010',
        firstName: 'Mateo',
        lastName: 'Hernandez',
        email: 'mateo.hernandez@pulsework.io',
        phone: '+1 (212) 555-0188',
        role: 'Senior Financial Analyst',
        dept: 'Finance',
        loc: 'New York HQ',
        workType: 'Full-time',
        arrangement: 'In-Office',
        score: 99.5,
        hireDate: '2021-01-25',
        todayStatus: 'Present',
        todayCheckIn: '08:35 AM',
        todayLocation: 'NYC HQ - 16th Floor',
        todayNotes: 'Quarterly financial forecast review',
      },
      {
        id: 'EMP-1011',
        firstName: 'Kavita',
        lastName: 'Patel',
        email: 'kavita.patel@pulsework.io',
        phone: '+1 (415) 892-1204',
        role: 'Full Stack Engineer',
        dept: 'Engineering',
        loc: 'San Francisco',
        workType: 'Full-time',
        arrangement: 'Hybrid',
        score: 94.0,
        hireDate: '2023-05-10',
        todayStatus: 'On Leave',
        todayCheckIn: null,
        todayLocation: 'N/A',
        todayNotes: 'Approved Vacation (Paid Time Off)',
      },
      {
        id: 'EMP-1012',
        firstName: 'Tariq',
        lastName: 'Al-Mansoor',
        email: 'tariq.almansoor@pulsework.io',
        phone: '+44 20 7946 0773',
        role: 'Security & Compliance Analyst',
        dept: 'Operations',
        loc: 'London',
        workType: 'Full-time',
        arrangement: 'In-Office',
        score: 89.1,
        hireDate: '2022-10-01',
        todayStatus: 'Late',
        todayCheckIn: '09:34 AM',
        todayLocation: 'London Tech Hub - SecDesk',
        todayNotes: 'Security badge terminal refresh',
      },
      {
        id: 'EMP-1013',
        firstName: 'Jessica',
        lastName: 'Vance',
        email: 'jessica.vance@pulsework.io',
        phone: '+1 (512) 555-0122',
        role: 'Customer Support Lead',
        dept: 'Customer Support',
        loc: 'Remote',
        workType: 'Full-time',
        arrangement: 'Remote',
        score: 98.7,
        hireDate: '2021-08-15',
        todayStatus: 'Remote',
        todayCheckIn: '07:55 AM',
        todayLocation: 'Home Office - Austin',
        todayNotes: 'Early queue coverage',
      },
      {
        id: 'EMP-1014',
        firstName: 'Benjamin',
        lastName: 'Ross',
        email: 'benjamin.ross@pulsework.io',
        phone: '+1 (212) 555-0164',
        role: 'Growth Marketing Specialist',
        dept: 'Marketing',
        loc: 'New York HQ',
        workType: 'Full-time',
        arrangement: 'Hybrid',
        score: 96.2,
        hireDate: '2022-11-20',
        todayStatus: 'Present',
        todayCheckIn: '08:59 AM',
        todayLocation: 'NYC HQ - 17th Floor',
        todayNotes: 'Paid campaign AB experiment launch',
      },
      {
        id: 'EMP-1015',
        firstName: 'Hannah',
        lastName: 'Weber',
        email: 'hannah.weber@pulsework.io',
        phone: '+49 30 7891234',
        role: 'HR People Partner',
        dept: 'Human Resources',
        loc: 'Berlin',
        workType: 'Full-time',
        arrangement: 'In-Office',
        score: 97.8,
        hireDate: '2023-03-01',
        todayStatus: 'Present',
        todayCheckIn: '08:44 AM',
        todayLocation: 'Berlin Mitte Office',
        todayNotes: 'German works council sync',
      },
      {
        id: 'EMP-1016',
        firstName: 'Vikram',
        lastName: 'Singh',
        email: 'vikram.singh@pulsework.io',
        phone: '+1 (415) 892-1345',
        role: 'Senior React Developer',
        dept: 'Engineering',
        loc: 'San Francisco',
        workType: 'Contract',
        arrangement: 'Hybrid',
        score: 95.8,
        hireDate: '2024-01-15',
        todayStatus: 'Present',
        todayCheckIn: '08:51 AM',
        todayLocation: 'SF Building A - 3rd Fl',
        todayNotes: 'Frontend architecture revamp',
      },
      {
        id: 'EMP-1017',
        firstName: 'Rachel',
        lastName: 'Adams',
        email: 'rachel.adams@pulsework.io',
        phone: '+1 (415) 892-1402',
        role: 'SDR Team Lead',
        dept: 'Sales',
        loc: 'San Francisco',
        workType: 'Full-time',
        arrangement: 'In-Office',
        score: 84.1,
        hireDate: '2023-09-01',
        todayStatus: 'Absent',
        todayCheckIn: null,
        todayLocation: 'N/A',
        todayNotes: 'Unnotified / Sick Leave',
      },
      {
        id: 'EMP-1018',
        firstName: 'Kenji',
        lastName: 'Takahashi',
        email: 'kenji.takahashi@pulsework.io',
        phone: '+65 6789 0456',
        role: 'DevOps & SRE Specialist',
        dept: 'Engineering',
        loc: 'Singapore',
        workType: 'Full-time',
        arrangement: 'Hybrid',
        score: 99.1,
        hireDate: '2022-04-10',
        todayStatus: 'Present',
        todayCheckIn: '08:40 AM',
        todayLocation: 'Singapore Marina Bay Hub',
        todayNotes: 'Latency optimization APAC',
      },
      {
        id: 'EMP-1019',
        firstName: 'Sophie',
        lastName: 'Martin',
        email: 'sophie.martin@pulsework.io',
        phone: '+44 20 7946 0551',
        role: 'Brand & Creative Director',
        dept: 'Marketing',
        loc: 'London',
        workType: 'Full-time',
        arrangement: 'In-Office',
        score: 98.3,
        hireDate: '2020-05-18',
        todayStatus: 'Present',
        todayCheckIn: '08:49 AM',
        todayLocation: 'London Tech Hub - Studio',
        todayNotes: 'Global rebrand guidelines review',
      },
      {
        id: 'EMP-1020',
        firstName: 'Arthur',
        lastName: 'Pendelton',
        email: 'arthur.pendelton@pulsework.io',
        phone: '+1 (212) 555-0100',
        role: 'Chief Compliance Officer',
        dept: 'Operations',
        loc: 'New York HQ',
        workType: 'Full-time',
        arrangement: 'In-Office',
        score: 99.8,
        hireDate: '2019-02-11',
        todayStatus: 'Present',
        todayCheckIn: '08:15 AM',
        todayLocation: 'NYC HQ - Executive Suite',
        todayNotes: 'Audit committee session',
      },
      {
        id: 'EMP-1021',
        firstName: 'Fatima',
        lastName: 'Zahra',
        email: 'fatima.zahra@pulsework.io',
        phone: '+49 89 2345678',
        role: 'Quality Assurance Engineer',
        dept: 'Engineering',
        loc: 'Berlin',
        workType: 'Contract',
        arrangement: 'Remote',
        score: 97.0,
        hireDate: '2023-10-01',
        todayStatus: 'Remote',
        todayCheckIn: '09:00 AM',
        todayLocation: 'Home Office - Munich',
        todayNotes: 'Automated end-to-end regression runs',
      },
      {
        id: 'EMP-1022',
        firstName: 'Carlos',
        lastName: 'Ruiz',
        email: 'carlos.ruiz@pulsework.io',
        phone: '+1 (212) 555-0155',
        role: 'Billing & Payroll Specialist',
        dept: 'Finance',
        loc: 'New York HQ',
        workType: 'Full-time',
        arrangement: 'Hybrid',
        score: 90.2,
        hireDate: '2022-07-15',
        todayStatus: 'Late',
        todayCheckIn: '09:28 AM',
        todayLocation: 'NYC HQ - 16th Floor',
        todayNotes: 'Late due to regional transit delay',
      },
      {
        id: 'EMP-1023',
        firstName: 'Zoe',
        lastName: 'Washington',
        email: 'zoe.washington@pulsework.io',
        phone: '+1 (415) 892-1599',
        role: 'Product Manager - Analytics',
        dept: 'Product',
        loc: 'San Francisco',
        workType: 'Full-time',
        arrangement: 'Hybrid',
        score: 98.6,
        hireDate: '2021-12-05',
        todayStatus: 'Present',
        todayCheckIn: '08:52 AM',
        todayLocation: 'SF Building A - 5th Fl',
        todayNotes: 'Workforce telemetry specification',
      },
      {
        id: 'EMP-1024',
        firstName: 'Nils',
        lastName: 'Lindqvist',
        email: 'nils.lindqvist@pulsework.io',
        phone: '+44 20 7946 0442',
        role: 'Customer Success Manager',
        dept: 'Customer Support',
        loc: 'London',
        workType: 'Full-time',
        arrangement: 'Hybrid',
        score: 93.5,
        hireDate: '2022-03-22',
        todayStatus: 'On Leave',
        todayCheckIn: null,
        todayLocation: 'N/A',
        todayNotes: 'Paternity Leave',
      },
      {
        id: 'EMP-1025',
        firstName: 'Deepak',
        lastName: 'Joshi',
        email: 'deepak.joshi@pulsework.io',
        phone: '+1 (206) 555-0176',
        role: 'Backend Systems Engineer',
        dept: 'Engineering',
        loc: 'Remote',
        workType: 'Full-time',
        arrangement: 'Remote',
        score: 99.0,
        hireDate: '2022-05-18',
        todayStatus: 'Remote',
        todayCheckIn: '08:45 AM',
        todayLocation: 'Home Office - Seattle',
        todayNotes: 'Database indexing optimization',
      },
      {
        id: 'EMP-1026',
        firstName: 'Emily',
        lastName: 'Thornton',
        email: 'emily.thornton@pulsework.io',
        phone: '+1 (212) 555-0192',
        role: 'Corporate Communications Lead',
        dept: 'Marketing',
        loc: 'New York HQ',
        workType: 'Full-time',
        arrangement: 'In-Office',
        score: 97.9,
        hireDate: '2023-02-01',
        todayStatus: 'Present',
        todayCheckIn: '08:38 AM',
        todayLocation: 'NYC HQ - 17th Floor',
        todayNotes: 'Quarterly all-hands prep',
      },
      {
        id: 'EMP-1027',
        firstName: 'Klaus',
        lastName: 'Fischer',
        email: 'klaus.fischer@pulsework.io',
        phone: '+49 30 9876543',
        role: 'IT Infrastructure Lead',
        dept: 'Operations',
        loc: 'Berlin',
        workType: 'Full-time',
        arrangement: 'In-Office',
        score: 99.4,
        hireDate: '2020-08-01',
        todayStatus: 'Present',
        todayCheckIn: '08:29 AM',
        todayLocation: 'Berlin Server Room B',
        todayNotes: 'Core network switch maintenance',
      },
      {
        id: 'EMP-1028',
        firstName: 'Gabriela',
        lastName: 'Silva',
        email: 'gabriela.silva@pulsework.io',
        phone: '+65 6789 0888',
        role: 'International Expansion Lead',
        dept: 'Sales',
        loc: 'Singapore',
        workType: 'Full-time',
        arrangement: 'Hybrid',
        score: 96.7,
        hireDate: '2022-09-10',
        todayStatus: 'Present',
        todayCheckIn: '08:56 AM',
        todayLocation: 'Singapore Marina Bay Hub',
        todayNotes: 'APAC partner ecosystem review',
      },
      {
        id: 'EMP-1029',
        firstName: 'Jordan',
        lastName: 'Bell',
        email: 'jordan.bell@pulsework.io',
        phone: '+1 (415) 892-1678',
        role: 'Frontend UI/UX Intern',
        dept: 'Engineering',
        loc: 'San Francisco',
        workType: 'Intern',
        arrangement: 'Hybrid',
        score: 87.0,
        hireDate: '2024-06-01',
        todayStatus: 'Late',
        todayCheckIn: '09:41 AM',
        todayLocation: 'SF Building A - 3rd Fl',
        todayNotes: 'BART commuter transit delay',
      },
      {
        id: 'EMP-1030',
        firstName: 'Aisha',
        lastName: 'Al-Hassan',
        email: 'aisha.alhassan@pulsework.io',
        phone: '+44 20 7946 0339',
        role: 'People Operations Coordinator',
        dept: 'Human Resources',
        loc: 'London',
        workType: 'Part-time',
        arrangement: 'Hybrid',
        score: 98.1,
        hireDate: '2023-08-15',
        todayStatus: 'Present',
        todayCheckIn: '09:12 AM',
        todayLocation: 'London Tech Hub - Desks',
        todayNotes: 'New employee orientation program',
      },
    ]

    for (const emp of employeesList) {
      const deptId = deptMap.get(emp.dept) || 1
      const locId = locMap.get(emp.loc) || 1
      insertEmp.run(
        emp.id,
        emp.firstName,
        emp.lastName,
        emp.email,
        emp.phone,
        emp.role,
        deptId,
        locId,
        emp.workType,
        emp.arrangement,
        emp.score,
        emp.avatar || null,
        emp.hireDate
      )
    }

    // 4. Generate 30 days of historical daily attendance records for all 30 employees
    // Anchor to today's date: 2026-11-02
    const now = new Date('2026-11-02T12:00:00Z')

    for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
      const targetDate = new Date(now)
      targetDate.setDate(now.getDate() - dayOffset)
      const dateStr = targetDate.toISOString().slice(0, 10)
      const isWeekend = targetDate.getDay() === 0 || targetDate.getDay() === 6
      const isToday = dayOffset === 0

      for (const emp of employeesList) {
        let status = 'Present'
        let checkIn: string | null = '08:45 AM'
        let checkOut: string | null = '05:30 PM'
        let locStr = `${emp.loc} Office`
        let notes: string | null = 'Normal schedule'

        if (isToday) {
          // Use exact designated today status
          status = emp.todayStatus
          checkIn = emp.todayCheckIn
          checkOut = null // Still on shift
          locStr = emp.todayLocation
          notes = emp.todayNotes
        } else if (isWeekend) {
          // Weekend - 85% off, small on-call skeleton
          if (emp.role.includes('DevOps') || emp.role.includes('Support')) {
            status = 'Remote'
            checkIn = '09:15 AM'
            checkOut = '03:30 PM'
            locStr = 'On-call / Remote Monitoring'
            notes = 'Weekend escalation coverage'
          } else {
            status = 'Absent'
            checkIn = null
            checkOut = null
            locStr = 'N/A'
            notes = 'Weekend Rest'
          }
        } else {
          // Weekday realistic generation based on employee attributes
          const hash = (emp.id.charCodeAt(6) * 17 + dayOffset * 31) % 100

          if (emp.arrangement === 'Remote') {
            status = 'Remote'
            checkIn = '08:35 AM'
            locStr = 'Home Office - Secure VPN'
            notes = 'Remote active'
          } else if (emp.arrangement === 'Hybrid' && (dayOffset % 2 === 0)) {
            status = 'Remote'
            checkIn = '08:50 AM'
            locStr = 'Home Office - Hybrid Day'
            notes = 'Approved hybrid telework'
          } else if (hash < 6) {
            status = 'On Leave'
            checkIn = null
            checkOut = null
            locStr = 'N/A'
            notes = 'Approved Paid Leave'
          } else if (hash < 10) {
            status = 'Absent'
            checkIn = null
            checkOut = null
            locStr = 'N/A'
            notes = 'Unplanned Sick Leave'
          } else if (hash < 20) {
            status = 'Late'
            checkIn = '09:35 AM'
            locStr = `${emp.loc} - Check-in kiosk`
            notes = 'Traffic / transit delay'
          } else {
            status = 'Present'
            const min = 30 + (hash % 25)
            checkIn = `08:${min < 10 ? '0' : ''}${min} AM`
            locStr = `${emp.loc} Office - Main Floor`
            notes = 'On time'
          }
        }

        insertAttendance.run(emp.id, dateStr, status, checkIn, checkOut, locStr, notes)
      }
    }
  })

  transaction()
  console.log('[SQLite] Seed complete. 8 departments, 6 locations, 30 employees, and 900+ daily attendance records populated.')
}

// Allow direct CLI execution: node/tsx server/src/db/seed.ts
seedDatabase()
