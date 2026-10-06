import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

const tripsEndpointPath = import.meta.env.VITE_TRIPS_ENDPOINT_PATH || "/trips";
const qrValidationsEndpointPath = import.meta.env.VITE_QR_VALIDATIONS_ENDPOINT_PATH || "/qr-validations";

/**
 * Infrastructure gateway for the Trip Management bounded context.
 * It uses the same BaseApi and BaseEndpoint approach as the reference DDD project.
 *
 * @class TripManagementApi
 * @extends BaseApi
 */
export class TripManagementApi extends BaseApi {
    #tripsEndpoint;
    #qrValidationsEndpoint;

    constructor() {
        super();
        this.#tripsEndpoint = new BaseEndpoint(this, tripsEndpointPath);
        this.#qrValidationsEndpoint = new BaseEndpoint(this, qrValidationsEndpointPath);
    }

    getTrips() {
        return this.#tripsEndpoint.getAll();
    }

    getTripById(id) {
        return this.#tripsEndpoint.getById(id);
    }

    createTrip(resource) {
        return this.#tripsEndpoint.create(resource);
    }

    updateTrip(resource) {
        return this.#tripsEndpoint.update(resource.tripId, resource);
    }

    deleteTrip(id) {
        return this.#tripsEndpoint.delete(id);
    }

    getQRValidations() {
        return this.#qrValidationsEndpoint.getAll();
    }

    createQRValidation(resource) {
        return this.#qrValidationsEndpoint.create(resource);
    }
}
