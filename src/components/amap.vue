<template>
  <el-amap class="amap-box" vid="amap-box" :zoom="12" :center="mapCenter" :plugin="plugin" :events="events" :amap-manager="amapManager">
    <el-amap-marker v-for="marker in normalizedMarkers" :key="marker.id"
      :vid="marker.id"
      :position="marker.position"
      :data="marker"
      :offset="[-23, -58]"
      :zIndex="markersZIndex[marker.id] || 100"
      :icon="getMarkerIcon(marker.category)"
      :events="markerEvents"
    ></el-amap-marker>
    <el-amap-info-window
      :isCustom="true"
      :autoMove="true"
      :offset="[0, -60]"
      :position="infoWindow.position"
      :template="infoWindow.template"
      :visible="infoWindow.visible"
      :events="infoWindow.events"
    >
      <div class="info-window">
        <div class="info-head">
          <!-- <button class="navi" @click="searchRoute({lng: infoWindow.data.position[0], lat: infoWindow.data.position[1]})">导航</button> -->
          <a class="navi" :href="infoWindow.naviLink" v-if="!isNavi">导航</a>
          <a :href="infoWindow.link"><p class="title">{{ infoWindow.data.title }}</p></a>
        </div>
        <a :href="infoWindow.link">
          <div class="info-body">
            <img :src="infoWindow.data.image">
            <p class="distance">{{ infoWindow.data.distance | fixDistanceText }}</p>
            <p class="address">{{ infoWindow.data.address }}</p>
          </div>
        </a>
      </div>
    </el-amap-info-window>
  </el-amap>
</template>

<script>
import { AMapManager } from 'vue-amap'
import { fixSpotImage } from '@/service/utils'

const amapManager = new AMapManager()

export default {
  props: {
    center: {
      type: Array
    },
    markers: {
      type: Array,
      default: []
    },
    current: {
      type: Number,
      default: 0
    },
    noDetail: {
      type: Number,
      default: 0
    }
  },
  computed: {
    normalizedMarkers () {
      const markers = {}
      this.markers.forEach(marker => {
        markers[marker.id] = {
          id: marker.id,
          category: Number(marker.category),
          position: [parseFloat(marker.lng), parseFloat(marker.lat)],
          distance: parseFloat(marker.distance),
          title: marker.title,
          address: marker.address,
          image: fixSpotImage(marker.firstpic || marker.smallpic),
          zIndex: this.markerZIndex,
          icon: this.$store.state.SpotsCategory
        }
      })
      // console.log('Markers', markers)
      if (this.markers.length === 1) {
        const onlyMarker = markers[this.markers[0].id]
        this.showInfoWindow(onlyMarker)
        if (this.isNavi && onlyMarker) {
          this.searchRoute({
            lng: onlyMarker.position[0],
            lat: onlyMarker.position[1]
          })
        }
      }
      return markers
    },
    mapCenter () {
      return this.center
    }
  },
  filters: {
    fixDistanceText (val) {
      // 原始单位 KM
      val = Number(val)
      if (val) {
        const text = val > 1 ? `${Math.round(val * 10) / 10} 公里` : `${Math.round(val * 1000)} 米`
        return `距您 ${text}`
      } else {
        return ''
      }
    }
  },
  data () {
    const self = this
    return {
      isNavi: false,
      loaded: false,
      amapManager,
      infoWindow: {
        position: [0, 0],
        template: '',
        events: {},
        visible: false,
        data: {}
      },
      myLocation: {},
      markersZIndex: {},
      maxZIndex: 100,
      currentMarker: {},
      markerEvents: {
        click (e) {
          const info = self.normalizedMarkers[e.target.F.vid]
          self.showInfoWindow(info)
        }
      },
      events: {
        init (instance) {
          console.log('Map instance', instance)
          window.MapInstance = instance
          self.$store.commit('SET_MAP_INSTANCE', instance)
          self.$store.dispatch('GET_LOCATION').then(position => {
            self.$emit('location', position)
          })
        }
      },
      plugin: [
        {
          pName: 'ToolBar',
          position: 'RT',
          liteStyle: true
        },
        {
          pName: 'Geolocation',
          buttonPosition: 'RT',
          events: {
            // init (instance) {
            //   instance.getCurrentPosition()
            // },
            complete (result) {
              if (result.position) {
                self.myLocation = result.position
                self.$store.dispatch('SET_LOCATION', result.position)
                self.$store.dispatch('SET_MAP_CENTER', result.position)
              }
            },
            error () {
              self.$store.dispatch('SET_LOCATION').then(() => {
                self.$emit('location')
              })
            }
          }
        }
      ]
    }
  },
  created () {
    this.isNavi = this.$route.name === 'Navi'
  },
  methods: {
    getMarkerIcon (categoryId) {
      let info = this.$store.state.SpotsCategory.filter(item => item.id === categoryId)[0]
      info = info || this.$store.state.SpotsCategory[0]
      return info.markerIcon
    },
    showInfoWindow (markerInfo) {
      if (markerInfo) {
        markerInfo.distance = parseFloat(markerInfo.distance) ? parseFloat(markerInfo.distance).toFixed(1).toString() : null
        this.infoWindow.data = markerInfo
        this.infoWindow.position = markerInfo.position
        this.infoWindow.visible = true
        this.infoWindow.link = markerInfo.id === this.noDetail ? 'javascript:;' : `#/detail/${markerInfo.id}`
        this.infoWindow.naviLink = `#/navi/${markerInfo.id}?`
        const markerInfoOrigin = this.markers.filter(item => item.id === markerInfo.id)[0]
        this.infoWindow.naviLink += Object.keys(markerInfoOrigin).map(key => key + '=' + markerInfoOrigin[key]).join('&')
        this.maxZIndex++
        this.$set(this.markersZIndex, markerInfo.id, this.maxZIndex)
        // this.$store.dispatch('SET_MAP_CENTER', markerInfo.position)
        this.$emit('show-current-marker', markerInfo)
      }
    },
    searchRoute (targetLocation, startLocation) {
      startLocation = startLocation || this.$store.state.MyLocation
      const mapInstance = amapManager.getMap()
      if (AMap) {
        const driving = new AMap.Driving({
          map: mapInstance,
          policy: AMap.DrivingPolicy.LEAST_TIME
        })
        const warking = new AMap.Walking({
          map: mapInstance
        })
        const startLngLat = new AMap.LngLat(startLocation.lng || startLocation.Lng, startLocation.lat || startLocation.Lat)
        const endLngLat = new AMap.LngLat(targetLocation.lng, targetLocation.lat)
        // 根据距离决定使用 驾车路线 还是 步行路线
        const distance = Math.round(startLngLat.distance(endLngLat))
        this.infoWindow.data.distance = this.infoWindow.data.distance || (distance / 1000)
        const searchSolution = distance > 1000 ? driving : warking
        console.log(`Search Route with ${distance > 1000 ? 'driving' : 'warking'} mode ( ${distance} M ): ${targetLocation.lng}, ${targetLocation.lat}`)
        searchSolution.search(startLngLat, endLngLat, (status, result) => {
          console.log('Search Route Result: ', result.routes)
          this.$emit('navi-solution', this.infoWindow.data, result.routes)
        })
      }
    }
  },
  watch: {
    current (val, oldVal) {
      console.log(val)
      if (val !== oldVal) {
        const info = this.normalizedMarkers[val]
        this.showInfoWindow(info)
      }
    }
  }
}
</script>

<style lang="stylus">
.amap-box
  position relative
  z-index 1
.amap-geolocation-con
.amap-touch-toolbar
  right 15px!important
.amap-geolocation-con
  top 15px!important
.amap-touch-toolbar
  top 67px!important
.amap-touch-toolbar .amap-zoomcontrol
.amap-geolocation-con .amap-geo
  right 0
  bottom auto
  background-color rgba(255, 255, 255, 0.9)
  border-radius 3px
  border 1px solid #ccc
  box-shadow 0 1px 10px rgba(0, 0, 0, 0.15)
.amap-marker .amap-icon img
  width 46px
  height 62px
.info-window
  display block
  width 200px
  padding 12px
  background-color #fff
  border-radius 6px
  box-shadow 0 3px 10px rgba(0, 0, 0, .1)
  font-size 12px
  color #333
  p
    margin 5px 0
  .info-head
    position relative
    margin-bottom 10px
    .navi
      float right
      background #5ab6e6
      color #fff
      padding 2px 6px
      margin-top 1px
      margin-left 5px
      border 0
      border-radius 10px
      font-size 11px
    .title
      font-weight 700
      font-size 1.33em
      margin 0
      color #333
  .info-body
    color #555
    height 60px
    img
      width 80px
      height 60px
      object-fit cover
      float left
      margin-right 10px
      background-color #eee
      border-radius .1rem
    .distance
      font-size 1.16em

</style>
