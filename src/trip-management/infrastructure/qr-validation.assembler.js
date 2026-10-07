import {QRValidation} from "../domain/model/qr-validation.entity.js";

/**
 * Maps QR validation resources into domain entities.
 *
 * @class QRValidationAssembler
 */
export class QRValidationAssembler {
    static toEntityFromResource(resource) {
        return new QRValidation({...resource});
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        const resources = response.data instanceof Array ? response.data : response.data['qrValidations'];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
