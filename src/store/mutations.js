import Vue from 'vue'

export default {
  SET_STATE (state, { target, child, data }) {
    if (child) {
      let parent = state
      target.split('.').forEach(key => {
        parent = parent[key]
      })
      if (parent.hasOwnProperty(child)) {
        parent[child] = data
      } else {
        Vue.set(parent, child, data)
      }
    } else {
      state[target] = data
    }
  },
  SET_PAGE_TITLE (state, title) {
    if (title) {
      state.PageTitle = title === 'DEFAULT' ? state.AppName : title
      document.title = state.PageTitle
    }
  },
  LOADING_DATA (state, isLoading) {
    state.LoadingData = !!isLoading
  },
  LOCATING_POSITION (state, isLoading) {
    state.LocatingPosition = !!isLoading
  },
  SET_MAP_INSTANCE (state, instance) {
    state.MapInstance = instance
  },
  SET_GEOLOCATION_INSTANCE (state, instance) {
    state.GeolocationInstance = instance
  }
}
