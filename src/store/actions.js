import { lazyAMapApiLoaderInstance } from 'vue-amap'
import { Toast } from 'vant'
import APIs from '@/service/api'

export default {
  async INIT_MAP ({ commit, state }) {
    if (!state.MapInstance) {
      await lazyAMapApiLoaderInstance.load()
      state.MapInstance = new AMap.Map('_')
      commit('SET_MAP_INSTANCE', state.MapInstance)
    }
    return state.MapInstance
  },
  async GET_LOCATION ({ commit, dispatch, state }) {
    if (!state.GeolocationInstance) {
      await lazyAMapApiLoaderInstance.load()
      state.GeolocationInstance = new AMap.Geolocation({
        timeout: 10000,
        maximumAge: 10000
      })
      commit('SET_GEOLOCATION_INSTANCE', state.GeolocationInstance)
    }
    const getCurrentPosition = new Promise((resolve, reject) => {
      let resolved = false

      if (state.MyLocation.Lng && state.MyLocation.Lat) {
        console.log('Got Current Position in Store')
        resolve({
          lng: state.MyLocation.Lng,
          lat: state.MyLocation.Lat
        })
        return
      }

      const storageKey = 'my_location'
      let storage = {}
      try {
        storage = JSON.parse(sessionStorage.getItem(storageKey)) || {}
      } catch (e) {}
      if (storage.lng && storage.lat) {
        console.log('Got Current Position in Session Storage && Getting Current Position Background')
        dispatch('SET_LOCATION', storage)
        resolve(storage)
        resolved = true
      } else {
        console.log('Getting Current Position')
        Toast.loading({
          duration: 0,
          forbidClick: true,
          message: '定位中'
        })
      }
      commit('LOCATING_POSITION', true)
      state.GeolocationInstance.getCurrentPosition((status, result) => {
        Toast.clear()
        commit('LOCATING_POSITION', false)
        if (status === 'complete') {
          console.log('Got Current Position')
          try {
            sessionStorage.setItem(storageKey, JSON.stringify(result.position))
          } catch (e) {}
          dispatch('SET_LOCATION', result.position)
          !resolved && resolve(result.position)
        } else {
          console.log('Failed Get Current Position', result)
          dispatch('SET_LOCATION')
          !resolved && resolve(result)
          // reject(result)
        }
      })
    })
    return getCurrentPosition
  },
  SET_LOCATION ({ commit, dispatch, state }, position) {
    position = position || {
      lng: state.MyLocation.Center[0],
      lat: state.MyLocation.Center[1]
    }
    commit('SET_STATE', {
      target: 'MyLocation',
      child: 'Lng',
      data: position.lng
    })
    commit('SET_STATE', {
      target: 'MyLocation',
      child: 'Lat',
      data: position.lat
    })
    console.log(`My position: ${position.lng}, ${position.lat}`)
  },
  SET_MAP_CENTER ({ commit }, position) {
    if (position) {
      position = position instanceof Array ? {
        lng: position[0],
        lat: position[1]
      } : position
      commit('SET_STATE', {
        target: 'MyLocation',
        child: 'Center',
        data: [parseFloat(position.lng), parseFloat(position.lat)]
      })
    }
    console.log(`Map center: `, position)
  },
  async REQUEST_API ({ commit, state }, { api, cache, ...payload }) {
    const undefinedApiError = {
      code: -1,
      msg: '未定义接口',
      data: null
    }
    commit('LOADING_DATA', true)
    console.log(`Request API: ${api}`)
    let response = null
    if (APIs[api]) {
      if (cache) {
        if (state.CacheData[cache.key]) {
          response = state.CacheData[cache.key]
        } else {
          response = (await APIs[api](payload)).data
          state.CacheData[cache.key] = response
        }
      } else {
        response = (await APIs[api](payload)).data
      }
    } else {
      response = undefinedApiError
    }
    commit('LOADING_DATA', false)
    return response
  }
}
