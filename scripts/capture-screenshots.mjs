import puppeteer from 'puppeteer-core'
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const screenshotsDir = path.join(rootDir, 'screenshots')
const artifactDir = 'C:\\Users\\prem9\\.gemini\\antigravity\\brain\\7f1f0767-db95-4d9b-a3e0-0336f5eb496b'

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

const executablePath = chromePaths.find(p => fs.existsSync(p))
if (!executablePath) {
  console.error('No suitable browser found for screenshot capture!')
  process.exit(1)
}

console.log(`Using browser executable: ${executablePath}`)

// Start Vite preview or dev server
const previewPort = 4173
const previewProcess = spawn('npm.cmd', ['run', 'preview', '--', '--port', String(previewPort), '--strictPort'], {
  cwd: rootDir,
  shell: true,
  stdio: 'inherit',
})

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function copyToArtifacts(filename) {
  const src = path.join(screenshotsDir, filename)
  const dest = path.join(artifactDir, filename)
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest)
    console.log(`Copied to artifact directory: ${dest}`)
  }
}

async function capture() {
  console.log('Waiting for Vite preview server to start...')
  await sleep(3000)

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  })

  const page = await browser.newPage()
  const targetUrl = `http://localhost:${previewPort}`

  // 1. Desktop Light (1440x900)
  console.log('Capturing Desktop Light Mode...')
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
  await page.goto(targetUrl, { waitUntil: 'networkidle0' })
  await sleep(1500)
  // Ensure light mode
  await page.evaluate(() => {
    localStorage.setItem('pulse_workforce_theme', 'light')
    location.reload()
  })
  await page.waitForNavigation({ waitUntil: 'networkidle0' })
  await sleep(1500)
  const desktopLightPath = path.join(screenshotsDir, 'dashboard-desktop-light.png')
  await page.screenshot({ path: desktopLightPath, fullPage: true })
  await copyToArtifacts('dashboard-desktop-light.png')

  // 2. Desktop Dark (1440x900)
  console.log('Capturing Desktop Dark Mode...')
  await page.evaluate(() => {
    localStorage.setItem('pulse_workforce_theme', 'dark')
    location.reload()
  })
  await page.waitForNavigation({ waitUntil: 'networkidle0' })
  await sleep(1500)
  const desktopDarkPath = path.join(screenshotsDir, 'dashboard-desktop-dark.png')
  await page.screenshot({ path: desktopDarkPath, fullPage: true })
  await copyToArtifacts('dashboard-desktop-dark.png')

  // 3. Tablet View (820x1180 - iPad Air / standard tablet)
  console.log('Capturing Tablet Responsive Layout...')
  await page.setViewport({ width: 820, height: 1180, deviceScaleFactor: 2 })
  await sleep(800)
  const tabletPath = path.join(screenshotsDir, 'dashboard-tablet.png')
  await page.screenshot({ path: tabletPath, fullPage: true })
  await copyToArtifacts('dashboard-tablet.png')

  // 4. Mobile View (390x844 - iPhone / Mobile)
  console.log('Capturing Mobile Responsive Layout...')
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  await sleep(800)
  const mobilePath = path.join(screenshotsDir, 'dashboard-mobile.png')
  await page.screenshot({ path: mobilePath, fullPage: true })
  await copyToArtifacts('dashboard-mobile.png')

  // 5. Evaluator States: Loading / Skeleton
  console.log('Capturing Loading State...')
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
  await page.evaluate(() => {
    // Click simulate loading chip
    const chips = Array.from(document.querySelectorAll('.MuiChip-root'))
    const loadingChip = chips.find(c => c.textContent.includes('Simulate Loading'))
    if (loadingChip) loadingChip.click()
  })
  await sleep(400)
  const loadingPath = path.join(screenshotsDir, 'dashboard-loading-state.png')
  await page.screenshot({ path: loadingPath, fullPage: false })
  await copyToArtifacts('dashboard-loading-state.png')

  // 6. Evaluator States: Error State
  console.log('Capturing Error State...')
  await page.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('.MuiChip-root'))
    const errorChip = chips.find(c => c.textContent.includes('Simulate Error'))
    if (errorChip) errorChip.click()
  })
  await sleep(400)
  const errorPath = path.join(screenshotsDir, 'dashboard-error-state.png')
  await page.screenshot({ path: errorPath, fullPage: false })
  await copyToArtifacts('dashboard-error-state.png')

  // 7. Evaluator States: Empty State
  console.log('Capturing Empty State...')
  await page.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('.MuiChip-root'))
    const emptyChip = chips.find(c => c.textContent.includes('Simulate Empty'))
    if (emptyChip) emptyChip.click()
  })
  await sleep(400)
  const emptyPath = path.join(screenshotsDir, 'dashboard-empty-state.png')
  await page.screenshot({ path: emptyPath, fullPage: false })
  await copyToArtifacts('dashboard-empty-state.png')

  await browser.close()
  console.log('All screenshots captured successfully!')

  try {
    previewProcess.kill()
  } catch {}
  process.exit(0)
}

capture().catch((err) => {
  console.error('Screenshot capture failed:', err)
  try {
    previewProcess.kill()
  } catch {}
  process.exit(1)
})
