import { BikePoint } from '../domain/model/bike-point.entity.js';

export class BikePointAssembler {
    static toEntityFromResource(resource) {
        if (!resource) return null;
        return new BikePoint({
            bikePointId: resource.id || resource.bikePointId,
            name: resource.name,
            district: resource.district,
            address: resource.address,
            latitude: resource.latitude,
            longitude: resource.longitude,
            capacity: resource.capacity,
            availableSlots: resource.availableSlots,
            currentBicyclesCount: resource.currentBicyclesCount,
            status: resource.status
        });
    }

    static toEntitiesFromResponse(response) {
        const data = Array.isArray(response) ? response : (response?.data || []);
        return data.map(resource => this.toEntityFromResource(resource));
    }

    static toResourceFromEntity(entity) {
        return {
            id: entity.bikePointId,
            name: entity.name,
            district: entity.district,
            address: entity.address,
            latitude: entity.latitude,
            longitude: entity.longitude,
            capacity: entity.capacity,
            availableSlots: entity.availableSlots,
            currentBicyclesCount: entity.currentBicyclesCount,
            status: entity.status
        };
    }
}