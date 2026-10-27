import { defineStore } from 'pinia'
import { billingApi } from '../infrastructure/billing-api.js'
import { Plan } from '../domain/model/plan.js'
import { Subscription } from '../domain/model/subscription.js'
import { Payment, PAYMENT_TYPES } from '../domain/model/payment.js'
import { useIamStore } from '../../iam/application/iam.store.js'

export const useBillingStore = defineStore('billing', {
  state: () => ({
    plans: [],
    selectedPlan: null,
    lastSubscription: null,
    lastPayment: null,
    loading: false,
    error: null
  }),
  getters: {
    payPerUsePlan: (state) => state.plans.find((p) => p.type === 'PAY_PER_USE'),
    pricePerKm() {
      return Number(this.payPerUsePlan?.pricePerKm) || 0
    }
  },
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
    async purchaseSubscription({ userId, plan, card }) {
      if (!userId || !plan || this.loading) throw new Error('Invalid purchase or purchase already in progress')
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
          token: card?.cardNumber ? `****${card.cardNumber.replace(/\D/g, '').slice(-4)}` : '****0000',
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
    },

    /**
     * Finds the user's ACTIVE pay-per-use subscription, if any.
     * Non-blocking: a charge remains valid with subscriptionId null.
     */
    async findPayPerUseSubscription(userId) {
      if (!userId) return null
      try {
        const res = await billingApi.subscriptions.getAll({ userId, planType: 'PAY_PER_USE', status: 'ACTIVE' })
        const sub = res.data?.[0]
        return sub ? new Subscription(sub) : null
      } catch (e) {
        return null
      }
    },

    /**
     * Charges a finished pay-per-use trip against the user's balance:
     * creates a CHARGE payment and decrements the balance via the IAM store.
     * Compensates (deletes the payment) if the balance update fails.
     */
    async chargeTrip({ userId, tripId, amount, subscriptionId = null }) {
      // Lazy on purpose: billing-store is imported before app.use(pinia).
      const iam = useIamStore()
      const balance = Number(iam.currentUser?.balance ?? 0)
      if (!Number.isFinite(balance) || amount > balance) throw new Error('INSUFFICIENT_BALANCE')

      const payment = new Payment({
        subscriptionId,
        tripId,
        userId,
        amount,
        currency: 'PEN',
        status: 'COMPLETED',
        isAutomatic: true,
        type: PAYMENT_TYPES.CHARGE
      })
      const res = await billingApi.payments.create(payment)
      const newBalance = Number((balance - amount).toFixed(2))
      const ok = await iam.updateProfile({ balance: newBalance })
      if (!ok) {
        await billingApi.payments.delete(res.data.id).catch(() => {})
        throw new Error('BALANCE_UPDATE_FAILED')
      }
      this.lastPayment = new Payment(res.data)
      return this.lastPayment
    },

    /**
     * Adds a fixed amount to the user's balance and records a TOPUP payment.
     * Compensates (deletes the payment) if the balance update fails.
     */
    async topUpBalance({ userId, amount, subscriptionId = null }) {
      if (!amount || amount <= 0) throw new Error('INVALID_AMOUNT')

      const payment = new Payment({
        subscriptionId,
        userId,
        amount,
        currency: 'PEN',
        status: 'COMPLETED',
        isAutomatic: false,
        type: PAYMENT_TYPES.TOPUP
      })
      const res = await billingApi.payments.create(payment)

      const iam = useIamStore()
      if (iam.currentUser?.balance === undefined) {
        // Stale localStorage session: fetch the seeded balance first.
        await iam.refreshProfile().catch(() => {})
      }
      const current = Number(iam.currentUser?.balance ?? 0)
      const newBalance = Number((current + amount).toFixed(2))
      const ok = await iam.updateProfile({ balance: newBalance })
      if (!ok) {
        await billingApi.payments.delete(res.data.id).catch(() => {})
        throw new Error('BALANCE_UPDATE_FAILED')
      }
      this.lastPayment = new Payment(res.data)
      return this.lastPayment
    }
  }
})
