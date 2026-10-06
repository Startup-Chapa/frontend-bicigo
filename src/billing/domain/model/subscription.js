/**
 * Subscription domain entity.
 */
export class Subscription {
  /**
   * @param {Object} props
   * @param {number|string} [props.id]
   * @param {number|string} props.userId
   * @param {number|string} props.planId
   * @param {string} props.planType
   * @param {number} props.price
   * @param {string} props.startDate
   * @param {string} [props.endDate]
   * @param {string} props.status
   */
  constructor({ id, userId, planId, planType, price, startDate, endDate, status }) {
    this.id = id
    this.userId = userId
    this.planId = planId
    this.planType = planType
    this.price = price
    this.startDate = startDate
    this.endDate = endDate
    this.status = status ?? 'ACTIVE'
  }
}
