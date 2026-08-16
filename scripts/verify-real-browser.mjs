import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import GIFEncoder from 'gif-encoder-2'
import { PNG } from 'pngjs'
import { chromium } from 'playwright-core'

const baseUrl = process.env.DSH_BROWSER_BASE_URL ?? 'http://127.0.0.1:3091'
const edgePath = process.env.DSH_EDGE_PATH
  ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const dshVersion = process.env.DSH_BROWSER_DSH_VERSION ?? 'unknown'
const outputDir = resolve(process.env.DSH_BROWSER_OUTPUT_DIR ?? 'assets')
const receiptPath = resolve(process.env.DSH_BROWSER_RECEIPT ?? 'docs/browser-gate-receipt.json')
const localBundlePath = resolve('lib/client.js')
const desktopScreenshotPath = resolve(outputDir, 'branch-review-desktop.png')
const decisionScreenshotPath = resolve(outputDir, 'branch-review-decisions.png')
const mobileScreenshotPath = resolve(outputDir, 'branch-review-mobile.png')
const gifPath = resolve(outputDir, 'branch-review-flow.gif')
const projectRoot = resolve('.')

function sha256(value) {
  return createHash('sha256').update(value).digest('hex').toUpperCase()
}

function invariant(condition, message) {
  if (!condition) throw new Error(message)
}

function gitOutput(args) {
  return execFileSync('git', args, { cwd: projectRoot, encoding: 'utf8' }).trim()
}

function dismissSetupDialog(page) {
  return page.waitForTimeout(2_000).then(async () => {
    const dialog = page.getByRole('dialog', { name: '添加一个 API Key 开始使用' })
    if (await dialog.count() > 0) {
      await dialog.getByRole('button', { name: '稍后配置' }).click({ force: true })
      await dialog.waitFor({ state: 'detached' })
    }
  })
}

async function expandSessions(page) {
  const button = page.getByRole('button', { name: /展开其余/ })
  if (await button.count() > 0) await button.click()
}

async function openForkSession(page) {
  const rows = page.locator('.ET6vSW_sessionRow').filter({ hasText: 'FORK_DIFF_GATE_PARENT_20260816' })
  for (let index = 0; index < await rows.count(); index += 1) {
    await rows.nth(index).click()
    await page.waitForTimeout(500)
    if (await page.getByRole('button', { name: 'Branch review', exact: true }).isVisible().catch(() => false)) return
  }
  throw new Error('Could not open a real branch session with the plugin trigger')
}

async function openQueue(page) {
  const trigger = page.getByRole('button', { name: 'Branch review', exact: true })
  await trigger.waitFor({ state: 'visible', timeout: 10_000 })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Branch review queue' })
  await dialog.waitFor({ state: 'visible' })
  return { trigger, dialog }
}

async function chooseCandidate(dialog, value) {
  const select = dialog.locator('select').first()
  await select.selectOption(value)
  await dialog.locator('.dsh-branch-review__editor').waitFor({ state: 'visible' })
  await dialog.page().waitForTimeout(100)
}

async function saveDecision(dialog, status, reason, tags, link) {
  await dialog.getByRole('button', { name: status, exact: true }).click()
  const textareas = dialog.locator('textarea')
  await textareas.nth(0).fill(reason)
  await dialog.locator('input:not([type=file])').first().fill(tags)
  await textareas.nth(1).fill(link)
  await dialog.getByRole('button', { name: 'Save decision', exact: true }).click()
  await dialog.getByRole('status').waitFor({ state: 'visible' })
}

async function assertNoHorizontalOverflow(page, selector) {
  const size = await page.locator(selector).evaluate(element => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }))
  invariant(size.scrollWidth <= size.clientWidth + 1, `${selector} overflows horizontally`)
}

function writeGif(frames, path) {
  const first = PNG.sync.read(frames[0])
  const encoder = new GIFEncoder(first.width, first.height)
  encoder.start()
  encoder.setRepeat(0)
  encoder.setDelay(500)
  encoder.setQuality(10)
  for (const frame of frames) encoder.addFrame(PNG.sync.read(frame).data)
  encoder.finish()
  writeFileSync(path, encoder.out.getData())
}

mkdirSync(outputDir, { recursive: true })
mkdirSync(dirname(receiptPath), { recursive: true })
const localBundleSha256 = sha256(readFileSync(localBundlePath))
const gitHead = gitOutput(['rev-parse', 'HEAD'])
const gitStatus = gitOutput(['status', '--porcelain=v1', '--untracked-files=all'])
const trackedDiff = execFileSync('git', ['diff', '--binary', 'HEAD'], {
  cwd: projectRoot,
  maxBuffer: 50 * 1024 * 1024,
})

const rootResponse = await fetch(baseUrl)
invariant(rootResponse.ok, `DSH root returned HTTP ${String(rootResponse.status)}`)
const rootHtml = await rootResponse.text()
const assetMatch = rootHtml.match(/\/plugins\/dsh-branch-review\/client\.js\?rev=[a-f0-9]+/)
invariant(assetMatch !== null, 'DSH root is missing the dsh-branch-review boot asset')
const assetUrl = new URL(assetMatch[0], baseUrl).href
const assetResponse = await fetch(assetUrl)
invariant(assetResponse.ok, `Plugin asset returned HTTP ${String(assetResponse.status)}`)
const assetBytes = Buffer.from(await assetResponse.arrayBuffer())
const servedBundleSha256 = sha256(assetBytes)
invariant(servedBundleSha256 === localBundleSha256, 'Served bundle hash does not match local build')

const errors = { console: [], page: [], request: [] }
const receipt = {
  generatedAt: new Date().toISOString(),
  git: {
    head: gitHead,
    dirty: gitStatus.length > 0,
    statusSha256: sha256(gitStatus),
    trackedDiffSha256: sha256(trackedDiff),
  },
  dsh: { version: dshVersion, baseUrl },
  browser: { name: 'Microsoft Edge', executablePath: edgePath, version: '', headless: true },
  plugin: {
    assetUrl,
    assetStatus: assetResponse.status,
    bytes: assetBytes.length,
    localBundlePath,
    localBundleSha256,
    servedBundleSha256,
  },
  viewport: { desktop: { width: 1440, height: 1000 }, mobile: { width: 390, height: 844 } },
  checks: {},
  screenshots: {},
  gif: {},
  errors,
}

const browser = await chromium.launch({ executablePath: edgePath, headless: true, args: ['--disable-gpu'] })
receipt.browser.version = browser.version()
const context = await browser.newContext({ viewport: receipt.viewport.desktop, locale: 'zh-CN' })
const page = await context.newPage()
page.on('console', message => { if (message.type() === 'error') errors.console.push(message.text()) })
page.on('pageerror', error => errors.page.push(error.message))
page.on('requestfailed', request => errors.request.push(`${request.method()} ${request.url()} ${request.failure()?.errorText ?? ''}`.trim()))
const capturedFrames = []

try {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' })
  await dismissSetupDialog(page)
  await expandSessions(page)

  const newSession = page.locator('button._0DF1DW_newSession')
  await newSession.waitFor({ state: 'visible' })
  await newSession.click()
  await page.waitForTimeout(500)
  const noForkTriggerHidden = !(await page.getByRole('button', { name: 'Branch review', exact: true }).isVisible().catch(() => false))
  invariant(noForkTriggerHidden, 'Branch review trigger is visible without related branches')

  await expandSessions(page)
  await openForkSession(page)
  const { trigger, dialog } = await openQueue(page)
  const styleCount = await page.locator('#dsh-branch-review-style').count()
  invariant(styleCount === 1, `Expected one plugin style node, got ${styleCount}`)
  const candidates = await dialog.locator('select').first().locator('option').evaluateAll(nodes => nodes.map(node => ({ value: node.value, label: node.textContent ?? '' })))
  invariant(candidates.length >= 3, `Expected parent and two sibling candidates, got ${candidates.length}`)
  invariant(candidates.some(item => item.label.includes('parent')), 'Parent candidate is missing')
  invariant(candidates.filter(item => item.label.includes('sibling')).length >= 2, 'Two sibling candidates are missing')

  await page.screenshot({ path: desktopScreenshotPath })
  capturedFrames.push(readFileSync(desktopScreenshotPath))

  await chooseCandidate(dialog, candidates[0].value)
  await saveDecision(dialog, 'Keep left', 'Keep this branch as the baseline for the release review.', 'baseline,release', 'https://github.com/chouyong/dsh-branch-review/issues/1')
  await chooseCandidate(dialog, candidates[1].value)
  await saveDecision(dialog, 'Keep right', 'Keep the compared branch for a follow-up implementation.', 'follow-up,implementation', 'https://github.com/chouyong/dsh-branch-review/issues/2')
  await chooseCandidate(dialog, candidates[2].value)
  await saveDecision(dialog, 'Follow up', 'Needs a human decision after the next verification run.', 'human-review', 'https://github.com/chouyong/dsh-branch-review/issues/3')
  const queueText = await dialog.locator('[aria-label="Review records"]').innerText()
  invariant(queueText.includes('Keep left') && queueText.includes('Keep right') && queueText.includes('Follow up'), 'Three decision states are not visible in the queue')

  const download = await Promise.all([
    page.waitForEvent('download', { timeout: 5_000 }),
    dialog.getByRole('button', { name: 'Export metadata', exact: true }).click(),
  ]).then(([event]) => event).catch(() => undefined)
  invariant(download !== undefined, 'Export did not produce a download')
  const exportPath = await download.path()
  invariant(exportPath !== null, 'Export download path is unavailable')
  const exportBytes = readFileSync(exportPath)
  const chooserPromise = page.waitForEvent('filechooser')
  await dialog.getByRole('button', { name: 'Import metadata', exact: true }).click()
  const chooser = await chooserPromise
  await chooser.setFiles({ name: 'branch-review-roundtrip.json', mimeType: 'application/json', buffer: exportBytes })
  await dialog.getByRole('status').waitFor({ state: 'visible' })

  await page.screenshot({ path: decisionScreenshotPath })
  capturedFrames.push(readFileSync(decisionScreenshotPath))

  await page.reload({ waitUntil: 'domcontentloaded' })
  await dismissSetupDialog(page)
  await expandSessions(page)
  await openForkSession(page)
  const reopened = await openQueue(page)
  const persistedText = await reopened.dialog.locator('[aria-label="Review records"]').innerText()
  invariant(persistedText.includes('Keep left') && persistedText.includes('Keep right') && persistedText.includes('Follow up'), 'Decision states did not persist after reload')

  await reopened.dialog.locator('select').nth(1).selectOption('resolved')
  await page.waitForTimeout(150)
  const resolvedFilterCount = await reopened.dialog.locator('[aria-label="Review records"] .dsh-branch-review__queue-item').count()
  invariant(resolvedFilterCount >= 2, 'Resolved filter did not retain resolved records')
  await reopened.dialog.locator('select').nth(1).selectOption('all')

  const closeButton = reopened.dialog.getByRole('button', { name: 'Close', exact: true })
  await closeButton.click()
  await reopened.dialog.waitFor({ state: 'detached' })
  invariant(await page.evaluate(() => document.activeElement?.classList.contains('dsh-branch-review__trigger') === true), 'Close did not restore focus to the trigger')

  await trigger.click()
  const reopenedAgain = page.getByRole('dialog', { name: 'Branch review queue' })
  await reopenedAgain.waitFor({ state: 'visible' })
  await reopenedAgain.locator('select').nth(1).selectOption('resolved')
  await page.waitForTimeout(150)
  capturedFrames.push(await page.screenshot())
  await reopenedAgain.locator('select').nth(1).selectOption('all')
  await page.keyboard.press('Escape')
  await reopenedAgain.waitFor({ state: 'detached' })

  await page.setViewportSize(receipt.viewport.mobile)
  const mobile = await openQueue(page)
  const mobileBox = await mobile.dialog.boundingBox()
  invariant(mobileBox !== null && mobileBox.x >= -1 && mobileBox.y >= -1, 'Mobile panel starts outside the viewport')
  invariant(mobileBox.x + mobileBox.width <= 391 && mobileBox.y + mobileBox.height <= 845, 'Mobile panel exceeds the viewport')
  await assertNoHorizontalOverflow(page, '.dsh-branch-review__panel')
  await page.screenshot({ path: mobileScreenshotPath })

  await page.setViewportSize(receipt.viewport.desktop)
  const openButtons = mobile.dialog.getByRole('button', { name: 'Open session', exact: true })
  invariant(await openButtons.count() >= 1, 'Open session action is missing')
  await openButtons.last().click()
  await page.waitForTimeout(600)
  invariant(await page.locator('.r-_SFG_crumbCurrent').count() > 0, 'Open session did not navigate to a session')
  await assertNoHorizontalOverflow(page, 'body')

  invariant(errors.console.length === 0, `Console errors: ${errors.console.join(' | ')}`)
  invariant(errors.page.length === 0, `Page errors: ${errors.page.join(' | ')}`)
  invariant(errors.request.length === 0, `Request failures: ${errors.request.join(' | ')}`)

  receipt.checks = {
    rootStatus: rootResponse.status,
    pluginAssetStatus: assetResponse.status,
    styleCount,
    candidateCount: candidates.length,
    parentCandidate: candidates.find(item => item.label.includes('parent'))?.label,
    siblingCandidates: candidates.filter(item => item.label.includes('sibling')).map(item => item.label),
    noForkTriggerHidden,
    decisionStates: ['keep-left', 'keep-right', 'follow-up'],
    exportImportRoundTrip: true,
    reloadPersistence: true,
    resolvedFilterCount,
    focusRestore: true,
    mobileViewport: receipt.viewport.mobile,
    openSessionNavigation: true,
  }
  receipt.screenshots = {
    desktop: { path: desktopScreenshotPath, width: 1440, height: 1000, sha256: sha256(readFileSync(desktopScreenshotPath)) },
    decisions: { path: decisionScreenshotPath, width: 1440, height: 1000, sha256: sha256(readFileSync(decisionScreenshotPath)) },
    mobile: { path: mobileScreenshotPath, width: 390, height: 844, sha256: sha256(readFileSync(mobileScreenshotPath)) },
  }
  writeGif(capturedFrames, gifPath)
  receipt.gif = { path: gifPath, frames: capturedFrames.length, sha256: sha256(readFileSync(gifPath)) }
  writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, 'utf8')
  process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`)
} finally {
  await context.close()
  await browser.close()
}
