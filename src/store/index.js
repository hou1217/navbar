import Vue from 'vue'
import Vuex from 'vuex'
import actions from './actions'
import mutations from './mutations'
import { UA } from '@/service/utils'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    UA,
    AppName: '智能导览',
    PageTitle: '智能导览',
    MyLocation: {
      Lng: 0,
      Lat: 0,
      Center: [121.466019, 31.230231]
    },
    SpotsCategory: [
      {
        id: 2,
        name: '景点',
        icon: require('@/assets/menu-tourist.png'),
        markerIcon: require('@/assets/map-marker-tourist.png'),
        route: '/list/2',
        type: 'spot'
      },
      {
        id: 3,
        name: '美食',
        icon: require('@/assets/menu-restaurant.png'),
        markerIcon: require('@/assets/map-marker-restaurant.png'),
        route: '/list/3',
        type: 'restaurant'
      },
      {
        id: 6,
        name: '厕所',
        icon: require('@/assets/menu-toilet.png'),
        markerIcon: require('@/assets/map-marker-toilet.png'),
        route: '/map/6',
        type: 'toilet'
      },
      {
        id: 4,
        name: '酒店',
        icon: require('@/assets/menu-hotel.png'),
        markerIcon: require('@/assets/map-marker-hotel.png'),
        route: '/list/4',
        type: 'hotel'
      }
    ],
    MapInstance: null,
    GeolocationInstance: null,
    LocatingPosition: false,
    LoadingData: false,
    CacheData: {}
  },
  actions,
  mutations
})
