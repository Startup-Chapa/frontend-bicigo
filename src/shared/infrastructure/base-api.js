import axios from 'axios'

export class BaseApi {
  #http

  constructor() {
    this.#http = axios.create({
      baseURL: import.meta.env.VITE_BICIGO_API_URL || import.meta.env.VITE_LEARNING_PLATFORM_API_URL,
      headers: { 'Content-Type': 'application/json' }
    })

    this.#http.interceptors.request.use(config => {
      const token = localStorage.getItem('bicigo_token')
      if (token) config.headers.Authorization = `Bearer ${token}`
      return config
    })
  }

  get http() { return this.#http }
}