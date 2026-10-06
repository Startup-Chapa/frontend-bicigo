export class UpdateBicycleStatusCommand {
    constructor({ bicycleId, status }) {
        this.bicycleId = bicycleId;
        this.status = status;
    }
}