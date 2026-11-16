import { getDatabase } from './database'
import { seedUsers } from './seedUsers'
import type { Database } from 'better-sqlite3'

export function seedDatabase(db?: Database, force: boolean = false): void {
  const database = db || getDatabase()

  if (force) {
    console.log('[SQLite] Force reseed requested. Clearing tables...')
    database.prepare('DELETE FROM attendance_records').run()
    database.prepare('DELETE FROM employees').run()
    database.prepare('DELETE FROM locations').run()
    database.prepare('DELETE FROM departments').run()
  }

  // Check if already seeded
  const employeeCount = (database.prepare('SELECT COUNT(*) as count FROM employees').get() as { count: number }).count
  if (employeeCount > 0 && !force) {
    console.log(`[SQLite] Database already contains ${employeeCount} employees. Skipping seed.`)
    return
  }

  console.log('[SQLite] Seeding workforce database with Indian corporate locations and workforce...')

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
      { name: 'Engineering', code: 'ENG', color: '#6366f1', budget: 14500000 },
      { name: 'Product', code: 'PROD', color: '#8b5cf6', budget: 9500000 },
      { name: 'Sales', code: 'SALES', color: '#06b6d4', budget: 12000000 },
      { name: 'Marketing', code: 'MKTG', color: '#ec4899', budget: 8500000 },
      { name: 'Human Resources', code: 'HR', color: '#f59e0b', budget: 5500000 },
      { name: 'Finance', code: 'FIN', color: '#10b981', budget: 7500000 },
      { name: 'Operations', code: 'OPS', color: '#3b82f6', budget: 6800000 },
      { name: 'Customer Support', code: 'SUPP', color: '#14b8a6', budget: 5200000 },
    ]

    const deptMap = new Map<string, number>()
    for (const d of depts) {
      const res = insertDept.run(d.name, d.code, d.color, d.budget)
      deptMap.set(d.name, Number(res.lastInsertRowid))
    }

    // 2. Locations (All India locations)
    const locs = [
      { name: 'Bengaluru HQ', city: 'Bengaluru', country: 'India', timezone: 'IST' },
      { name: 'Mumbai', city: 'Mumbai', country: 'India', timezone: 'IST' },
      { name: 'Hyderabad', city: 'Hyderabad', country: 'India', timezone: 'IST' },
      { name: 'Delhi NCR', city: 'Delhi NCR', country: 'India', timezone: 'IST' },
      { name: 'Pune', city: 'Pune', country: 'India', timezone: 'IST' },
      { name: 'Remote', city: 'Pan-India / Remote', country: 'India', timezone: 'IST' },
    ]

    const locMap = new Map<string, number>()
    for (const l of locs) {
      const res = insertLoc.run(l.name, l.city, l.country, l.timezone)
      locMap.set(l.name, Number(res.lastInsertRowid))
    }

    // 3. Employees (All Indian Names - Caste Neutral, Secular, No Profile Images)
    const employeesList = [
      {
        id: 'EMP-1001',
        firstName: 'Priya',
        lastName: 'Kumar',
        email: 'priya.kumar@stackly.io',
        phone: '+91 98450 12049',
        role: 'VP of Engineering',
        dept: 'Engineering',
        loc: 'Bengaluru HQ',
        workType: 'Full-time',
        arrangement: 'Hybrid',
        score: 99.2,
        hireDate: '2022-03-15',
        todayStatus: 'Present',
        todayCheckIn: '08:42 AM',
        todayLocation: 'Bengaluru HQ - 4th Fl',
        todayNotes: 'On schedule',
      },
      {
        id: 'EMP-1002',
        firstName: 'Arjun',
        lastName: 'Patel',
        email: 'arjun.patel@stackly.io',
        phone: '+91 98450 11102',
        role: 'Principal Cloud Architect',
        dept: 'Engineering',
        loc: 'Bengaluru HQ',
        workType: 'Full-time',
        arrangement: 'In-Office',
        score: 98.4,
        hireDate: '2021-06-01',
        todayStatus: 'Present',
        todayCheckIn: '08:55 AM',
        todayLocation: 'Bengaluru HQ - 4th Fl',
        todayNotes: 'On schedule',
      },
      {
        id: 'EMP-1003',
        firstName: 'Ananya',
        lastName: 'Rao',
        email: 'ananya.rao@stackly.io',
        phone: '+91 98200 09412',
        role: 'Staff Product Designer',
        dept: 'Product',
        loc: 'Mumbai',
        workType: 'Full-time',
        arrangement: 'Hybrid',
        score: 96.8,
        hireDate: '2023-01-10',
        todayStatus: 'Present',
        todayCheckIn: '09:04 AM',
        todayLocation: 'Mumbai Hub - Desks',
        todayNotes: 'Sprint design review',
      },
      {
        id: 'EMP-1004',
        firstName: 'Rohan',
        lastName: 'Verma',
        email: 'rohan.verma@stackly.io',
        phone: '+91 99880 50199',
        role: 'Senior DevOps Engineer',
        dept: 'Engineering',
        loc: 'Remote',
        workType: 'Full-time',
        arrangement: 'Remote',
        score: 97.5,
        hireDate: '2022-08-20',
        todayStatus: 'Remote',
        todayCheckIn: '08:30 AM',
        todayLocation: 'Home Office - VPN Bengaluru',
        todayNotes: 'Cloud cluster migration',
      },
      {
        id: 'EMP-1005',
        firstName: 'Deepika',
        lastName: 'Sen',
        email: 'deepika.sen@stackly.io',
        phone: '+91 98450 50143',
        role: 'Director of Talent Acquisition',
        dept: 'Human Resources',
        loc: 'Bengaluru HQ',
        workType: 'Full-time',
        arrangement: 'In-Office',
        score: 99.0,
        hireDate: '2020-11-12',
        todayStatus: 'Present',
        todayCheckIn: '08:48 AM',
        todayLocation: 'Bengaluru HQ - 18th Floor',
        todayNotes: 'Executive interview day',
      },
      {
        id: 'EMP-1006',
        firstName: 'Aditya',
        lastName: 'Roy',
        email: 'aditya.roy@stackly.io',
        phone: '+91 98200 50177',
        role: 'Enterprise Account Executive',
        dept: 'Sales',
        loc: 'Mumbai',
        workType: 'Full-time',
        arrangement: 'Hybrid',
        score: 88.5,
        hireDate: '2023-04-05',
        todayStatus: 'Late',
        todayCheckIn: '09:47 AM',
        todayLocation: 'Mumbai Hub - BKC Kiosk',
        todayNotes: 'Local metro transit delay',
      },
      {
        id: 'EMP-1007',
        firstName: 'Sneha',
        lastName: 'Patel',
        email: 'sneha.patel@stackly.io',
        phone: '+91 94400 90123',
        role: 'Lead Data Scientist',
        dept: 'Engineering',
        loc: 'Hyderabad',
        workType: 'Full-time',
        arrangement: 'Hybrid',
        score: 98.9,
        hireDate: '2021-09-18',
        todayStatus: 'Present',
        todayCheckIn: '08:50 AM',
        todayLocation: 'Hyderabad HITEC City Hub',
        todayNotes: 'Predictive model tuning',
      },
      {
        id: 'EMP-1008',
        firstName: 'Vikram',
        lastName: 'Kumar',
        email: 'vikram.kumar@stackly.io',
        phone: '+91 98230 12345',
        role: 'Product Operations Manager',
        dept: 'Product',
        loc: 'Pune',
        workType: 'Full-time',
        arrangement: 'In-Office',
        score: 96.0,
        hireDate: '2022-02-14',
        todayStatus: 'Present',
        todayCheckIn: '08:58 AM',
        todayLocation: 'Pune Magarpatta Office',
        todayNotes: 'Roadmap sync with product leads',
      },
      {
        id: 'EMP-1009',
        firstName: 'Kavya',
        lastName: 'Sen',
        email: 'kavya.sen@stackly.io',
        phone: '+91 98110 09881',
        role: 'Content Strategy Lead',
        dept: 'Marketing',
        loc: 'Delhi NCR',
        workType: 'Full-time',
        arrangement: 'Remote',
        score: 95.4,
        hireDate: '2023-07-01',
        todayStatus: 'Remote',
        todayCheckIn: '08:52 AM',
        todayLocation: 'Home Office - Cyber City',
        todayNotes: 'Annual brand narrative campaign',
      },
      {
        id: 'EMP-1010',
        firstName: 'Rajesh',
        lastName: 'Rao',
        email: 'rajesh.rao@stackly.io',
        phone: '+91 98200 50188',
        role: 'Senior Financial Analyst',
        dept: 'Finance',
        loc: 'Mumbai',
        workType: 'Full-time',
        arrangement: 'In-Office',
        score: 99.5,
        hireDate: '2021-01-25',
        todayStatus: 'Present',
        todayCheckIn: '08:35 AM',
        todayLocation: 'Mumbai Hub - 16th Floor',
        todayNotes: 'Quarterly financial forecast review',
      },
      {
        id: 'EMP-1011',
        firstName: 'Kavita',
        lastName: 'Patel',
        email: 'kavita.patel@stackly.io',
        phone: '+91 98450 12204',
        role: 'Full Stack Engineer',
        dept: 'Engineering',
        loc: 'Bengaluru HQ',
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
        lastName: 'Khan',
        email: 'tariq.khan@stackly.io',
        phone: '+91 94400 70773',
        role: 'Security & Compliance Analyst',
        dept: 'Operations',
        loc: 'Hyderabad',
        workType: 'Full-time',
        arrangement: 'In-Office',
        score: 89.1,
        hireDate: '2022-10-01',
        todayStatus: 'Late',
        todayCheckIn: '09:34 AM',
        todayLocation: 'Hyderabad SecDesk',
        todayNotes: 'Security badge terminal refresh',
      },
      {
        id: 'EMP-1013',
        firstName: 'Sunita',
        lastName: 'Verma',
        email: 'sunita.verma@stackly.io',
        phone: '+91 98230 50122',
        role: 'Customer Support Lead',
        dept: 'Customer Support',
        loc: 'Remote',
        workType: 'Full-time',
        arrangement: 'Remote',
        score: 98.7,
        hireDate: '2021-08-15',
        todayStatus: 'Remote',
        todayCheckIn: '07:55 AM',
        todayLocation: 'Home Office - Pune',
        todayNotes: 'Early queue coverage',
      },
      {
        id: 'EMP-1014',
        firstName: 'Abhishek',
        lastName: 'Roy',
        email: 'abhishek.roy@stackly.io',
        phone: '+91 98110 50164',
        role: 'Growth Marketing Specialist',
        dept: 'Marketing',
        loc: 'Delhi NCR',
        workType: 'Full-time',
        arrangement: 'Hybrid',
        score: 96.2,
        hireDate: '2022-11-20',
        todayStatus: 'Present',
        todayCheckIn: '08:59 AM',
        todayLocation: 'Delhi NCR - Cyber Hub',
        todayNotes: 'Paid campaign AB experiment launch',
      },
      {
        id: 'EMP-1015',
        firstName: 'Pooja',
        lastName: 'Kumar',
        email: 'pooja.kumar@stackly.io',
        phone: '+91 98230 78912',
        role: 'HR People Partner',
        dept: 'Human Resources',
        loc: 'Pune',
        workType: 'Full-time',
        arrangement: 'In-Office',
        score: 97.8,
        hireDate: '2023-03-01',
        todayStatus: 'Present',
        todayCheckIn: '08:44 AM',
        todayLocation: 'Pune Magarpatta Office',
        todayNotes: 'Regional hiring sync',
      },
      {
        id: 'EMP-1016',
        firstName: 'Vikram',
        lastName: 'Singh',
        email: 'vikram.singh@stackly.io',
        phone: '+91 98450 13345',
        role: 'Senior React Developer',
        dept: 'Engineering',
        loc: 'Bengaluru HQ',
        workType: 'Contract',
        arrangement: 'Hybrid',
        score: 95.8,
        hireDate: '2024-01-15',
        todayStatus: 'Present',
        todayCheckIn: '08:51 AM',
        todayLocation: 'Bengaluru HQ - 3rd Fl',
        todayNotes: 'Frontend architecture revamp',
      },
      {
        id: 'EMP-1017',
        firstName: 'Rhea',
        lastName: 'Rao',
        email: 'rhea.rao@stackly.io',
        phone: '+91 98200 14402',
        role: 'SDR Team Lead',
        dept: 'Sales',
        loc: 'Mumbai',
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
        firstName: 'Kiran',
        lastName: 'Kumar',
        email: 'kiran.kumar@stackly.io',
        phone: '+91 94400 90456',
        role: 'DevOps & SRE Specialist',
        dept: 'Engineering',
        loc: 'Hyderabad',
        workType: 'Full-time',
        arrangement: 'Hybrid',
        score: 99.1,
        hireDate: '2022-04-10',
        todayStatus: 'Present',
        todayCheckIn: '08:40 AM',
        todayLocation: 'Hyderabad HITEC City Hub',
        todayNotes: 'Latency optimization India Cloud',
      },
      {
        id: 'EMP-1019',
        firstName: 'Shruti',
        lastName: 'Sen',
        email: 'shruti.sen@stackly.io',
        phone: '+91 98110 05551',
        role: 'Brand & Creative Director',
        dept: 'Marketing',
        loc: 'Delhi NCR',
        workType: 'Full-time',
        arrangement: 'In-Office',
        score: 98.3,
        hireDate: '2020-05-18',
        todayStatus: 'Present',
        todayCheckIn: '08:49 AM',
        todayLocation: 'Delhi NCR - Studio',
        todayNotes: 'Brand guidelines review',
      },
      {
        id: 'EMP-1020',
        firstName: 'Harish',
        lastName: 'Chand',
        email: 'harish.chand@stackly.io',
        phone: '+91 98450 50100',
        role: 'Chief Compliance Officer',
        dept: 'Operations',
        loc: 'Bengaluru HQ',
        workType: 'Full-time',
        arrangement: 'In-Office',
        score: 99.8,
        hireDate: '2019-02-11',
        todayStatus: 'Present',
        todayCheckIn: '08:15 AM',
        todayLocation: 'Bengaluru HQ - Executive Suite',
        todayNotes: 'Audit committee session',
      },
      {
        id: 'EMP-1021',
        firstName: 'Farida',
        lastName: 'Khan',
        email: 'farida.khan@stackly.io',
        phone: '+91 98230 23456',
        role: 'Quality Assurance Engineer',
        dept: 'Engineering',
        loc: 'Pune',
        workType: 'Contract',
        arrangement: 'Remote',
        score: 97.0,
        hireDate: '2023-10-01',
        todayStatus: 'Remote',
        todayCheckIn: '09:00 AM',
        todayLocation: 'Home Office - Pune',
        todayNotes: 'Automated regression runs',
      },
      {
        id: 'EMP-1022',
        firstName: 'Manish',
        lastName: 'Kumar',
        email: 'manish.kumar@stackly.io',
        phone: '+91 98200 50155',
        role: 'Billing & Payroll Specialist',
        dept: 'Finance',
        loc: 'Mumbai',
        workType: 'Full-time',
        arrangement: 'Hybrid',
        score: 90.2,
        hireDate: '2022-07-15',
        todayStatus: 'Late',
        todayCheckIn: '09:28 AM',
        todayLocation: 'Mumbai Hub - 16th Floor',
        todayNotes: 'Western railway local delay',
      },
      {
        id: 'EMP-1023',
        firstName: 'Tanvi',
        lastName: 'Rao',
        email: 'tanvi.rao@stackly.io',
        phone: '+91 98450 15599',
        role: 'Product Manager - Analytics',
        dept: 'Product',
        loc: 'Bengaluru HQ',
        workType: 'Full-time',
        arrangement: 'Hybrid',
        score: 98.6,
        hireDate: '2021-12-05',
        todayStatus: 'Present',
        todayCheckIn: '08:52 AM',
        todayLocation: 'Bengaluru HQ - 5th Fl',
        todayNotes: 'Workforce telemetry specification',
      },
      {
        id: 'EMP-1024',
        firstName: 'Nikhil',
        lastName: 'Verma',
        email: 'nikhil.verma@stackly.io',
        phone: '+91 98110 04442',
        role: 'Customer Success Manager',
        dept: 'Customer Support',
        loc: 'Delhi NCR',
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
        lastName: 'Kumar',
        email: 'deepak.kumar@stackly.io',
        phone: '+91 99880 50176',
        role: 'Backend Systems Engineer',
        dept: 'Engineering',
        loc: 'Remote',
        workType: 'Full-time',
        arrangement: 'Remote',
        score: 99.0,
        hireDate: '2022-05-18',
        todayStatus: 'Remote',
        todayCheckIn: '08:45 AM',
        todayLocation: 'Home Office - Remote India',
        todayNotes: 'Database indexing optimization',
      },
      {
        id: 'EMP-1026',
        firstName: 'Meera',
        lastName: 'Rao',
        email: 'meera.rao@stackly.io',
        phone: '+91 98200 50192',
        role: 'Corporate Communications Lead',
        dept: 'Marketing',
        loc: 'Mumbai',
        workType: 'Full-time',
        arrangement: 'In-Office',
        score: 97.9,
        hireDate: '2023-02-01',
        todayStatus: 'Present',
        todayCheckIn: '08:38 AM',
        todayLocation: 'Mumbai Hub - 17th Floor',
        todayNotes: 'Quarterly all-hands prep',
      },
      {
        id: 'EMP-1027',
        firstName: 'Alok',
        lastName: 'Kumar',
        email: 'alok.kumar@stackly.io',
        phone: '+91 94400 98765',
        role: 'IT Infrastructure Lead',
        dept: 'Operations',
        loc: 'Hyderabad',
        workType: 'Full-time',
        arrangement: 'In-Office',
        score: 99.4,
        hireDate: '2020-08-01',
        todayStatus: 'Present',
        todayCheckIn: '08:29 AM',
        todayLocation: 'Hyderabad Server Room B',
        todayNotes: 'Core network switch maintenance',
      },
      {
        id: 'EMP-1028',
        firstName: 'Gayatri',
        lastName: 'Rao',
        email: 'gayatri.rao@stackly.io',
        phone: '+91 98450 90888',
        role: 'International Expansion Lead',
        dept: 'Sales',
        loc: 'Bengaluru HQ',
        workType: 'Full-time',
        arrangement: 'Hybrid',
        score: 96.7,
        hireDate: '2022-09-10',
        todayStatus: 'Present',
        todayCheckIn: '08:56 AM',
        todayLocation: 'Bengaluru HQ - 6th Floor',
        todayNotes: 'India & SEA partner ecosystem review',
      },
      {
        id: 'EMP-1029',
        firstName: 'Siddharth',
        lastName: 'Patel',
        email: 'siddharth.patel@stackly.io',
        phone: '+91 98450 16678',
        role: 'Frontend UI/UX Intern',
        dept: 'Engineering',
        loc: 'Bengaluru HQ',
        workType: 'Intern',
        arrangement: 'Hybrid',
        score: 87.0,
        hireDate: '2024-06-01',
        todayStatus: 'Late',
        todayCheckIn: '09:41 AM',
        todayLocation: 'Bengaluru HQ - 3rd Fl',
        todayNotes: 'Namma Metro transit delay',
      },
      {
        id: 'EMP-1030',
        firstName: 'Zoya',
        lastName: 'Akhtar',
        email: 'zoya.akhtar@stackly.io',
        phone: '+91 98230 70339',
        role: 'People Operations Coordinator',
        dept: 'Human Resources',
        loc: 'Pune',
        workType: 'Part-time',
        arrangement: 'Hybrid',
        score: 98.1,
        hireDate: '2023-08-15',
        todayStatus: 'Present',
        todayCheckIn: '09:12 AM',
        todayLocation: 'Pune Magarpatta Office',
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
        null, // Profile images removed
        emp.hireDate
      )
    }

    // 4. Generate 30 days of historical daily attendance records for all 30 employees
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
          status = emp.todayStatus
          checkIn = emp.todayCheckIn
          checkOut = null
          locStr = emp.todayLocation
          notes = emp.todayNotes
        } else if (isWeekend) {
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
  seedUsers(database, force)
  console.log('[SQLite] Seed complete. 8 departments, 6 Indian locations, 30 employees, and 900+ daily attendance records populated.')
}

// Allow direct CLI execution: node/tsx server/src/db/seed.ts
const isForce = process.argv.includes('--force')
seedDatabase(undefined, isForce)
