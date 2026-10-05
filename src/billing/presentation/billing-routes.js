const plansView = () => import('./views/plans-view.vue')
const subscriptionPaymentView = () => import('./views/subscription-payment-view.vue')
const paymentSuccessView = () => import('./views/payment-success-view.vue')

const billingRoutes = [
  { path: 'plans', name: 'plans', component: plansView, meta: { title: 'Planes' } },
  { path: 'subscribe', name: 'subscribe', component: subscriptionPaymentView, meta: { title: 'Suscripción' } },
  { path: 'success', name: 'payment-success', component: paymentSuccessView, meta: { title: 'Pago exitoso' } }
]

export default billingRoutes
