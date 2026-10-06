export class BikePointResource {
    constructor({
                    id,
                    bikePointId,
                    name,
                    district,
                    address,
                    latitude,
                    longitude,
                    capacity,
                    availableSlots,
                    currentBicyclesCount,
                    status
                }) {
        this.id = id || bikePointId;
        this.bikePointId = this.id;
        this.name = name;
        this.district = district;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
        this.capacity = capacity;
        this.availableSlots = availableSlots;
        this.currentBicyclesCount = currentBicyclesCount;
        this.status = status;
    }
}