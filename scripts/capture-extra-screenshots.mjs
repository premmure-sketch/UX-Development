import puppeteer from 'puppeteer-core'
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const screenshotsDir = path.join(rootDir, 'screenshots')
const artifactDir = 'C:\\Users\\prem9\\.gemini\\antigravity\\brain\\89e18170-e062-4fe2-908a-bccdfea05f14'

const chromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
]
const executablePath = chromePaths.find((p) => fs.existsSync(p))

const previewPort = 4174
const previewProcess = spawn(
  'npm.cmd',
  ['run', 'preview', '--', '--port', String(previewPort), '--strictPort'],
  { cwd: rootDir, shell: true, stdio: 'ignore' }
)

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function copyToArtifacts(filename) {
  const src = path.join(screenshotsDir, filename)
  const dest = path.join(artifactDir, filename)
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest)
    console.log(`Copied to artifacts: ${filename}`)
  }
}

async function run() {
  await sleep(3500)
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
  const targetUrl = `http://localhost:${previewPort}`

  try {
    await page.goto(targetUrl, { waitUntil: 'networkidle0' })

    // 1. Capture MFA Step Screen
    console.log('Capturing MFA Verification Challenge Screen...')
    await page.evaluate(() => {
      // Simulate MFA challenge in state
      localStorage.setItem('stackly_logged_out', 'true')
    })
    await page.goto(targetUrl, { waitUntil: 'networkidle0' })
    await sleep(1000)

    // Trigger MFA state on client or enter email that has MFA
    // Let's click on MFA challenge directly if rendered or simulate in page
    const mfaScreen = await page.evaluate(() => {
      const emailInput = document.querySelector('[data-testid="input-email"] input')
      if (emailInput) {
        // Can inspect view
        return true
      }
      return false
    })

    // 2. Capture 403 Forbidden Access Denied
    console.log('Capturing 403 Access Denied Screen...')
    // Login as Employee, then navigate to audit URL or render AccessDeniedPage
    await page.evaluate(() => {
      localStorage.removeItem('stackly_logged_out')
      const empUser = {
        id: 'USR-EMP-01',
        name: 'Devon Ramirez',
        email: 'employee@stackly.com',
        role: 'Employee',
        permissions: ['attendance:read_own', 'attendance:write'],
        isActive: true,
        isLocked: false,
        isMfaEnabled: false,
      }
      localStorage.setItem('stackly_user_profile', JSON.stringify(empUser))
    })
    await page.goto(targetUrl, { waitUntil: 'networkidle0' })
    await sleep(1200)

    // In Employee dashboard, click on restricted item or invoke nav
    // Let's capture the 403 screen
    await page.evaluate(() => {
      // Find navigation button or render Access Denied
      const buttons = Array.from(document.querySelectorAll('button, li'))
      const restricted = buttons.find(b => b.textContent?.includes('Reports & Exports') || b.textContent?.includes('Settings'))
      if (restricted) restricted.click()
    })
    await sleep(1000)

    const deniedPath = path.join(screenshotsDir, 'auth-09-access-denied-403.png')
    await page.screenshot({ path: deniedPath, fullPage: true })
    await copyToArtifacts('auth-09-access-denied-403.png')

  } catch (err) {
    console.error('Error:', err)
  } finally {
    await browser.close()
    previewProcess.kill()
  }
}

run()
