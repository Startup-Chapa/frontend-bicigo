export default [
  { path: '/auth/login',    name: 'login',    component: () => import('./views/login/login.vue') },
  { path: '/auth/register', name: 'register', component: () => import('./views/register/register.vue') },
  { path: 'profile',        name: 'profile',  component: () => import('./views/profile/profile.vue') }
]
