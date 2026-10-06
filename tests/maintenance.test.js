import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createServer } from 'vite'
import { createPinia, setActivePinia } from 'pinia'
import { validateReport, nextBikeStatus } from '../src/maintenance/domain/model/maintenance.entity.js'
import { MaintenanceAssembler } from '../src/maintenance/infrastructure/maintenance.assembler.js'
import { MaintenanceDemoApi } from '../src/maintenance/infrastructure/maintenance-demo-api.js'

const valid = { bikeId: 'BGO-1042', problemType: 'BRAKES', description: 'El freno delantero no responde.' }
const memoryStorage = () => {
  const values = new Map()
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }
}

test('validation rejects missing, oversized and unsupported values', () => {
  assert.deepEqual(validateReport(valid), {})
  assert.equal(Object.keys(validateReport({})).length, 3)
  assert.equal(validateReport({ ...valid, bikeId: ' '.repeat(5) }).bikeId, 'bikeRequired')
  assert.equal(validateReport({ ...valid, bikeId: 'x'.repeat(65) }).bikeId, 'bikeInvalid')
  assert.equal(validateReport({ ...valid, bikeId: 'bike\n42' }).bikeId, 'bikeInvalid')
  assert.equal(validateReport({ ...valid, problemType: 'UNKNOWN' }).problemType, 'typeRequired')
  assert.equal(validateReport({ ...valid, description: '   short   ' }).description, 'descriptionShort')
  assert.equal(validateReport({ ...valid, description: 'x'.repeat(1001) }).description, 'descriptionLong')
  assert.equal(nextBikeStatus('AVAILABLE'), 'MAINTENANCE')
  assert.equal(nextBikeStatus('MAINTENANCE'), 'AVAILABLE')
  assert.equal(nextBikeStatus('RETIRED'), null)
})

test('assembler rejects invalid contracts and preserves unknown bike status', () => {
  assert.throws(() => MaintenanceAssembler.toEntitiesFromResponse({ status: 200, data: {} }), { code: 'invalidResponse' })
  assert.throws(() => MaintenanceAssembler.toEntityFromResource({ bikeId: 'B1' }), { code: 'invalidResponse' })
  assert.throws(() => MaintenanceAssembler.toEntityFromResource({ ...valid, reportId: 'R1', status: 123 }), { code: 'invalidResponse' })
  const report = { ...valid, reportId: 'R1', status: 'RETIRED' }
  assert.equal(MaintenanceAssembler.toEntityFromResource(report).status, 'RETIRED')
  assert.throws(() => MaintenanceAssembler.toEntitiesFromResponse({ status: 200, data: [report, report] }), { code: 'invalidResponse' })
})

test('demo persists reports, updates every report for one bike and detects stale state', async () => {
  const storage = memoryStorage()
  const api = new MaintenanceDemoApi(storage)
  assert.deepEqual((await api.getReports()).data, [])
  const first = await api.createReport(valid)
  await api.createReport({ ...valid, problemType: 'CHAIN' })
  await api.createReport({ ...valid, bikeId: 'BGO-2000' })
  assert.equal(first.status, 201)
  assert.ok(first.data.createdAt)
  await api.updateBikeStatus(valid.bikeId, 'MAINTENANCE', 'AVAILABLE')
  const persisted = (await new MaintenanceDemoApi(storage).getReports()).data
  assert.equal(persisted.filter(report => report.bikeId === valid.bikeId && report.status === 'MAINTENANCE').length, 2)
  assert.equal(persisted.find(report => report.bikeId === 'BGO-2000').status, 'AVAILABLE')
  await assert.rejects(api.updateBikeStatus(valid.bikeId, 'MAINTENANCE', 'AVAILABLE'), { code: 'conflict' })
  await assert.rejects(api.updateBikeStatus(valid.bikeId, 'MAINTENANCE', 'MAINTENANCE'), { code: 'invalidTransition' })
  await api.updateBikeStatus(valid.bikeId, 'AVAILABLE', 'MAINTENANCE')
  assert.ok((await api.getReports()).data.every(report => report.status === 'AVAILABLE'))
})

test('storage failures and corrupted data never report false success or overwrite data', async () => {
  let writes = 0
  const corrupt = new MaintenanceDemoApi({ getItem: () => '{broken', setItem: () => writes++ })
  await assert.rejects(corrupt.getReports(), { code: 'invalidDemoData' })
  await assert.rejects(corrupt.createReport(valid), { code: 'invalidDemoData' })
  assert.equal(writes, 0)
  const blocked = new MaintenanceDemoApi({ getItem: () => null, setItem: () => { throw new Error('blocked') } })
  await assert.rejects(blocked.createReport(valid), { code: 'storageUnavailable' })
})

test('Pinia handles pending integration, duplicate submissions, status updates and failures', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false } })
  const previousStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  Object.defineProperty(globalThis, 'localStorage', { value: memoryStorage(), configurable: true })
  try {
    const { useMaintenanceStore } = await server.ssrLoadModule('/src/maintenance/application/maintenance.store.js')
    setActivePinia(createPinia())
    const store = useMaintenanceStore()
    assert.equal(await store.fetchReports(), false)
    assert.equal(store.error, 'integrationPending')
    assert.equal(store.loading, false)
    assert.equal(await store.enableDemo(), true)
    assert.equal(store.loaded, true)
    const creation = store.createReport({ ...valid, bikeId: ' BGO-1042 ' })
    assert.equal(store.submitting, true)
    assert.equal(await store.createReport(valid), false)
    assert.equal(await creation, true)
    assert.equal(store.reports.length, 1)
    assert.equal(store.reports[0].bikeId, valid.bikeId)
    assert.equal(store.submitting, false)
    assert.equal(await store.createReport({ ...valid, problemType: 'CHAIN' }), true)
    assert.equal(await store.updateBikeStatus(valid.bikeId, 'MAINTENANCE', 'AVAILABLE'), true)
    assert.ok(store.reports.every(report => report.status === 'MAINTENANCE'))
    assert.equal(store.updatingBikeId, null)
    assert.equal(await store.createReport({ ...valid, description: '' }), false)
    assert.equal(store.error, 'invalidReport')
    assert.equal(store.success, null)
    globalThis.localStorage.setItem('bicigo_maintenance_demo_v1', '{broken')
    assert.equal(await store.fetchReports(), false)
    assert.equal(store.error, 'invalidDemoData')
    assert.equal(store.loading, false)
    assert.equal(store.busy, false)
  } finally {
    if (previousStorage) Object.defineProperty(globalThis, 'localStorage', previousStorage)
    else delete globalThis.localStorage
    await server.close()
  }
})
