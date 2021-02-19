import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Tasklist from '@/components/tasklist.vue';

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Tasklist',
    component: Tasklist
  }
]

const router = new VueRouter({
  routes
})

export default router
