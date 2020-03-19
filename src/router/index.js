import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
import WorkOrder from '../components/WorkOrder'
import Materials from '../components/Materials'
import Machine from '../components/Machine'
import Machine1 from '../components/Machine_1'

Vue.use(VueRouter)

const routes = [
    {
        path: '/login',
        component: Login
    },
    {
      path: '/',
      redirect: '/login'
    },
    {
        path: '/work_order',
        component: WorkOrder
    },
    {
        path: '/materials',
        component: Materials
    },
    {
        path: '/machine',
        component: Machine
    },
    {
        path: '/machine_1',
        component: Machine1
    }
]

const router = new VueRouter({
    // mode: 'hash',
    routes
})

export default router