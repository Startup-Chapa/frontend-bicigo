export const PROBLEM_TYPES = Object.freeze(['BRAKES', 'CHAIN', 'WHEEL', 'SEAT', 'LIGHTS', 'OTHER'])
export const BIKE_STATUSES = Object.freeze({ AVAILABLE: 'AVAILABLE', MAINTENANCE: 'MAINTENANCE' })
export const REPORT_LIMITS = Object.freeze({ bikeId: 64, descriptionMin: 10, descriptionMax: 1000 })

export function validateReport({ bikeId, problemType, description } = {}) {
  const errors = {}
  if (typeof bikeId !== 'string' || !bikeId.trim()) errors.bikeId = 'bikeRequired'
  else if (bikeId.trim().length > REPORT_LIMITS.bikeId || /[\u0000-\u001f\u007f]/.test(bikeId)) errors.bikeId = 'bikeInvalid'
  if (!PROBLEM_TYPES.includes(problemType)) errors.problemType = 'typeRequired'
  if (typeof description !== 'string' || description.trim().length < REPORT_LIMITS.descriptionMin) errors.description = 'descriptionShort'
  else if (description.trim().length > REPORT_LIMITS.descriptionMax) errors.description = 'descriptionLong'
  return errors
}

/** Frontend model. status is the bicycle status, not an incident lifecycle. */
export class MaintenanceReport {
  constructor({ reportId = null, bikeId = '', problemType = '', description = '', status = null, createdAt = null } = {}) {
    this.reportId = reportId
    this.bikeId = String(bikeId).trim()
    this.problemType = problemType
    this.description = description
    this.status = status
    this.createdAt = createdAt
  }
}

export function nextBikeStatus(status) {
  if (status === BIKE_STATUSES.AVAILABLE) return BIKE_STATUSES.MAINTENANCE
  if (status === BIKE_STATUSES.MAINTENANCE) return BIKE_STATUSES.AVAILABLE
  return null
}
