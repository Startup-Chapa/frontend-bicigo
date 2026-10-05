import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'

const plansPath = import.meta.env.VITE_PLANS_ENDPOINT_PATH
const subscriptionsPath = import.meta.env.VITE_SUBSCRIPTIONS_ENDPOINT_PATH
const paymentsPath = import.meta.env.VITE_PAYMENTS_ENDPOINT_PATH
const paymentMethodsPath = import.meta.env.VITE_PAYMENT_METHODS_ENDPOINT_PATH

/**
 * Billing bounded context API client.
 */
export class BillingApi extends BaseApi {
  #plans
  #subscriptions
  #payments
  #paymentMethods

  constructor() {
    super()
    this.#plans = new BaseEndpoint(this, plansPath)
    this.#subscriptions = new BaseEndpoint(this, subscriptionsPath)
    this.#payments = new BaseEndpoint(this, paymentsPath)
    this.#paymentMethods = new BaseEndpoint(this, paymentMethodsPath)
  }

  get plans() { return this.#plans }
  get subscriptions() { return this.#subscriptions }
  get payments() { return this.#payments }
  get paymentMethods() { return this.#paymentMethods }
}

export const billingApi = new BillingApi()
