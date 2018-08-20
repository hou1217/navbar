<template>
  <div class="fullpage">
    <amap :markers="markers" :center="MyLocation.Center" @location="getLocation"></amap>
    <div class="toolbar">
      <span v-if="MyLocation.Lng && MyLocation.Lat">
        location: lng = {{ MyLocation.Lng }} lat = {{ MyLocation.Lat }}
      </span>
      <span v-else>正在定位</span>
    </div>
    <div class="menu-bar">
      <van-tabbar>
        <van-tabbar-item class="menu-item" v-for="menu in SpotsCategory" :key="menu.id" :to="menu.route">
          <img slot="icon" :src="menu.icon">
          <span>{{ menu.name }}</span>
        </van-tabbar-item>
      </van-tabbar>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { mapActions } from 'vuex'
import { Tabbar, TabbarItem } from 'vant'
import Amap from '@/components/amap'

export default {
  name: 'Home',
  components: {
    Amap,
    [Tabbar.name]: Tabbar,
    [TabbarItem.name]: TabbarItem
  },
  data () {
    return {
      markers: []
    }
  },
  computed: {
    ...mapState([
      'MyLocation',
      'SpotsCategory'
    ])
  },
  created () {
    this.$store.commit('SET_PAGE_TITLE', 'DEFAULT')
  },
  methods: {
    ...mapActions(['REQUEST_API']),
    fetchData () {
      this.REQUEST_API({
        api: 'GetSpotsList',
        cache: {
          key: `list_home_all`
        },
        data: {
          lng: this.MyLocation.Lng,
          lat: this.MyLocation.Lat
        }
      }).then(res => {
        if (res.code === 0 && res.data && res.data instanceof Array) {
          this.loaded = true
          this.markers = res.data
          setTimeout(() => {
            this.$store.dispatch('SET_MAP_CENTER', this.markers[0])
          })
        }
      })
    },
    getLocation (position) {
      if (this.markers.length === 0) {
        this.fetchData()
      }
    }
  }
}
</script>

<style lang="stylus">
.toolbar
  position absolute
  z-index 2
  width 100%
  box-sizing border-box
  bottom 0
  left 0
  background rgba(0, 0, 0, .5)
  color #fff
  padding .5rem .75rem
  font-size .7rem
.menu-bar
  position absolute
  z-index 3
  width 100%
  box-sizing border-box
  bottom 0
  left 0
  background rgba(255, 255, 255, .95)
  .van-tabbar
    height 4.7rem
  .menu-item
    font-size .8rem
    color #333
    img
      display block
      width 2.5rem
      height 2.5rem


</style>
