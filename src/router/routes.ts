const RoomSearch = () => import('../modules/booking/RoomSearch.vue')
const Rooms = () => import('../modules/booking/Rooms.vue')
const Dashboard = () => import('../modules/dashboard/Dashboard.vue')
const SignIn = () => import('../modules/auth/SignIn.vue')
const Register = () => import('../modules/auth/Register.vue')
const ContactInfo = () => import('../modules/booking/ContactInfo.vue')
const Confirmation = () => import('../modules/booking/Confirmation.vue')

export const routes = [
  {
    path: '/',
    name: 'home',
    component: RoomSearch,
    meta: { requiresGuest: false },
  },
  {
    path: '/rooms',
    name: 'rooms',
    component: Rooms,
    meta: { requiresGuest: false },
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

  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: '/contact',
    name: 'contact',
    component: ContactInfo,
    meta: { requiresAuth: true },
  },
  {
    path: '/confirmation',
    name: 'confirmation',
    component: Confirmation,
    meta: { requiresAuth: true },
  },

  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]
