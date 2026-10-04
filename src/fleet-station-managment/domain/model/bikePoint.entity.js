/**
 * @param {bikePoint} params
 *      * @param {number} params.id
 *      * @param {string} params.name
 *      * @param {string} params.district
 *      * @param {string} params.address
 *      * @param {number} params.latitude
 *      * @param {number} params.longitude
 *      * @param {number} params.capacity
 *      * @param {number} params.availableSlots
 *      * @param {string} params.status
 */

export class bikePoint {
    constructor({id,name,district,address,latitude,longitude,capacity,availableSlots,status}) {
        this.id=id;
        this.name=name;
        this.district=district;
        this.address=address;
        this.latitude=latitude;
        this.longitude=longitude;
        this.capacity=capacity;
        this.availableSlots=availableSlots;
        this.status=status;
    }
}