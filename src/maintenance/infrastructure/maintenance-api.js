import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'
import { MaintenanceDemoApi } from './maintenance-demo-api.js'

/**
 * No production endpoint is assumed. Once the backend contract is confirmed,
 * supply the reports path and a status transport using this.http.
 * Normalize real responses into the frontend model in the assembler.
 */
export class MaintenanceApi extends BaseApi {
  constructor({ reportsPath = null, statusTransport = null } = {}) {
    super()
    this.reportsEndpoint = reportsPath ? new BaseEndpoint(this, reportsPath) : null
    this.statusTransport = statusTransport
    this.demo = null
  }

  enableDemo() { this.demo = new MaintenanceDemoApi() }

  requireIntegration() {
    throw Object.assign(new Error('Maintenance backend contract is pending'), { code: 'integrationPending' })
  }

  getReports() {
    if (this.demo) return this.demo.getReports()
    if (this.reportsEndpoint) return this.reportsEndpoint.getAll()
    return this.requireIntegration()
  }

  createReport(resource) {
    if (this.demo) return this.demo.createReport(resource)
    if (this.reportsEndpoint) return this.reportsEndpoint.create(resource)
    return this.requireIntegration()
  }

  updateBikeStatus(bikeId, status, expectedStatus) {
    if (this.demo) return this.demo.updateBikeStatus(bikeId, status, expectedStatus)
    if (this.statusTransport) return this.statusTransport(this.http, bikeId, status, expectedStatus)
    return this.requireIntegration()
  }
}

export const maintenanceApi = new MaintenanceApi()
