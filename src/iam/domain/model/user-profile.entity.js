import { BaseEntity } from '../../../shared/domain/model/base-entity.js';

export const DocumentType = Object.freeze({
    DNI: 'DNI',
    CE: 'CE',
    PASSPORT: 'PASSPORT'
});

export class UserProfile extends BaseEntity {
    /** @type {string} @private */ #userId;
    /** @type {string} @private */ #documentType;
    /** @type {string} @private */ #documentNumber;
    /** @type {string} @private */ #photoUrl;
    /** @type {string} @private */ #emergencyContact;

    constructor({ id = null, userId = '', documentType = '', documentNumber = '', photoUrl = '', emergencyContact = '' } = {}) {
        super({ id });
        this.#userId           = userId;
        this.#documentType     = documentType;
        this.#documentNumber   = documentNumber;
        this.#photoUrl         = photoUrl;
        this.#emergencyContact = emergencyContact;
    }

    clone(changes = {}) {
        return new UserProfile({
            id: this.id, userId: this.#userId, documentType: this.#documentType,
            documentNumber: this.#documentNumber, photoUrl: this.#photoUrl,
            emergencyContact: this.#emergencyContact,
            ...changes
        });
    }
}