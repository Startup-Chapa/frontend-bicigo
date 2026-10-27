/**
 * Plan domain entity.
 */
export class Plan {
  /**
   * @param {Object} props
   * @param {number|string} props.id
   * @param {string} props.name
   * @param {string} props.type
   * @param {number} props.price
   * @param {number} props.pricePerKm
   * @param {string} props.currency
   * @param {string} props.description
   * @param {string[]} props.features
   * @param {boolean} props.recommended
   * @param {boolean} props.current
   */
  constructor({ id, name, type, price, pricePerKm, currency, description, features, recommended, current }) {
    this.id = id
    this.name = name
    this.type = type
    this.price = price
    this.pricePerKm = Number(pricePerKm) || 0
    this.currency = currency
    this.description = description
    this.features = features ?? []
    this.recommended = Boolean(recommended)
    this.current = Boolean(current)
  }
}
