import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/converter/',
    name: 'PlayListConverter',
    component: () => import('../views/PlayListConverter.vue')
  },
  {
    path: '/spotify/',
    name: 'spotify',
    component: () => import('../views/SpotifyCallback.vue')
  },
  {
    path: '/experience',
    name: 'Previous Experience',
    component: () => import('../views/Experience.vue')
  },
  {
    path: '/contact',
    name: 'Contact Me',
    component: () => import('../views/Contact.vue')
  },
  {
    path: '/',
    component: () => import('../views/About.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router