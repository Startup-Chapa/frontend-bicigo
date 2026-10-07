import { BIKE_STATUSES, validateReport, nextBikeStatus } from '../domain/model/maintenance.entity.js'
import { MaintenanceAssembler } from './maintenance.assembler.js'

const STORAGE_KEY = 'bicigo_maintenance_demo_v1'
const pause = () => new Promise(resolve => setTimeout(resolve, 250))
const failure = code => Object.assign(new Error(code), { code })

/** Explicit local simulation; never used as fallback for a failed HTTP request. */
export class MaintenanceDemoApi {
  constructor(storage = globalThis.localStorage) { this.storage = storage }

  read() {
    let raw
    try { raw = this.storage.getItem(STORAGE_KEY) } catch { throw failure('storageUnavailable') }
    if (!raw) return []
    try {
      return MaintenanceAssembler.toEntitiesFromResponse({ status: 200, data: JSON.parse(raw) })
    } catch { throw failure('invalidDemoData') }
  }

  write(reports) {
    try { this.storage.setItem(STORAGE_KEY, JSON.stringify(reports)) }
    catch { throw failure('storageUnavailable') }
  }

  async getReports() {
    await pause()
    return { status: 200, data: this.read() }
  }

  async createReport(resource) {
    await pause()
    if (Object.keys(validateReport(resource)).length) throw failure('invalidReport')
    const reports = this.read()
    const report = {
      ...resource,
      reportId: globalThis.crypto.randomUUID(),
      status: reports.find(item => item.bikeId === resource.bikeId)?.status ?? BIKE_STATUSES.AVAILABLE,
      createdAt: new Date().toISOString()
    }
    this.write([report, ...reports])
    return { status: 201, data: report }
  }

  async updateBikeStatus(bikeId, status, expectedStatus) {
    await pause()
    const reports = this.read()
    const report = reports.find(item => item.bikeId === bikeId)
    if (!report) throw failure('notFound')
    if (report.status !== expectedStatus) throw failure('conflict')
    if (nextBikeStatus(report.status) !== status) throw failure('invalidTransition')
    this.write(reports.map(item => item.bikeId === bikeId ? { ...item, status } : item))
    return { status: 200, data: { bikeId, status } }
  }
}
