/**
 * Payment domain entity.
 */
export const PAYMENT_TYPES = Object.freeze({
  CHARGE: 'CHARGE',
  TOPUP: 'TOPUP'
})

export class Payment {
  /**
   * @param {Object} props
   * @param {number|string} [props.id]
   * @param {number|string|null} [props.subscriptionId]
   * @param {string|null} [props.tripId]
   * @param {number|string|null} [props.userId]
   * @param {string|null} [props.type]
   * @param {number} props.amount
   * @param {string} props.currency
   * @param {string} props.status
   * @param {boolean} [props.isAutomatic]
   * @param {string} props.createdAt
   */
  constructor({ id, subscriptionId = null, tripId = null, userId = null, type = null, amount, currency, status, isAutomatic, createdAt }) {
    this.id = id
    this.subscriptionId = subscriptionId ?? null
    this.tripId = tripId ?? null
    this.userId = userId ?? null
    this.type = type ?? null
    this.amount = amount
    this.currency = currency ?? 'PEN'
    this.status = status ?? 'COMPLETED'
    this.isAutomatic = Boolean(isAutomatic)
    this.createdAt = createdAt ?? new Date().toISOString()
  }
}
