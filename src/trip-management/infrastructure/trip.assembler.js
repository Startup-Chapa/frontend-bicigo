import {Trip} from "../domain/model/trip.entity.js";

/**
 * Maps Trip resources into domain entities.
 *
 * @class TripAssembler
 */
export class TripAssembler {
    static toEntityFromResource(resource) {
        return new Trip({...resource});
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        const resources = response.data instanceof Array ? response.data : response.data['trips'];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
