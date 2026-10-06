export class BicycleResource {
    constructor({ id, bicycleId, serialNumber, bikeCode, qrCode, model, status, currentBikePointId }) {
        this.id = id || bicycleId;
        this.bicycleId = this.id;
        this.serialNumber = serialNumber;
        this.bikeCode = bikeCode;
        this.qrCode = qrCode;
        this.model = model;
        this.status = status;
        this.currentBikePointId = currentBikePointId;
    }
}