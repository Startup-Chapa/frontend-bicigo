import { MaintenanceReport } from '../domain/model/maintenance.entity.js'

export class MaintenanceAssembler {
  static toEntityFromResource(resource) {
    if (!resource || typeof resource !== 'object' || Array.isArray(resource) ||
      !['string', 'number'].includes(typeof resource.reportId) || !String(resource.reportId).trim() ||
      !['string', 'number'].includes(typeof resource.bikeId) || !String(resource.bikeId).trim() ||
      typeof resource.problemType !== 'string' || typeof resource.description !== 'string' ||
      (resource.status != null && typeof resource.status !== 'string') ||
      (resource.createdAt != null && typeof resource.createdAt !== 'string')) {
      throw Object.assign(new Error('Invalid maintenance resource'), { code: 'invalidResponse' })
    }
    return new MaintenanceReport(resource)
  }

  static toEntitiesFromResponse(response) {
    if (response.status !== 200 || !Array.isArray(response.data)) {
      throw Object.assign(new Error('Invalid maintenance collection'), { code: 'invalidResponse' })
    }
    const reports = response.data.map(resource => this.toEntityFromResource(resource))
    if (new Set(reports.map(report => String(report.reportId))).size !== reports.length) {
      throw Object.assign(new Error('Duplicate report identifiers'), { code: 'invalidResponse' })
    }
    return reports
  }

  static toResourceFromEntity(report) {
    return { bikeId: report.bikeId.trim(), problemType: report.problemType, description: report.description.trim() }
  }
}
