import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFile } from 'node:fs/promises'
import { createServer } from 'vite'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import jsonServer from 'json-server'
import { BaseEndpoint } from '../src/shared/infrastructure/base-endpoint.js'

test('shared endpoints support IAM query parameters, PATCH and existing context clients', async () => {
  const calls = []
  const http = { get: (...args) => calls.push(['GET', ...args]), patch: (...args) => calls.push(['PATCH', ...args]) }
  const endpoint = new BaseEndpoint({ http }, '/users')
  endpoint.getAll({ email: 'demo@example.test' })
  endpoint.patch('user/1', { plan: 'pro' })
  assert.deepEqual(calls, [
    ['GET', '/users', { params: { email: 'demo@example.test' } }],
    ['PATCH', '/users/user%2F1', { plan: 'pro' }]
  ])
})

test('both locale catalogs have matching keys and every message compiles', async () => {
  const es = JSON.parse(await readFile('src/locales/es.json', 'utf8'))
  const en = JSON.parse(await readFile('src/locales/en.json', 'utf8'))
  const keys = (object, prefix = '') => Object.entries(object).flatMap(([key, value]) => typeof value === 'object' ? keys(value, prefix + key + '.') : [prefix + key])
  assert.deepEqual(keys(es).sort(), keys(en).sort())
  const i18n = createI18n({ legacy: false, locale: 'es', messages: { es, en } })
  const params = { name: 'Demo', bikeId: 'B1', id: '1', from: 'AVAILABLE', to: 'MAINTENANCE', count: 1, max: 1000, 'unavailable-route': '/404' }
  for (const locale of ['es', 'en']) {
    i18n.global.locale.value = locale
    for (const key of keys(es)) assert.equal(typeof i18n.global.t(key, params), 'string')
    assert.ok(i18n.global.t('integration.demoAccount').includes('@bicigo.test'))
  }
})

test('IAM session, Billing purchase and profile share user identity without persisting credentials', async () => {
  const fixture = JSON.parse(await readFile('server/db.json', 'utf8'))
  const app = jsonServer.create()
  app.use(jsonServer.defaults({ logger: false }))
  app.use(jsonServer.bodyParser)
  app.use(jsonServer.router(fixture))
  const apiServer = await new Promise(resolve => { const server = app.listen(0, '127.0.0.1', () => resolve(server)) })
  const vite = await createServer({ server: { middlewareMode: true, hmr: false } })
  const previousStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  const values = new Map()
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key)
  } })
  try {
    const { iamApi } = await vite.ssrLoadModule('/src/iam/infrastructure/iam-api.js')
    const { billingApi } = await vite.ssrLoadModule('/src/billing/infrastructure/billing-api.js')
    const url = `http://127.0.0.1:${apiServer.address().port}`
    iamApi.http.defaults.baseURL = url
    billingApi.http.defaults.baseURL = url
    const { useIamStore } = await vite.ssrLoadModule('/src/iam/application/iam.store.js')
    const { useBillingStore } = await vite.ssrLoadModule('/src/billing/application/billing-store.js')
    setActivePinia(createPinia())
    const iam = useIamStore()
    const billing = useBillingStore()
    assert.equal(await iam.login('operador@bicigo.test', 'wrong'), false)
    assert.equal(iam.isAuthenticated, false)
    assert.equal(await iam.login('operador@bicigo.test', 'BiciGO123!'), true)
    assert.equal(iam.canManageMaintenance, true)
    assert.equal(iam.currentUser.password, undefined)
    assert.equal(JSON.parse(values.get('bicigo_user')).password, undefined)
    await billing.fetchPlans()
    assert.equal(billing.plans.length, 2)
    await assert.rejects(billing.purchaseSubscription({ plan: billing.plans[1] }))
    await billing.purchaseSubscription({ userId: iam.currentUser.id, plan: billing.plans[1], card: { cardNumber: '4111 1111 1111 1234' } })
    assert.equal(billing.lastSubscription.userId, 2)
    assert.equal(fixture.paymentMethods.at(-1).token, '****1234')
    assert.equal(await iam.updateProfile({ plan: 'pro' }), true)
    assert.equal(iam.isPro, true)
    assert.equal(fixture.users.find(user => user.id === 2).plan, 'pro')
    assert.equal(iam.currentUser.password, undefined)
    iam.logout()
    assert.equal(iam.isAuthenticated, false)
    assert.equal(values.get('bicigo_user'), undefined)
    assert.equal(await iam.register({ email: 'NEW@bicigo.test', username: 'New user', password: 'demo', role: 'ADMIN' }), true)
    assert.equal(iam.currentUser.email, 'new@bicigo.test')
    assert.equal(iam.currentUser.role, 'USER')
    assert.equal(iam.canManageMaintenance, false)
    assert.equal(await iam.register({ email: 'new@bicigo.test', username: 'Duplicate', password: 'demo' }), false)

    const { FleetApi } = await vite.ssrLoadModule('/src/fleet-station-managment/infrastructure/fleet-api.js')
    const { BicycleAssembler } = await vite.ssrLoadModule('/src/fleet-station-managment/infrastructure/bicycle.assembler.js')
    const { BikePointAssembler } = await vite.ssrLoadModule('/src/fleet-station-managment/infrastructure/bike-point.assembler.js')
    const fleet = new FleetApi()
    fleet.http.defaults.baseURL = url
    const stations = BikePointAssembler.toEntitiesFromResponse(await fleet.getBikePoints())
    const bicycles = BicycleAssembler.toEntitiesFromResponse(await fleet.getBicycles())
    assert.equal(stations[0].name, 'BiciGO Centro')
    assert.ok(bicycles.some(bicycle => bicycle.currentBikePointId === stations[0].bikePointId))
    const station = await fleet.createBikePoint({ name: 'Integration station', capacity: 5, currentBicyclesCount: 0, status: 'OPERATIONAL' })
    await fleet.updateBikePoint({ ...station.data, capacity: 8 })
    assert.equal((await fleet.getBikePointById(station.data.id)).data.capacity, 8)
    await fleet.deleteBikePoint(station.data.id)
    const { TripManagementApi } = await vite.ssrLoadModule('/src/trip-management/infrastructure/trip-management-api.js')
    const { TripAssembler } = await vite.ssrLoadModule('/src/trip-management/infrastructure/trip.assembler.js')
    const tripApi = new TripManagementApi()
    tripApi.http.defaults.baseURL = url
    const tripResponse = await tripApi.getTrips()
    assert.equal(tripResponse.status, 200)
    assert.deepEqual(tripResponse.data, fixture.trips)
    const trips = TripAssembler.toEntitiesFromResponse(tripResponse)
    assert.ok(trips.some(trip => String(trip.userId) === '2'))
    assert.ok(Array.isArray((await tripApi.getQRValidations()).data))
  } finally {
    if (previousStorage) Object.defineProperty(globalThis, 'localStorage', previousStorage)
    else delete globalThis.localStorage
    await vite.close()
    await new Promise(resolve => apiServer.close(resolve))
  }
})
