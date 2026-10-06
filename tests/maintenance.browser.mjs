// Dependency-free browser verification using Edge/Chrome and the DevTools protocol.
// Run after npm run build: node tests/maintenance.browser.mjs
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { createServer as createTcpServer } from 'node:net'
import { existsSync } from 'node:fs'
import { readFile, mkdtemp, writeFile } from 'node:fs/promises'
import { resolve, join, extname, sep } from 'node:path'
import { tmpdir } from 'node:os'
import jsonServer from 'json-server'

// Run the inherited local API against an in-memory database: verification must
// not change server/db.json or a user's demo data.
const apiApp = jsonServer.create()
const fixture = JSON.parse(await readFile('server/db.json', 'utf8'))
apiApp.use(jsonServer.defaults({ logger: false }))
apiApp.use(jsonServer.rewriter({ '/api/v1/*': '/$1' }))
apiApp.use(jsonServer.bodyParser)
apiApp.use(jsonServer.router(fixture))
const apiServer = await new Promise((resolve, reject) => {
  const server = apiApp.listen(3000, '127.0.0.1', () => resolve(server))
  server.on('error', reject)
})

const browserPath = process.env.MAINTENANCE_BROWSER_PATH || [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe'
].find(existsSync)
assert.ok(browserPath, 'Set MAINTENANCE_BROWSER_PATH to an installed Edge or Chrome executable')
const artifactDirectory = await mkdtemp(join(tmpdir(), 'bicigo-maintenance-'))
const dist = resolve('dist')
assert.ok(existsSync(join(dist, 'index.html')), 'Run npm run build first')
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png' }
const httpServer = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
  let file = resolve(dist, '.' + pathname)
  if (file !== dist && !file.startsWith(dist + sep)) { response.writeHead(403).end(); return }
  if (file === dist || !existsSync(file)) file = join(dist, 'index.html')
  try {
    response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' })
    response.end(await readFile(file))
  } catch { response.writeHead(404).end() }
})
await new Promise(resolve => httpServer.listen(0, '127.0.0.1', resolve))
const baseUrl = `http://127.0.0.1:${httpServer.address().port}`
const portProbe = createTcpServer()
await new Promise(resolve => portProbe.listen(0, '127.0.0.1', resolve))
const debuggingPort = portProbe.address().port
await new Promise(resolve => portProbe.close(resolve))
const browser = spawn(browserPath, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  `--remote-debugging-port=${debuggingPort}`, `--user-data-dir=${join(artifactDirectory, 'profile')}`, 'about:blank'
], { windowsHide: true, stdio: 'ignore' })
browser.on('error', error => { console.error(error); process.exitCode = 1 })
let websocket
let sequence = 0
const callbacks = new Map()
const runtimeErrors = []
const consoleWarnings = []
const remoteRequests = []
const apiRequests = []
const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))
async function waitFor(fn, description) {
  const deadline = Date.now() + 15000
  while (Date.now() < deadline) { if (await fn()) return; await sleep(100) }
  throw new Error(`Timed out: ${description}`)
}
function send(method, params = {}) {
  const id = ++sequence
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { callbacks.delete(id); reject(new Error(`CDP timeout: ${method}`)) }, 15000)
    callbacks.set(id, { resolve, reject, timeout })
    websocket.send(JSON.stringify({ id, method, params }))
  })
}
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
  return result.result.value
}
const click = selector => evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`)
const wait = (expression, description) => waitFor(() => evaluate(expression), description)
async function navigate(path) {
  await evaluate(`location.hash = ${JSON.stringify('#' + path)}`)
}
async function fillFields(values) {
  await evaluate(`(() => {
    for (const [selector, value] of Object.entries(${JSON.stringify(values)})) {
      const element = document.querySelector(selector); element.value = value;
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }
  })()`)
}
async function fillReport(bikeId = 'BGO-1042') {
  await evaluate(`(() => {
    const values = { '#bike-id': ${JSON.stringify(bikeId)}, '#problem-type': 'BRAKES', '#description': 'El freno delantero no responde.' };
    for (const [selector, value] of Object.entries(values)) {
      const element = document.querySelector(selector); element.value = value;
      element.dispatchEvent(new Event(element.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
    }
  })()`)
  await click('.submit-button')
  await wait("!!document.querySelector('.alert-success') && !document.querySelector('.submit-button').disabled", 'report success')
}
async function screenshot(name) {
  const result = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true })
  await writeFile(join(artifactDirectory, name + '.png'), Buffer.from(result.data, 'base64'))
}
async function checkViewport(width, height, name) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 })
  await sleep(100)
  const dimensions = await evaluate('({ viewport: innerWidth, content: document.documentElement.scrollWidth })')
  assert.ok(dimensions.content <= dimensions.viewport, `${name}: horizontal overflow ${JSON.stringify(dimensions)}`)
  await screenshot(name)
}

try {
  let target
  await waitFor(async () => {
    try { target = (await (await fetch(`http://127.0.0.1:${debuggingPort}/json/list`)).json()).find(item => item.type === 'page'); return !!target }
    catch { return false }
  }, 'browser startup')
  websocket = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => { websocket.addEventListener('open', resolve, { once: true }); websocket.addEventListener('error', reject, { once: true }) })
  websocket.addEventListener('message', event => {
    const message = JSON.parse(event.data)
    if (message.id && callbacks.has(message.id)) {
      const callback = callbacks.get(message.id); callbacks.delete(message.id); clearTimeout(callback.timeout)
      if (message.error) callback.reject(new Error(JSON.stringify(message.error)))
      else callback.resolve(message.result)
    }
    if (message.method === 'Runtime.exceptionThrown') runtimeErrors.push(message.params.exceptionDetails)
    if (message.method === 'Runtime.consoleAPICalled' && ['warning', 'error'].includes(message.params.type)) consoleWarnings.push(message.params)
    if (message.method === 'Network.requestWillBeSent' && /^https?:/.test(message.params.request.url) && !message.params.request.url.startsWith(baseUrl)) {
      if (message.params.request.url.startsWith('http://127.0.0.1:3000/')) apiRequests.push(message.params.request.url)
      else remoteRequests.push(message.params.request.url)
    }
  })
  await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable')
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false })
  await send('Page.navigate', { url: baseUrl + '/#/maintenance/report' })
  await wait("!!document.querySelector('#login-email') && !!document.querySelector('#login-password')", 'IAM guard redirects to login')
  await click('.lang-toggle')
  await evaluate(`(() => {
    for (const [selector, value] of Object.entries({ '#login-email': 'operador@bicigo.test', '#login-password': 'BiciGO123!' })) {
      const input = document.querySelector(selector); input.value = value; input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  })()`)
  await evaluate("document.querySelector('form').requestSubmit()")
  await wait("!!document.querySelector('.submit-button')", 'report view')
  assert.equal(await evaluate("document.querySelector('.submit-button').disabled"), true)
  await click('.integration-notice button')
  await wait("!document.querySelector('.submit-button').disabled", 'demo activation')
  await click('.submit-button')
  await wait("document.querySelectorAll('[aria-invalid=\"true\"]').length === 3", 'required validation')
  assert.equal(await evaluate('document.activeElement.id'), 'bike-id')
  await checkViewport(1440, 1000, 'report-desktop')
  await checkViewport(768, 1024, 'report-tablet')
  await checkViewport(390, 844, 'report-mobile')
  await fillReport()
  await fillReport()
  await click('.sidebar-nav a[href="#/maintenance/management"]')
  await wait("document.querySelectorAll('.report-card').length === 2", 'report list')
  await checkViewport(1440, 1000, 'management-desktop')
  await checkViewport(768, 1024, 'management-tablet')
  await checkViewport(390, 844, 'management-mobile')
  await click('.report-actions button')
  await wait("document.querySelector('dialog').open", 'confirmation open')
  await click('.dialog-actions button:first-child')
  assert.equal(await evaluate("document.querySelectorAll('.status-maintenance').length"), 0)
  await click('.report-actions button')
  await wait("document.querySelector('dialog').open", 'second confirmation')
  await click('.dialog-actions button:last-child')
  await wait("!document.querySelector('dialog').open && document.querySelectorAll('.status-maintenance').length === 2", 'maintenance status on every report')
  await screenshot('management-mobile-maintenance')
  await click('.report-actions button')
  await wait("document.querySelector('dialog').open", 'available confirmation')
  await click('.dialog-actions button:last-child')
  await wait("!document.querySelector('dialog').open && document.querySelectorAll('.status-available').length === 2", 'available status on every report')
  await evaluate("const search = document.querySelector('.list-filters input[type=search]'); search.value = 'no-match'; search.dispatchEvent(new Event('input', { bubbles: true }))")
  await wait("document.querySelectorAll('.report-card').length === 0", 'search empty state')
  await click('.topbar .lang-toggle')
  await wait("document.querySelector('h1').textContent === 'Maintenance management'", 'English translation')
  assert.equal(await evaluate('document.documentElement.lang'), 'en')
  assert.ok((await evaluate('document.title')).includes('Maintenance management'))
  await send('Page.reload')
  await wait("!!document.querySelector('.integration-notice button')", 'explicit demo mode after reload')
  await click('.integration-notice button')
  await wait("document.querySelectorAll('.report-card').length === 2", 'persistent reports')
  await evaluate("localStorage.setItem('bicigo_maintenance_demo_v1', '{broken')")
  await click('.heading-row button')
  await wait("!!document.querySelector('.alert-danger')", 'corrupted storage error')
  assert.equal(await evaluate("localStorage.getItem('bicigo_maintenance_demo_v1')"), '{broken')
  assert.equal(await evaluate("document.querySelector('.heading-row button').disabled"), false)
  await send('Page.navigate', { url: baseUrl + '/#/missing-route' })
  await wait("document.querySelector('h1')?.textContent === '404'", 'not-found view')
  await click('main a, #app a.btn')
  await wait("!!document.querySelector('.current-plan')", 'not-found link')

  // Cross-context flows use one IAM identity and one shared API.
  await navigate('/app/trips')
  await wait("document.querySelector('.p-datatable-tbody')?.innerText.includes('TRIP-002') && !!document.querySelector('.p-datatable-tbody button')", 'operator trips')
  assert.ok(!(await evaluate("document.querySelector('.p-datatable-tbody').innerText")).includes('TRIP-001'), 'Do not show another user trips')
  await checkViewport(390, 844, 'trips-mobile')
  await click('.p-datatable-tbody button:last-child')
  await wait("document.querySelector('#bike-id')?.value === 'BGO-2000'", 'Trip passes bicycle ID to Maintenance')

  await navigate('/billing/plans')
  await wait("document.querySelectorAll('.plan-card').length === 2 && !!document.querySelector('.improve-btn')", 'billing plans')
  assert.ok((await evaluate('document.querySelector("h1").innerText')).includes('Operador Demo'))
  await checkViewport(390, 844, 'billing-mobile')
  await click('.improve-btn')
  await wait("!!document.querySelector('#cardNumber') && !!document.querySelector('.form-card button')", 'payment view')
  await click('.form-card button')
  await wait("document.querySelector('#cardNumber').value.length > 0 && !!document.querySelector('.pay-btn')", 'demo card generated')
  await click('.pay-btn')
  await wait("!!document.querySelector('.success-card')", 'purchase and IAM plan synchronization')
  assert.equal(fixture.subscriptions.at(-1).userId, 2, 'Billing uses the authenticated user instead of a fixed ID')
  assert.equal(fixture.users.find(user => user.id === 2).plan, 'pro', 'Persist plan in IAM profile')
  assert.ok(/^\*\*\*\*\d{4}$/.test(fixture.paymentMethods.at(-1).token))
  assert.equal(fixture.paymentMethods.at(-1).cvv, undefined)
  await navigate('/app/dashboard')
  await wait("document.querySelector('.current-plan strong')?.innerText === 'Pro'", 'dashboard reflects subscription')
  await checkViewport(1440, 1000, 'dashboard-desktop')
  await checkViewport(768, 1024, 'dashboard-tablet')
  await checkViewport(390, 844, 'dashboard-mobile')
  await navigate('/app/profile')
  await wait("document.querySelectorAll('.profile-form-col input').length === 5", 'IAM profile')
  await fillFields({ '.profile-form-col input[type=text]': 'Operador actualizado' })
  await evaluate("document.querySelector('.profile-form-col form').requestSubmit()")
  await wait("!!document.querySelector('.profile-form-col .alert-success')", 'profile update')
  assert.equal(fixture.users.find(user => user.id === 2).username, 'Operador actualizado')
  assert.equal(await evaluate("JSON.parse(localStorage.getItem('bicigo_user')).password"), undefined, 'Never persist password in session')
  await checkViewport(390, 844, 'profile-mobile')
  await navigate('/fleet/stations')
  await wait("document.querySelector('.p-datatable-tbody')?.innerText.includes('BiciGO Centro')", 'Fleet stations from API')
  await navigate('/fleet/bicycles')
  await wait("document.querySelector('.p-datatable-tbody')?.innerText.includes('BG-001')", 'Fleet bicycles from API')

  await click('.sidebar-logout')
  await wait("!!document.querySelector('#login-password')", 'logout clears protected session')
  await fillFields({ '#login-email': 'usuario@bicigo.test', '#login-password': 'wrong-password' })
  await evaluate("document.querySelector('form').requestSubmit()")
  await wait("!!document.querySelector('.alert-danger')", 'reject wrong demo password')
  assert.equal(await evaluate("localStorage.getItem('bicigo_token')"), null)
  await fillFields({ '#login-password': 'BiciGO123!' })
  await evaluate("document.querySelector('form').requestSubmit()")
  await wait("!!document.querySelector('.current-plan')", 'normal user login')
  await navigate('/billing/success')
  await wait("document.querySelectorAll('.plan-card').length === 2", 'transaction state cleared between users')
  assert.equal(await evaluate("document.querySelector('.sidebar-nav a[href=\"#/maintenance/management\"]')"), null)
  await navigate('/maintenance/management')
  await wait("!!document.querySelector('.current-plan') && location.hash.includes('denied')", 'role guard denies operator page to normal user')
  await navigate('/app/trips')
  await wait("document.querySelector('.p-datatable-tbody')?.innerText.includes('TRIP-001')", 'normal user trips')
  assert.ok(!(await evaluate("document.querySelector('.p-datatable-tbody').innerText")).includes('TRIP-002'))

  await click('.sidebar-logout')
  await wait("!!document.querySelector('#login-password')", 'logout before registration')
  await navigate('/auth/register')
  await wait("!!document.querySelector('#reg-password') && !!document.querySelector('#reg-username')", 'registration view')
  await fillFields({ '#reg-email': 'integration-test@bicigo.test', '#reg-username': 'Cuenta nueva', '#reg-password': 'BiciGO123!', '#reg-phone': '999888777' })
  await evaluate("document.querySelector('form').requestSubmit()")
  await wait("document.querySelector('h1')?.innerText.includes('Cuenta nueva')", 'registered account dashboard')
  assert.equal(fixture.users.find(user => user.email === 'integration-test@bicigo.test').role, 'USER')

  assert.deepEqual(runtimeErrors, [], 'Browser runtime exceptions')
  assert.deepEqual(consoleWarnings, [], 'Vue/i18n/browser warnings')
  assert.ok(remoteRequests.every(url => url.startsWith('https://www.gstatic.com/')), 'Only the existing IAM Google image can be external')
  assert.ok(apiRequests.some(url => url.includes('/users?email=')), 'IAM must use the shared local API')
  assert.ok(!apiRequests.some(url => /maintenance|incident|bikes/.test(url)), 'Maintenance has no assumed backend endpoint')
  console.log('PASS: IAM login/register/profile/roles, Trip → Maintenance, Billing → IAM, Fleet stations/bicycles, Maintenance transitions/errors, routing/i18n, and desktop/tablet/mobile layouts.')
  console.log(`Screenshots: ${artifactDirectory}`)
} catch (error) {
  console.error('Browser diagnostics:', JSON.stringify({ runtimeErrors, consoleWarnings, apiRequests, body: await evaluate('document.body.innerText') }, null, 2))
  await screenshot('failure')
  console.error(`Failure screenshot: ${artifactDirectory}`)
  throw error
} finally {
  try { if (websocket?.readyState === WebSocket.OPEN) await send('Browser.close') } catch {}
  websocket?.close()
  browser.kill()
  await new Promise(resolve => httpServer.close(resolve))
  await new Promise(resolve => apiServer.close(resolve))
}
