import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

export class FleetApi extends BaseApi {
    constructor() {
        super();
        this.bicyclesEndpoint = new BaseEndpoint(
            this,
            import.meta.env.VITE_BICYCLES_ENDPOINT_PATH || '/bicycles'
        );
        this.bikePointsEndpoint = new BaseEndpoint(
            this,
            import.meta.env.VITE_BIKE_POINTS_ENDPOINT_PATH || '/bike-points'
        );
    }

    // Bicycle API operations
    getBicycles() {
        return this.bicyclesEndpoint.getAll();
    }

    getBicycleById(id) {
        return this.bicyclesEndpoint.getById(id);
    }

    createBicycle(resource) {
        return this.bicyclesEndpoint.create(resource);
    }

    updateBicycle(resource) {
        const id = resource.id || resource.bicycleId;
        return this.bicyclesEndpoint.update(id, resource);
    }

    deleteBicycle(id) {
        return this.bicyclesEndpoint.delete(id);
    }

    // BikePoint API operations
    getBikePoints() {
        return this.bikePointsEndpoint.getAll();
    }

    getBikePointById(id) {
        return this.bikePointsEndpoint.getById(id);
    }

    createBikePoint(resource) {
        return this.bikePointsEndpoint.create(resource);
    }

    updateBikePoint(resource) {
        const id = resource.id || resource.bikePointId;
        return this.bikePointsEndpoint.update(id, resource);
    }

    deleteBikePoint(id) {
        return this.bikePointsEndpoint.delete(id);
    }
}