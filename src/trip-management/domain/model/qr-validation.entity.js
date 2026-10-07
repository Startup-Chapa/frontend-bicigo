/**
 * QR validation entity within the Trip Management bounded context.
 *
 * @class QRValidation
 */
export class QRValidation {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?string} [params.validationId=null] - Validation identifier.
     * @param {string} [params.tripId=''] - Related trip identifier.
     * @param {string} [params.bicycleId=''] - Related bicycle identifier.
     * @param {string} [params.qrCodeSnapshot=''] - QR code captured during validation.
     * @param {?string} [params.validatedAt=null] - Validation date and time.
     * @param {string} [params.result='PENDING'] - Validation result.
     */
    constructor({
        validationId = null,
        tripId = '',
        bicycleId = '',
        qrCodeSnapshot = '',
        validatedAt = null,
        result = 'PENDING'
    }) {
        this.validationId = validationId;
        this.tripId = tripId;
        this.bicycleId = bicycleId;
        this.qrCodeSnapshot = qrCodeSnapshot;
        this.validatedAt = validatedAt;
        this.result = result;
    }

    /**
     * Validates the scanned QR code against the expected bicycle code.
     *
     * @param {string} expectedQrCode - Expected bicycle QR code.
     * @returns {boolean} True when the QR code is valid.
     */
    validate(expectedQrCode) {
        if (!this.qrCodeSnapshot || !expectedQrCode) {
            this.result = 'INVALID';
            this.validatedAt = new Date().toISOString();
            return false;
        }

        const isValid = this.qrCodeSnapshot === expectedQrCode;
        this.result = isValid ? 'VALID' : 'INVALID';
        this.validatedAt = new Date().toISOString();
        return isValid;
    }
}
