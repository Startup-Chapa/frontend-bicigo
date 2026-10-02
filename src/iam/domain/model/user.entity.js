import { BaseEntity } from '../../../shared/domain/model/base-entity.js';

export const UserStatus = Object.freeze({
    ACTIVE: 'ACTIVE',
    SUSPENDED: 'SUSPENDED'
});

export class User extends BaseEntity {
    constructor({ id = null, firstName = '', lastName = '', email = '', phone = '', status = UserStatus.ACTIVE, profile = null } = {}) {
        super({ id });
        this.#firstName = firstName;
        this.#lastName  = lastName;
        this.#email     = email;
        this.#phone     = phone;
        this.#status    = status;
        this.#profile   = profile;
    }

    get fullName() { return [this.#firstName, this.#lastName].filter(Boolean).join(' '); }

    get initials() {
        const letters = [this.#firstName, this.#lastName].filter(Boolean).map(n => n[0]).join('');
        return (letters || this.#email[0] || 'U').slice(0, 2).toUpperCase();
    }

    get isSuspended() { return this.#status === UserStatus.SUSPENDED; }

    clone(changes = {}) {
        return new User({
            id: this.id, firstName: this.#firstName, lastName: this.#lastName,
            email: this.#email, phone: this.#phone, status: this.#status,
            profile: this.#profile,
            ...changes
        });
    }
}