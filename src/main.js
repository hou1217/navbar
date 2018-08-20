import Vue from 'vue'
import VueAMap from 'vue-amap'
import router from './router'
import store from './store'
import App from './App'

Vue.use(VueAMap)
VueAMap.initAMapApiLoader({
  key: 'dfd0d93b3bc6bb2607ef3b76a4eb751c',
  plugin: ['Scale', 'OverView', 'ToolBar', 'Geolocation', 'Driving', 'Transfer', 'Walking'],
  uiVersion: '1.0',
  v: '1.4.8'
})

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
