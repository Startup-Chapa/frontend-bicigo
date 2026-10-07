export class UnlockBicycleCommand {
    constructor({ bicycleId, userId }) {
        this.bicycleId = bicycleId;
        this.userId = userId;
    }
}