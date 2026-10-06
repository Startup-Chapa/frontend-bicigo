/**
 * Trip entity within the Trip Management bounded context.
 *
 * @class Trip
 */
export class Trip {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?string} [params.tripId=null] - Trip identifier.
     * @param {string} [params.userId=''] - User identifier.
     * @param {string} [params.bicycleId=''] - Bicycle identifier.
     * @param {?string} [params.startedAt=null] - Trip start date and time.
     * @param {?string} [params.finishedAt=null] - Trip finish date and time.
     * @param {number} [params.distanceKm=0] - Distance travelled in kilometres.
     * @param {string} [params.status='PENDING'] - Trip status.
     * @param {number} [params.totalCost=0] - Calculated trip cost.
     */
    constructor({
        tripId = null,
        userId = '',
        bicycleId = '',
        startedAt = null,
        finishedAt = null,
        distanceKm = 0,
        status = 'PENDING',
        totalCost = 0
    }) {
        this.tripId = tripId;
        this.userId = userId;
        this.bicycleId = bicycleId;
        this.startedAt = startedAt;
        this.finishedAt = finishedAt;
        this.distanceKm = Number(distanceKm) || 0;
        this.status = status;
        this.totalCost = Number(totalCost) || 0;
    }

    /** Starts the trip. */
    startTrip(startedAt = new Date().toISOString()) {
        if (this.status === 'IN_PROGRESS') {
            return;
        }
        if (this.status === 'FINISHED') {
            throw new Error('A finished trip cannot be started again.');
        }
        this.startedAt = startedAt;
        this.status = 'IN_PROGRESS';
    }

    /** Finishes the trip and stores the final distance. */
    finishTrip(distanceKm, finishedAt = new Date().toISOString()) {
        if (this.status !== 'IN_PROGRESS') {
            throw new Error('Only an in-progress trip can be finished.');
        }
        this.distanceKm = Number(distanceKm);
        if (!Number.isFinite(this.distanceKm) || this.distanceKm < 0) {
            throw new Error('Distance must be a non-negative number.');
        }
        this.finishedAt = finishedAt;
        this.status = 'FINISHED';
    }

    /**
     * Calculates the trip cost using the distance and a price per kilometre.
     * Premium exemption is supplied by the caller because subscription
     * information belongs to another bounded context.
     *
     * @param {number} pricePerKm - Price charged for each kilometre.
     * @param {boolean} isPremium - Whether the user has an active Premium subscription.
     * @returns {number} Calculated cost.
     */
    calculateCost(pricePerKm = 1, isPremium = false) {
        const rate = Number(pricePerKm);
        if (!Number.isFinite(rate) || rate < 0) {
            throw new Error('Price per kilometre must be a non-negative number.');
        }
        this.totalCost = isPremium ? 0 : Number((this.distanceKm * rate).toFixed(2));
        return this.totalCost;
    }
}
