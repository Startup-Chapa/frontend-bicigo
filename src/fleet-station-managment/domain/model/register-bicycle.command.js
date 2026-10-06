export class RegisterBicycleCommand {
    constructor({ serialNumber, bikeCode, qrCode, model, currentBikePointId = null }) {
        this.serialNumber = serialNumber;
        this.bikeCode = bikeCode;
        this.qrCode = qrCode;
        this.model = model;
        this.currentBikePointId = currentBikePointId;
    }
}