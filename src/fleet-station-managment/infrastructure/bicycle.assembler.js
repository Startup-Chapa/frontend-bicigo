import { Bicycle } from '../domain/model/bicycle.entity.js';

export class BicycleAssembler {
    static toEntityFromResource(resource) {
        if (!resource) return null;
        return new Bicycle({
            bicycleId: resource.id || resource.bicycleId,
            serialNumber: resource.serialNumber,
            bikeCode: resource.bikeCode,
            qrCode: resource.qrCode,
            model: resource.model,
            status: resource.status,
            currentBikePointId: resource.currentBikePointId
        });
    }

    static toEntitiesFromResponse(response) {
        const data = Array.isArray(response) ? response : (response?.data || []);
        return data.map(resource => this.toEntityFromResource(resource));
    }

    static toResourceFromEntity(entity) {
        return {
            id: entity.bicycleId,
            serialNumber: entity.serialNumber,
            bikeCode: entity.bikeCode,
            qrCode: entity.qrCode,
            model: entity.model,
            status: entity.status,
            currentBikePointId: entity.currentBikePointId
        };
    }
}