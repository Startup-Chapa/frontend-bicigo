const registerPlanView = () => import('./views/register-plan-view.vue')

const iamRoutes = [
  { path: 'register/plan', name: 'register-plan', component: registerPlanView, meta: { title: 'Crear cuenta - Plan' } }
]

export default iamRoutes
