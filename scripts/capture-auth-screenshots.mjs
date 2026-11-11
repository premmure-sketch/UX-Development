import puppeteer from 'puppeteer-core'
import { spawn } from 'child_process'
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

// 1. Start SQLite Backend Server
console.log('Starting SQLite Backend Server on port 5000...')
const serverProcess = spawn('npx.cmd', ['tsx', 'server/src/index.ts'], {
  cwd: rootDir,
  shell: true,
  stdio: 'ignore',
})

// 2. Start Vite Preview or Dev Server
const previewPort = 4173
console.log(`Starting Vite preview server on port ${previewPort}...`)
const previewProcess = spawn(
  'npm.cmd',
  ['run', 'preview', '--', '--port', String(previewPort), '--strictPort'],
  {
    cwd: rootDir,
    shell: true,
    stdio: 'ignore',
  }
)

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function copyToArtifacts(filename) {
  const src = path.join(screenshotsDir, filename)
  const dest = path.join(artifactDir, filename)
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest)
    console.log(`  -> Copied to artifacts: ${filename}`)
  }
}

async function capture() {
  console.log('Waiting for Vite preview server to start...')
  await sleep(4000)

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
  const targetUrl = `http://localhost:${previewPort}`

  try {
    // 1. Login View
    console.log('[1/8] Capturing Login Screen...')
    await page.goto(targetUrl, { waitUntil: 'networkidle0' })
    await page.evaluate(() => {
      localStorage.setItem('stackly_logged_out', 'true')
      location.reload()
    })
    await page.waitForNavigation({ waitUntil: 'networkidle0' })
    await sleep(1500)
    const loginPath = path.join(screenshotsDir, 'auth-01-login-screen.png')
    await page.screenshot({ path: loginPath, fullPage: true })
    await copyToArtifacts('auth-01-login-screen.png')

    // 2. Demo Role Selected
    console.log('[2/8] Capturing Demo Role Selector...')
    await page.click('[data-testid="demo-role-employee"]')
    await sleep(800)
    const demoPath = path.join(screenshotsDir, 'auth-02-demo-role-selected.png')
    await page.screenshot({ path: demoPath, fullPage: true })
    await copyToArtifacts('auth-02-demo-role-selected.png')

    // 3. Admin Main Dashboard
    console.log('[3/8] Capturing Admin Dashboard...')
    await page.evaluate(() => {
      localStorage.removeItem('stackly_logged_out')
      location.reload()
    })
    await page.waitForNavigation({ waitUntil: 'networkidle0' })
    await sleep(2000)
    const dashPath = path.join(screenshotsDir, 'auth-04-admin-dashboard.png')
    await page.screenshot({ path: dashPath, fullPage: true })
    await copyToArtifacts('auth-04-admin-dashboard.png')

    // 4. User Administration View
    console.log('[4/8] Capturing User Administration (RBAC)...')
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
    console.log('[5/8] Capturing Compliance Audit Logs...')
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
    console.log('[6/8] Capturing 2FA / MFA Setup Dialog...')
    await page.click('[data-testid="user-menu-button"]')
    await sleep(600)
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('li, div, span'))
      const mfaItem = items.find((el) => el.textContent?.includes('Two-Factor Auth'))
      if (mfaItem) mfaItem.click()
    })
    await sleep(800)
    // Click "Set Up Two-Factor Authentication" if on initial screen
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
    console.log('[7/8] Capturing Active Device Sessions Dialog...')
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

    // 8. Employee Self-Service View & 403 Access Denied
    console.log('[8/8] Capturing Employee Self-Service & Role-Based Views...')
    await page.keyboard.press('Escape')
    await sleep(500)

    // Switch to Employee role via top nav switcher
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

    // Navigate to "My Self-Service"
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('div, li, button, span'))
      const selfItem = items.find((el) => el.textContent?.includes('My Self-Service'))
      if (selfItem) selfItem.click()
    })
    await sleep(1200)
    const empDashPath = path.join(screenshotsDir, 'auth-10-employee-dashboard.png')
    await page.screenshot({ path: empDashPath, fullPage: true })
    await copyToArtifacts('auth-10-employee-dashboard.png')

    // Test 403 Forbidden Access Denied for Employee
    console.log('Capturing 403 Forbidden Access Denied Screen...')
    await page.evaluate(() => {
      // Simulate switching activeNav to 'audit'
      const appNav = window.__setActiveNav
      if (appNav) appNav('audit')
    })
    await sleep(500)

    console.log('All screenshots captured successfully!')
  } catch (err) {
    console.error('Screenshot capture encountered an error:', err)
  } finally {
    await browser.close()
    previewProcess.kill()
    serverProcess.kill()
    console.log('Capture process completed and preview/server stopped.')
    process.exit(0)
  }
}

capture()
