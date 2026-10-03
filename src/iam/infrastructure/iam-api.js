import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'

class IamApi extends BaseApi {
  #users

  constructor() {
    super()
    this.#users = new BaseEndpoint(this.http, '/users')
  }

  async login(email, password) {
    const res = await this.#users.getAll({ email })
    return res
  }

  register(data) {
    return this.#users.create(data)
  }

  getProfile(id) {
    return this.#users.getById(id)
  }

  updateProfile(id, data) {
    return this.#users.patch(id, data)
  }

  requestPasswordReset(email) {
    return this.#users.getAll({ email })
  }
}

export const iamApi = new IamApi()