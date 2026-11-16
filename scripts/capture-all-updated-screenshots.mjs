import puppeteer from 'puppeteer-core'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const screenshotsDir = path.join(rootDir, 'screenshots')
const artifactDir = 'C:\\Users\\prem9\\.gemini\\antigravity\\brain\\89e18170-e062-4fe2-908a-bccdfea05f14'

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true })
}
if (!fs.existsSync(artifactDir)) {
  fs.mkdirSync(artifactDir, { recursive: true })
}

const chromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
]

const executablePath = chromePaths.find((p) => fs.existsSync(p))
if (!executablePath) {
  console.error('No suitable browser found for screenshot capture!')
  process.exit(1)
}

console.log(`Using browser executable: ${executablePath}`)

const targetUrl = 'http://localhost:5173'
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function copyToArtifacts(filename) {
  const src = path.join(screenshotsDir, filename)
  const dest = path.join(artifactDir, filename)
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest)
    console.log(`  -> Saved to screenshots/ and artifacts: ${filename}`)
  }
}

async function capture() {
  console.log(`Connecting to ${targetUrl}...`)

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })

  try {
    // 1. Login View
    console.log('[1/12] Capturing Login Screen with Caste-Neutral Demo Accounts...')
    await page.goto(targetUrl, { waitUntil: 'networkidle0' })
    await page.evaluate(() => {
      localStorage.setItem('stackly_logged_out', 'true')
      location.reload()
    })
    await sleep(2000)
    const loginPath = path.join(screenshotsDir, 'auth-01-login-screen.png')
    await page.screenshot({ path: loginPath, fullPage: true })
    await copyToArtifacts('auth-01-login-screen.png')

    // 2. Demo Role Selected
    console.log('[2/12] Capturing Demo Role Selector (Rohan Verma - Employee)...')
    await page.click('[data-testid="demo-role-employee"]')
    await sleep(800)
    const demoPath = path.join(screenshotsDir, 'auth-02-demo-role-selected.png')
    await page.screenshot({ path: demoPath, fullPage: true })
    await copyToArtifacts('auth-02-demo-role-selected.png')

    // 3. Admin Main Dashboard
    console.log('[3/12] Capturing Admin Dashboard (Dr. Rajesh Kumar, Indian Tech Hubs, Clean Initials)...')
    await page.evaluate(() => {
      localStorage.removeItem('stackly_logged_out')
      location.reload()
    })
    await sleep(2500)
    const dashPath = path.join(screenshotsDir, 'auth-04-admin-dashboard.png')
    await page.screenshot({ path: dashPath, fullPage: true })
    await copyToArtifacts('auth-04-admin-dashboard.png')

    // 4. User Administration View
    console.log('[4/12] Capturing User Administration (RBAC Users with Secular Names)...')
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('div, li, button, span'))
      const userItem = items.find((el) => el.textContent?.trim() === 'User Administration')
      if (userItem) userItem.click()
    })
    await sleep(1500)
    const usersPath = path.join(screenshotsDir, 'auth-05-admin-user-management.png')
    await page.screenshot({ path: usersPath, fullPage: true })
    await copyToArtifacts('auth-05-admin-user-management.png')

    // 5. Audit Trail View
    console.log('[5/12] Capturing Compliance Audit Logs...')
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('div, li, button, span'))
      const auditItem = items.find((el) => el.textContent?.includes('Audit Trail'))
      if (auditItem) auditItem.click()
    })
    await sleep(1500)
    const auditPath = path.join(screenshotsDir, 'auth-06-admin-audit-logs.png')
    await page.screenshot({ path: auditPath, fullPage: true })
    await copyToArtifacts('auth-06-admin-audit-logs.png')

    // 6. Two-Factor Authentication (MFA) Setup Dialog
    console.log('[6/12] Capturing 2FA / MFA Setup Dialog...')
    await page.click('[data-testid="user-menu-button"]')
    await sleep(600)
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('li, div, span'))
      const mfaItem = items.find((el) => el.textContent?.includes('Two-Factor Auth'))
      if (mfaItem) mfaItem.click()
    })
    await sleep(800)
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      const setupBtn = buttons.find((b) => b.textContent?.includes('Set Up Two-Factor Authentication'))
      if (setupBtn) setupBtn.click()
    })
    await sleep(1500)
    const mfaPath = path.join(screenshotsDir, 'auth-07-mfa-setup-dialog.png')
    await page.screenshot({ path: mfaPath, fullPage: true })
    await copyToArtifacts('auth-07-mfa-setup-dialog.png')

    // 7. Active Device Sessions Dialog
    console.log('[7/12] Capturing Active Device Sessions Dialog...')
    await page.keyboard.press('Escape')
    await sleep(500)
    await page.click('[data-testid="user-menu-button"]')
    await sleep(600)
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('li, div, span'))
      const sessItem = items.find((el) => el.textContent?.includes('Active Device Sessions'))
      if (sessItem) sessItem.click()
    })
    await sleep(1200)
    const sessPath = path.join(screenshotsDir, 'auth-08-active-sessions.png')
    await page.screenshot({ path: sessPath, fullPage: true })
    await copyToArtifacts('auth-08-active-sessions.png')
    await page.keyboard.press('Escape')
    await sleep(500)

    // 8. Employee Self-Service View
    console.log('[8/12] Capturing Employee Self-Service (Rohan Verma)...')
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      const roleBtn = buttons.find((b) => b.textContent?.includes('Role:'))
      if (roleBtn) roleBtn.click()
    })
    await sleep(500)
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('li, div, span'))
      const empItem = items.find((el) => el.textContent?.trim() === 'Employee')
      if (empItem) empItem.click()
    })
    await sleep(1200)
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('div, li, button, span'))
      const selfItem = items.find((el) => el.textContent?.includes('My Self-Service'))
      if (selfItem) selfItem.click()
    })
    await sleep(1200)
    const empDashPath = path.join(screenshotsDir, 'auth-10-employee-dashboard.png')
    await page.screenshot({ path: empDashPath, fullPage: true })
    await copyToArtifacts('auth-10-employee-dashboard.png')

    // Switch back to Admin
    console.log('Switching back to Admin role...')
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      const roleBtn = buttons.find((b) => b.textContent?.includes('Role:'))
      if (roleBtn) roleBtn.click()
    })
    await sleep(500)
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('li, div, span'))
      const adminItem = items.find((el) => el.textContent?.trim() === 'Admin')
      if (adminItem) adminItem.click()
    })
    await sleep(1200)

    // 9. Departments View (Budget Removed!)
    console.log('[9/12] Capturing Departments View (Budget Removed)...')
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('div, li, button, span'))
      const deptItem = items.find((el) => el.textContent?.trim() === 'Departments')
      if (deptItem) deptItem.click()
    })
    await sleep(1500)
    const deptsPath = path.join(screenshotsDir, 'auth-11-departments-no-budget.png')
    await page.screenshot({ path: deptsPath, fullPage: true })
    await copyToArtifacts('auth-11-departments-no-budget.png')

    // 10. Reports View (Budget Removed!)
    console.log('[10/12] Capturing Reports & Exports View (Budget Removed)...')
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('div, li, button, span'))
      const reportsItem = items.find((el) => el.textContent?.includes('Reports & Exports'))
      if (reportsItem) reportsItem.click()
    })
    await sleep(1500)
    const reportsPath = path.join(screenshotsDir, 'auth-12-reports-view-no-budget.png')
    await page.screenshot({ path: reportsPath, fullPage: true })
    await copyToArtifacts('auth-12-reports-view-no-budget.png')

    // 11. Leave Management View (Secular Indian Names & Clean Initials)
    console.log('[11/12] Capturing Leave Management View (Secular Names, Clean Avatars)...')
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('div, li, button, span'))
      const leaveItem = items.find((el) => el.textContent?.trim() === 'Leave Management')
      if (leaveItem) leaveItem.click()
    })
    await sleep(1500)
    const leavePath = path.join(screenshotsDir, 'auth-13-leave-management.png')
    await page.screenshot({ path: leavePath, fullPage: true })
    await copyToArtifacts('auth-13-leave-management.png')

    // 12. Analytics View
    console.log('[12/12] Capturing Analytics & Trends View...')
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('div, li, button, span'))
      const analyticsItem = items.find((el) => el.textContent?.includes('Analytics & Trends'))
      if (analyticsItem) analyticsItem.click()
    })
    await sleep(1500)
    const analyticsPath = path.join(screenshotsDir, 'auth-14-analytics-view.png')
    await page.screenshot({ path: analyticsPath, fullPage: true })
    await copyToArtifacts('auth-14-analytics-view.png')

    console.log('All 12 updated screenshots captured successfully!')
  } catch (err) {
    console.error('Screenshot capture encountered an error:', err)
  } finally {
    await browser.close()
    console.log('Browser closed cleanly.')
  }
}

capture()
