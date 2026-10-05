import { defineStore } from 'pinia'
import { billingApi } from '../infrastructure/billing-api.js'
import { Plan } from '../domain/model/plan.js'
import { Subscription } from '../domain/model/subscription.js'
import { Payment } from '../domain/model/payment.js'

export const useBillingStore = defineStore('billing', {
  state: () => ({
    plans: [],
    selectedPlan: null,
    lastSubscription: null,
    lastPayment: null,
    loading: false,
    error: null
  }),
  actions: {
    async fetchPlans() {
      this.loading = true
      this.error = null
      try {
        const response = await billingApi.plans.getAll()
        this.plans = response.data.map((p) => new Plan(p))
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },
    selectPlan(plan) {
      this.selectedPlan = plan
    },
    /**
     * Creates a subscription and a completed payment (simulated purchase flow).
     */
    async purchaseSubscription({ userId = 1, plan, card }) {
      this.loading = true
      this.error = null
      try {
        const subscription = new Subscription({
          userId,
          planId: plan.id,
          planType: plan.type,
          price: plan.price,
          startDate: new Date().toISOString(),
          status: 'ACTIVE'
        })
        const subResponse = await billingApi.subscriptions.create(subscription)

        const payment = new Payment({
          subscriptionId: subResponse.data.id,
          amount: plan.price,
          currency: plan.currency,
          status: 'COMPLETED',
          isAutomatic: false
        })
        const payResponse = await billingApi.payments.create(payment)

        await billingApi.paymentMethods.create({
          userId,
          type: 'CARD',
          token: card?.cardNumber ? `****${card.cardNumber.slice(-4)}` : '****0000',
          isDefault: true
        })

        this.lastSubscription = new Subscription(subResponse.data)
        this.lastPayment = new Payment(payResponse.data)
        return this.lastSubscription
      } catch (e) {
        this.error = e.message
        throw e
      } finally {
        this.loading = false
      }
    }
  }
})
