export class RegisterBikePointCommand {
  constructor({ name, district, address, latitude, longitude, capacity }) {
    Object.assign(this, { name, district, address, latitude, longitude, capacity: Number(capacity) })
    if (!name?.trim() || !district?.trim() || !address?.trim() || !Number.isInteger(this.capacity) || this.capacity < 1) throw new Error('Invalid bike point')
  }
}
