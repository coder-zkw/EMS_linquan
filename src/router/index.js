import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
import WorkOrder from '../components/WorkOrder'
import WorkOrder2 from '../components/WorkOrder2'
import Materials from '../components/Materials'
// import Machine from '../components/Machine'
import Machine1 from '../components/Machine_1'
import Tuning from '../components/Tuning'
import Examine from '../components/Examine'
import Setting from '../components/Set'
import Device from '../components/Device'

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
        path: '/work_order2',
        component: WorkOrder2
    },
    {
        path: '/materials',
        component: Materials
    },
    // {
    //     path: '/machine',
    //     component: Machine
    // },
    {
        path: '/machine_1',
        component: Machine1
    },
    {
        path: '/tuning',
        component: Tuning
    },
    {
        path: '/examine',
        component: Examine
    },
    {
        path: '/set',
        component: Setting
    },
    {
        path: '/device',
        component: Device
    }
]

const router = new VueRouter({
    // mode: 'hash',
    routes
})

export default router