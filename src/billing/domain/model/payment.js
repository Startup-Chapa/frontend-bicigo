/**
 * Payment domain entity.
 */
export class Payment {
  /**
   * @param {Object} props
   * @param {number|string} [props.id]
   * @param {number|string} props.subscriptionId
   * @param {number} props.amount
   * @param {string} props.currency
   * @param {string} props.status
   * @param {boolean} [props.isAutomatic]
   * @param {string} props.createdAt
   */
  constructor({ id, subscriptionId, amount, currency, status, isAutomatic, createdAt }) {
    this.id = id
    this.subscriptionId = subscriptionId
    this.amount = amount
    this.currency = currency ?? 'PEN'
    this.status = status ?? 'COMPLETED'
    this.isAutomatic = Boolean(isAutomatic)
    this.createdAt = createdAt ?? new Date().toISOString()
  }
}
