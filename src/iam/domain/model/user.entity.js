import { BaseEntity } from '../../../shared/domain/model/base-entity.js';

export const UserStatus = Object.freeze({
    ACTIVE: 'ACTIVE',
    SUSPENDED: 'SUSPENDED'
});

export class User extends BaseEntity {
    /** @type {string} @private */ #firstName;
    /** @type {string} @private */ #lastName;
    /** @type {string} @private */ #email;
    /** @type {string} @private */ #phone;
    /** @type {string} @private */ #status;

    constructor({ id = null, firstName = '', lastName = '', email = '', phone = '', status = UserStatus.ACTIVE } = {}) {
        super({ id });
        this.#firstName = firstName;
        this.#lastName  = lastName;
        this.#email     = email;
        this.#phone     = phone;
        this.#status    = status;
    }

    /** @returns {string} */ get firstName() { return this.#firstName; }
    /** @returns {string} */ get lastName()  { return this.#lastName; }
    /** @returns {string} */ get email()     { return this.#email; }
    /** @returns {string} */ get phone()     { return this.#phone; }
    /** @returns {string} */ get status()    { return this.#status; }

    get fullName() {
        return [this.#firstName, this.#lastName].filter(Boolean).join(' ');
    }

    get initials() {
        const letters = [this.#firstName, this.#lastName].filter(Boolean).map(n => n[0]).join('');
        return (letters || this.#email[0] || 'U').slice(0, 2).toUpperCase();
    }

    get isSuspended() {
        return this.#status === UserStatus.SUSPENDED;
    }

    clone(changes = {}) {
        return new User({
            id: this.id, firstName: this.#firstName, lastName: this.#lastName,
            email: this.#email, phone: this.#phone, status: this.#status,
            ...changes
        });
    }
}