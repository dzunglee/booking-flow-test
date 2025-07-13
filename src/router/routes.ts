const Home = () => import('../views/Home.vue')
const SignIn = () => import('../modules/auth/SignIn.vue')
const Register = () => import('../modules/auth/Register.vue')

export const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'login',
    component: SignIn,
    meta: { requiresGuest: true },
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
    meta: { requiresGuest: true },
  },
]
