/**
 * Shared base class for all domain entities.
 * Provides a common identifier property inherited by every bounded context entity.
 *
 * @class BaseEntity
 */
export class BaseEntity {
  /**
   * @type {?number}
   * @private
   */
  #id;

  /**
   * @param {Object} [params={}] - Entity attributes.
   * @param {?number} [params.id=null] - Entity identifier.
   */
  constructor({ id = null } = {}) {
    this.#id = id
  }

  /**
   * Gets the entity identifier.
   * @returns {?number}
   */
  get id() { return this.#id; }
}
