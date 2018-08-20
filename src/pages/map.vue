<template>
  <div class="fullpage">
    <amap
      :markers="markers"
      :center="MyLocation.Center"
      :current="currentMarker.id"
      @location="getLocation"
      @show-current-marker="showCurrentMarkerInfo"></amap>
    <div class="map-layer map-info-layer">
      <van-swipe ref="info-swiper" :show-indicators="false" @change="showCurrentMarker">
        <van-swipe-item v-for="(marker, index) in markers" :key="marker.id">
          <div class="spot-info van-hairline--bottom">
            <h2 class="spot-title">{{ marker.title }}</h2>
            <div class="spot-desc">
              <span class="spot-label" v-if="marker.isNearest" v-text="marker.isNearest ? '离我最近' : ''"></span>
            </div>
          </div>
          <div class="spot-info">
            <div class="spot-desc">{{ marker.distance | fixDistanceText }}</div>
            <router-link class="btn spot-navi" :to="{ path: `/navi/${currentMarker.id}`, query: currentMarker }">导航</router-link>
          </div>
        </van-swipe-item>
      </van-swipe>
      <span class="spot-indicator" v-show="markers.length">{{ currentIndex + 1 }} / {{ markers.length }}</span>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { mapActions } from 'vuex'
import { Swipe, SwipeItem } from 'vant'
import Amap from '@/components/amap'

export default {
  name: 'Map',
  components: {
    Amap,
    [Swipe.name]: Swipe,
    [SwipeItem.name]: SwipeItem
  },
  data () {
    return {
      categoryId: Number(this.$route.params.id),
      markers: [],
      currentMarker: {
        id: 0
      },
      currentIndex: 0,
      pagination: {
        pageIndex: 1,
        pageSize: 100,
        pageMax: null
      }
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
      this.categoryId = Number(to.params.id)
      this.pagination.pageIndex = 1
      this.pagination.pageMax = null
      this.markers = []
      this.getCategoryTitle()
      this.fetchData()
    }
    next()
  },
  created () {
    this.getCategoryTitle()
  },
  methods: {
    ...mapActions(['REQUEST_API']),
    fetchData () {
      this.MyLocation.Lng && this.MyLocation.Lat &&
        this.REQUEST_API({
          api: 'GetSpotsList',
          cache: {
            key: `list_${this.categoryId}__p_${this.pagination.pageIndex}`
          },
          data: {
            type: `${this.categoryId}-`,
            lng: this.MyLocation.Lng,
            lat: this.MyLocation.Lat,
            ...this.pagination
          }
        }).then(res => {
          if (res.code === 0 && res.data && res.data instanceof Array) {
            this.markers = res.data
            if (res.data.length === 0) {
              this.pagination.pageMax = this.pagination.pageIndex
            } else {
              this.pagination.pageIndex++
            }
            setTimeout(() => {
              const firstMarker = this.nearestSpot()
              this.showCurrentMarker(firstMarker.marker)
              this.showCurrentMarkerInfo(firstMarker.marker, firstMarker.index)
            })
          }
        })
    },
    getLocation (position) {
      if (this.markers.length === 0) {
        this.fetchData()
      }
    },
    showCurrentMarker (marker) {
      marker = typeof (marker) === 'number' ? this.markers[marker] : marker
      this.currentMarker = marker
      this.$store.dispatch('SET_MAP_CENTER', marker)
    },
    showCurrentMarkerInfo (marker, index) {
      if (index === undefined) {
        index = 0
        this.markers.forEach((item, i) => {
          if (item.id === marker.id) index = i
        })
      }
      this.currentIndex = index
      this.$refs['info-swiper'].swipeTo(index)
    },
    nearestSpot () {
      const nearest = {
        index: 0,
        marker: {}
      }
      this.markers.forEach((item, index) => {
        if (item.distance && (item.distance < nearest.marker.distance || !nearest.marker.distance)) {
          nearest.index = index
          nearest.marker = item
        }
      })
      this.$set(this.markers[nearest.index], 'isNearest', true)
      return nearest
    },
    getCategoryTitle () {
      const info = this.SpotsCategory.filter(item => item.id === this.categoryId)[0]
      if (info) this.$store.commit('SET_PAGE_TITLE', info.name)
    }
  }
}
</script>

<style lang="stylus">
.spot-indicator
  position absolute
  right .5rem
  top .75rem
  color #555
  font-size .55rem
  line-height 1.1rem
  padding 0 .25rem
  background-color #fff
</style>
