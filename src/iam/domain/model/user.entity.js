import { BaseEntity } from '../../../shared/domain/model/base-entity.js';

/**
 * User entity within the IAM bounded context.
 *
 * @class User
 * @extends BaseEntity
 */
export class User extends BaseEntity {
  /**
   * @type {string}
   * @private
   */
  #email;
  /**
   * @type {string}
   * @private
   */
  #username;
  /**
   * @type {string}
   * @private
   */
  #phoneNumber;
  /**
   * @type {string}
   * @private
   */
  #segment;
  /**
   * @type {string}
   * @private
   */
  #plan;
  /**
   * @type {string}
   * @private
   */
  #location;

  /**
   * @param {Object} [params={}] - Entity attributes.
   * @param {?number} [params.id=null] - User identifier.
   * @param {string} [params.email=''] - User email address.
   * @param {string} [params.username=''] - Display name or company name.
   * @param {string} [params.phoneNumber=''] - Contact phone number.
   * @param {string} [params.segment='mining'] - User segment ('mining' | 'jewelry' | 'consumer').
   * @param {string} [params.plan='BRONZE'] - Subscription plan ('BRONZE' | 'GOLD' | 'PLATINUM').
   * @param {string} [params.location=''] - User location.
   */
  constructor({ id = null, email = '', username = '', phoneNumber = '', segment = 'mining', plan = 'BRONZE', location = '' } = {}) {
    super({ id });
    this.#email       = email;
    this.#username    = username;
    this.#phoneNumber = phoneNumber;
    this.#segment     = segment;
    this.#plan        = plan;
    this.#location    = location
  }

  /** @returns {string} */ get email()       { return this.#email; }
  /** @returns {string} */ get username()    { return this.#username; }
  /** @returns {string} */ get phoneNumber() { return this.#phoneNumber; }
  /** @returns {string} */ get segment()     { return this.#segment; }
  /** @returns {string} */ get plan()        { return this.#plan; }
  /** @returns {string} */ get location()    { return this.#location; }

  /**
   * Creates a new User with the given property overrides.
   * @param {Partial<{email:string, username:string, phoneNumber:string, segment:string, plan:string, location:string}>} changes
   * @returns {User}
   */
  clone(changes = {}) {
    return new User({
      id: this.id, email: this.#email, username: this.#username,
      phoneNumber: this.#phoneNumber, segment: this.#segment,
      plan: this.#plan, location: this.#location,
      ...changes
    });
  }
}