import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'

class IamApi extends BaseApi {
  #users

  constructor() {
    super()
    this.#users = new BaseEndpoint(this.http, '/users')
  }

  async login(email, password) {
    const res = await this.#users.getAll({ email: email.trim().toLowerCase() })
    return { ...res, data: res.data.filter(user => user.password === password) }
  }

  async register(data) {
    const email = data.email.trim().toLowerCase()
    const existing = await this.#users.getAll({ email })
    if (existing.data.length) throw new Error("Email already registered")
    return this.#users.create({ ...data, email, role: "USER" })
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