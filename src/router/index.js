import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/fechaHora',
    name: 'FechaHora',
    component : () => import('../views/Config_FechaHora.vue')
  },
  {
    path: '/red',
    name: 'Red',
    component : () => import('../views/Config_Red.vue')
  },
  {
    path: '/canales',
    name: 'Canales',
    component : () => import('../views/Config_Canales.vue')
  },
  {
    path: '/reset',
    name: 'Reset',
    component : () => import('../views/Config_Reset.vue')
  },
  {
    path: '/manual',
    name: 'Manual',
    component : () => import('../views/Adj_Manual.vue')
  },
  {
    path: '/fan',
    name: 'Fan',
    component : () => import('../views/Adj_Fan.vue')
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
