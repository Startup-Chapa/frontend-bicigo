export class BaseEndpoint {
  #http
  #resource

  constructor(http, resource) {
    this.#http = http.http ?? http
    this.#resource = resource
  }

  getAll(params = {})       { return this.#http.get(this.#resource, { params }) }
  getById(id)               { return this.#http.get(`${this.#resource}/${encodeURIComponent(id)}`) }
  create(data)              { return this.#http.post(this.#resource, data) }
  update(id, data)          { return this.#http.put(`${this.#resource}/${encodeURIComponent(id)}`, data) }
  patch(id, data)           { return this.#http.patch(`${this.#resource}/${encodeURIComponent(id)}`, data) }
  delete(id)                { return this.#http.delete(`${this.#resource}/${encodeURIComponent(id)}`) }
}
