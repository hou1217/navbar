import Vue from 'vue'
import Router from 'vue-router'

Vue.directive('page-title', {
  inserted: (el, binding) => {
    document.title = binding.value
  },
  update: (el, binding) => {
    document.title = binding.value
  }
})

Vue.use(Router)

// const Index = () => import('@/pages/index')
// const List = () => import('@/pages/list')
// const Detail = () => import('@/pages/detail')
// const Map = () => import('@/pages/map')
// const Navi = () => import('@/pages/navi')

import Index from '@/pages/index'
import List from '@/pages/list'
import Detail from '@/pages/detail'
import Map from '@/pages/map'
import Navi from '@/pages/navi'

const router = new Router({
  routes: [
    {
      name: 'Home',
      path: '/',
      component: Index,
      meta: { title: '智能导览' }
    },
    {
      name: 'List',
      path: '/list/:id',
      component: List,
      meta: { title: '地点列表' }
    },
    {
      name: 'Detail',
      path: '/detail/:id',
      component: Detail,
      meta: { title: '地点详情' }
    },
    {
      name: 'Map',
      path: '/map/:id',
      component: Map,
      meta: { title: '地点地图' }
    },
    {
      name: 'Navi',
      path: '/navi/:id',
      component: Navi,
      meta: { title: '导航路线' }
    }
  ],
  scrollBehavior (to, from, savedPosition) {
    return savedPosition || { x: 0, y: 0 }
  }
})

router.beforeEach((to, from, next) => {
  if (to.matched[0].meta.title) {
    document.title = to.matched[0].meta.title
  }
  next()
})

export default router
