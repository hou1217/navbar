<template>
  <div class="fullpage">
    <amap
      :markers="markers"
      :center="MyLocation.Center"
      :no-detail="noDetail"
      @location="getLocation"
      @navi-solution="showNaviStep"></amap>
    <div class="map-layer map-route-layer" :class="{extend: extendRouteList}">
      <div class="spot-info van-hairline--bottom" v-if="currentMarker.id" @click="extendRouteList = !extendRouteList" ref="spot-info">
        <h2 class="spot-title">{{ currentMarker.title }}</h2>
        <div class="spot-desc">{{ currentMarker.distance | fixDistanceText }}</div>
        <button class="btn spot-navi" v-text="extendRouteList ? '收起' : '跟我走'"></button>
      </div>
      <div class="route-steps-list" v-if="routes[0]" :style="{ top: infoHeight }">
        <div class="route-step" v-for="(step, index) in routes[0].steps" :key="index">
          <i class="icon" :class="index === 0 ? 'icon-start' : (index === routes[0].steps.length - 1 ? 'icon-end' : 'icon-' + routeStepIcon[step.action])"></i>
          <p class="description">{{ step.instruction }}</p>
          <span class="label">{{ step.action + ' ' + step.assistant_action }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { mapActions } from 'vuex'
import { Toast } from 'vant'
import Amap from '@/components/amap'

export default {
  name: 'Navi',
  components: {
    Amap
  },
  data () {
    return {
      id: Number(this.$route.params.id),
      markers: [],
      currentMarker: {},
      routes: [],
      extendRouteList: false,
      routeStepIcon: {
        '直行': 'straight',
        '左转': 'turn-left',
        '右转': 'turn-right',
        '靠左': 'left',
        '靠右': 'right'
      },
      noDetail: 0,
      infoHeight: '100%'
    }
  },
  computed: {
    ...mapState([
      'MyLocation',
      'SpotsCategory'
    ])
  },
  filters: {
    fixDistanceText (val) {
      // 原始单位 KM
      val = Number(val)
      if (val) {
        const text = val > 1 ? `${Math.round(val * 10) / 10} 公里` : `${Math.round(val * 1000)} 米，加把劲儿就到了哦！`
        return `距离您约 ${text}`
      } else {
        return ''
      }
    }
  },
  beforeRouteUpdate (to, from, next) {
    if (to.params.id !== from.params.id) {
      this.id = Number(to.params.id)
      this.markers = []
      this.routes = []
      this.fetchData()
    }
    next()
  },
  methods: {
    ...mapActions(['REQUEST_API']),
    fetchData () {
      this.MyLocation.Lng && this.MyLocation.Lat &&
        this.REQUEST_API({
          api: 'GetSpotDetail',
          data: {
            spotId: `${this.id}`,
            lng: this.MyLocation.Lng,
            lat: this.MyLocation.Lat
          }
        }).then(res => {
          if (res.code === 0 && res.data) {
            const data = res.data instanceof Array ? res.data[0] : res.data
            if (data) {
              this.markers.push(data)
              setTimeout(() => {
                this.$store.dispatch('SET_MAP_CENTER', data)
              })
            } else {
              this.noDetail = this.id
              this.renderDataByQuery()
            }
          }
        })
    },
    renderDataByQuery () {
      const queryData = this.$route.query
      if (queryData.lng && queryData.lat) {
        const marker = {
          id: Number(queryData.id),
          title: queryData.title || '未知地点',
          address: queryData.address || '',
          lng: queryData.lng,
          lat: queryData.lat,
          distance: queryData.distance || 0,
          firstpic: queryData.image || null
        }
        this.markers.push(marker)
        setTimeout(() => {
          this.$store.dispatch('SET_MAP_CENTER', marker)
        })
      } else {
        Toast.fail('未知地点')
      }
    },
    getLocation (position) {
      if (this.markers.length === 0) {
        this.fetchData()
      }
    },
    showNaviStep (markerInfo, routes) {
      this.currentMarker = markerInfo
      this.routes = routes
      this.$nextTick(() => {
        this.infoHeight = this.$refs['spot-info'].offsetHeight + 'px'
      })
    }
  }
}
</script>

<style lang="stylus">
.route-steps-list
  font-size .7rem
  position absolute
  top 3.7rem
  left 0
  right 0
  bottom 0
  overflow auto
  -webkit-overflow-scrolling touch
  padding .3rem .75rem
  .route-step
    position relative
    padding-left 1.75rem
    margin .5rem 0
    .icon
      position absolute
      left 0
      top .3rem
      display block
      width 1.3rem
      height 1.3rem
      background url('../assets/icon-step-straight.png') no-repeat center center
      background-size contain
      for i in start end left right turn-left turn-right
        &.icon-{i}
          background-image url('../assets/icon-step-'+i+'.png')
    .description
      font-weight 700
      margin 0
    .label
      font-size .6rem
      color #555
</style>
