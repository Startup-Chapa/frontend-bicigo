import { BikePointStatus } from './bike-point-status.enum.js';

export class BikePoint {
    /**
     * @param {Object} params
     * @param {string|null} params.bikePointId
     * @param {string} params.name
     * @param {string} params.district
     * @param {string} params.address
     * @param {number} params.latitude
     * @param {number} params.longitude
     * @param {number} params.capacity
     * @param {number} [params.availableSlots=0]
     * @param {number} [params.currentBicyclesCount=0]
     * @param {string} [params.status=BikePointStatus.OPERATIONAL]
     */
    constructor({
                    bikePointId = null,
                    name = '',
                    district = '',
                    address = '',
                    latitude = 0.0,
                    longitude = 0.0,
                    capacity = 0,
                    availableSlots = 0,
                    currentBicyclesCount = 0,
                    status = BikePointStatus.OPERATIONAL
                } = {}) {
        this.bikePointId = bikePointId;
        this.name = name;
        this.district = district;
        this.address = address;
        this.latitude = Number(latitude);
        this.longitude = Number(longitude);
        this.capacity = Number(capacity);
        this.currentBicyclesCount = Number(currentBicyclesCount);
        this.availableSlots = availableSlots !== undefined
            ? Number(availableSlots)
            : Math.max(0, this.capacity - this.currentBicyclesCount);
        this.status = status;
    }

    getAvailableSlots() {
        return Math.max(0, this.capacity - this.currentBicyclesCount);
    }

    updateStatus(newStatus) {
        if (!Object.values(BikePointStatus).includes(newStatus)) {
            throw new Error(`Invalid bike point status: ${newStatus}`);
        }
        this.status = newStatus;
    }

    assignCapacity(newCapacity) {
        if (newCapacity < this.currentBicyclesCount) {
            throw new Error('New capacity cannot be lower than current bicycles count.');
        }
        this.capacity = Number(newCapacity);
        this.availableSlots = this.getAvailableSlots();
        if (this.availableSlots === 0 && this.status === BikePointStatus.OPERATIONAL) {
            this.status = BikePointStatus.FULL;
        }
    }

    disable() {
        this.status = BikePointStatus.DISABLED;
    }

    addBicycle() {
        if (this.currentBicyclesCount >= this.capacity) {
            throw new Error('BikePoint is full. Cannot dock more bicycles.');
        }
        this.currentBicyclesCount++;
        this.availableSlots = this.getAvailableSlots();
        if (this.availableSlots === 0) {
            this.status = BikePointStatus.FULL;
        }
    }

    removeBicycle() {
        if (this.currentBicyclesCount <= 0) {
            throw new Error('No bicycles available at this BikePoint.');
        }
        this.currentBicyclesCount--;
        this.availableSlots = this.getAvailableSlots();
        if (this.status === BikePointStatus.FULL) {
            this.status = BikePointStatus.OPERATIONAL;
        }
    }
}