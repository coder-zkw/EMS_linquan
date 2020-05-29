import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
import Home from '../components/Home'
import WorkOrder from '../components/WorkOrder'
import WorkOrder2 from '../components/WorkOrder2'
import Materials from '../components/Materials'
import Materials1 from '../components/Materials_1'
import Machine1 from '../components/Machine_1'
import Tuning from '../components/Tuning'
import Examine from '../components/Examine'
import Setting from '../components/Set'
import Device from '../components/Device'
import Audit from '../components/Audit'
import Gantt from '../components/Gantt.vue'
import Table from '../components/Table'


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
        path: '/home',
        component: Home,
        children: [
            {
                path: '/home/work_order',
                component: WorkOrder
            },
            {
                path: '/home/work_order2',
                component: WorkOrder2
            },
            {
                path: '/home/materials',
                component: Materials
            },
            {
                path: '/home/materials_1',
                component: Materials1
            },
            {
                path: '/home/machine_1',
                component: Machine1
            },
            {
                path: '/home/examine',
                component: Examine,
            },
            {
                path: '/home/audit',
                component: Audit
            }
        ]
    },
    {
        path: '/device',
        component: Device
    },
    {
        path: '/gantt',
        component: Gantt
    },
    {
        path: '/setexamine',
        component: Setting
    },
    {
        path: '/table',
        component: Table
    }
]

const router = new VueRouter({
    // mode: 'hash',
    routes
})

export default router