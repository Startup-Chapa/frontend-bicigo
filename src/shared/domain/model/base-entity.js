/**
 * Base class for domain entities. Holds the identity shared by every entity.
 *
 * @class BaseEntity
 */
export class BaseEntity {
    /**
     * @type {string|number|null}
     * @private
     */
    #id;

    /**
     * @param {Object} [params={}]
     * @param {string|number|null} [params.id=null] - Entity identifier.
     */
    constructor({ id = null } = {}) {
        this.#id = id;
    }

    /** @returns {string|number|null} */
    get id() { return this.#id; }
}