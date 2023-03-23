import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'

let originPush =  VueRouter.prototype.push;  
 
VueRouter.prototype.push = function (location, resolve, reject){
    if (resolve && reject) {    
        originPush.call(this, location, resolve, reject);
    }else {                    
        originPush.call(this, location, ()=>{}, ()=>{}); 
    }
}


Vue.use(VueRouter)

const routes = [{
        path: '/',
        name: 'home',
        component: HomeView
    },
    {
        path: '/intermap',
        name: 'InterMap',
        component: () => import('@/views/map/InterMap.vue')
    },
    {
        path: '/nopage',
        name: 'NoPage',
        component: () => import('@/views/error/NoPage.vue')
    },
    {
        path: '/noroot',
        name: 'NoRoot',
        component: () => import('@/views/error/NoRoot.vue')
    },
    {
        path: '/visiterror',
        name: 'VisitError',
        component: () => import('@/views/error/VisitError.vue')
    },
    {
        path: '*',
        redirect: '/nopage',
    }
]

const router = new VueRouter({
    routes
})

export default router