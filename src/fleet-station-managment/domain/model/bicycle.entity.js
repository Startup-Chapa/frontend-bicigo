import { BicycleStatus } from './bicycle-status.enum.js';

export class Bicycle {
    /**
     * @param {Object} params
     * @param {string|null} params.bicycleId
     * @param {string} params.serialNumber
     * @param {string} params.bikeCode
     * @param {string} params.qrCode
     * @param {string} params.model
     * @param {string} [params.status=BicycleStatus.AVAILABLE]
     * @param {string|null} [params.currentBikePointId=null]
     */
    constructor({
                    bicycleId = null,
                    serialNumber = '',
                    bikeCode = '',
                    qrCode = '',
                    model = '',
                    status = BicycleStatus.AVAILABLE,
                    currentBikePointId = null
                } = {}) {
        this.bicycleId = bicycleId;
        this.serialNumber = serialNumber;
        this.bikeCode = bikeCode;
        this.qrCode = qrCode;
        this.model = model;
        this.status = status;
        this.currentBikePointId = currentBikePointId;
    }

    register(serialNumber, bikeCode, qrCode, model) {
        if (!serialNumber || !bikeCode) {
            throw new Error('Serial number and bike code are required to register a bicycle.');
        }
        this.serialNumber = serialNumber;
        this.bikeCode = bikeCode;
        this.qrCode = qrCode;
        this.model = model;
        this.status = BicycleStatus.AVAILABLE;
    }

    unlock() {
        if (this.status !== BicycleStatus.AVAILABLE) {
            throw new Error(`Cannot unlock bicycle. Current status is ${this.status}.`);
        }
        this.status = BicycleStatus.IN_USE;
    }

    updateStatus(newStatus) {
        if (!Object.values(BicycleStatus).includes(newStatus)) {
            throw new Error(`Invalid bicycle status: ${newStatus}`);
        }
        this.status = newStatus;
    }

    assignToBikePoint(bikePointId) {
        if (!bikePointId) {
            throw new Error('A valid bikePointId is required.');
        }
        this.currentBikePointId = bikePointId;
        if (this.status === BicycleStatus.IN_USE) {
            this.status = BicycleStatus.AVAILABLE;
        }
    }

    removeFromBikePoint() {
        this.currentBikePointId = null;
    }
}