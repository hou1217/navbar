<template>
  <div>
    <van-swipe :autoplay="3000">
      <van-swipe-item v-for="(image, index) in detail.images" :key="index">
        <img :src="image" />
      </van-swipe-item>
    </van-swipe>
    <van-cell-group>
      <van-cell :title="detail.title" :label="detail.description || ''" class="detail-cell-title">
        <template>
          <div class="detail-label" v-if="detail.label">{{ detail.label }}</div>
        </template>
        <template v-if="detail.price">
          <span class="detail-price" v-if="categoryInfo.type === 'restaurant'"><em>{{ detail.price | fixPrice }}</em> /人</span>
          <span class="detail-price" v-else><em>{{ detail.price | fixPrice }}</em></span>
        </template>
      </van-cell>
      <van-cell v-if="detail.address" :title="detail.address" :label="detail.distance ? `距您 ${detail.distance} KM` : ''" is-link :to="{ path: `/navi/${id}`, query: detail }">
        <template slot="icon">
          <span class="cell-img-icon cell-icon-location"></span>
        </template>
      </van-cell>
      <van-cell v-if="detail.contact" :title="detail.contact" is-link :url="`tel:${detail.contact}`">
        <template slot="icon">
          <span class="cell-img-icon cell-icon-contact"></span>
        </template>
      </van-cell>
    </van-cell-group>
    <van-cell-group v-if="detail.content">
      <van-cell>
        <template>
          <div class="van-cell-text" v-html="detail.content"></div>
        </template>
      </van-cell>
    </van-cell-group>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { mapActions } from 'vuex'
import { Cell, CellGroup, Swipe, SwipeItem, Toast } from 'vant'
import { fixSpotImage } from '@/service/utils'
import MockData from '@/service/mock'

export default {
  name: 'Detail',
  components: {
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup,
    [Swipe.name]: Swipe,
    [SwipeItem.name]: SwipeItem
  },
  filters: {
    fixSpotImage,
    fixDistance: val => parseFloat(val).toFixed(1).toString(),
    fixPrice: val => {
      try {
        val = parseFloat(val.replace('￥', '').replace('/人', ''))
      } catch (e) {
        val = 0
      }
      return val || 0
    }
  },
  data () {
    return {
      id: Number(this.$route.params.id),
      detail: {}
    }
  },
  computed: {
    categoryInfo () {
      const info = this.SpotsCategory.filter(item => item.id === this.detail.categoryId)[0]
      if (info) this.$store.commit('SET_PAGE_TITLE', info.name)
      return info || {
        id: this.categoryId,
        name: '未知'
      }
    },
    ...mapState([
      'LoadingData',
      'LocatingPosition',
      'MyLocation',
      'SpotsCategory'
    ])
  },
  created () {
    this.fetchData()
  },
  beforeRouteUpdate (to, from, next) {
    if (to.params.id !== from.params.id) {
      this.id = Number(to.params.id)
      this.detail = {}
      this.fetchData()
    }
    next()
  },
  methods: {
    ...mapActions([
      'REQUEST_API',
      'GET_LOCATION'
    ]),
    async fetchData () {
      await this.GET_LOCATION()
      // !this.detail.title &&
      this.REQUEST_API({
        api: 'GetSpotDetail',
        data: {
          spotId: `${this.id}`,
          lng: this.MyLocation.Lng,
          lat: this.MyLocation.Lat
        }
      }).then(res => {
        if (res.code === 0 && res.data) {
          let data = res.data instanceof Array ? res.data[0] : res.data
          if (!data) {
            data = MockData.SpotDetail
            setTimeout(() => {
              Toast.fail('没有地点详情')
            }, 500)
          }
          let images = data.firstpic || data.smallpic
          images = images instanceof Array ? images : [images]
          this.detail = {
            categoryId: data.type,
            images,
            title: data.title,
            description: data.timedesc,
            label: data.label || data.ssd,
            address: data.address,
            contact: data.contact,
            price: data.price || data.ticket,
            distance: data.distance,
            content: data.description
          }
        }
      })
    }
  }
}
</script>

<style lang="stylus">
.van-swipe
  padding-top 56.25%
  width 100%
  height 0
  .van-swipe__track
    position absolute
    left 0
    top 0
    img
      width 100%
      height 100%
      object-fit cover
.van-cell-group ~ .van-cell-group
  margin-top .3rem
.detail-cell-title
  .van-cell__value
    position relative
    flex auto
  .van-cell__title
    flex auto
    span
      font-size .9rem
      font-weight 700
      ~ .van-cell__label
        margin-top .3rem
  .detail-label
    color #63bae8
    font-size .6rem
    line-height 1.5
  .detail-price
    position absolute
    bottom 0
    right 0
    white-space nowrap
    font-size .6rem
    line-height 1.5
    em
      font-size .75rem
      color #f6aa84
      font-style normal
      &:before
        content '￥'
        font-size .6rem
.cell-img-icon
  position relative
  display inline-block
  margin-right .25rem
  width 1rem
  height 1.2rem
  background no-repeat center center
  background-size contain
  &.cell-icon-location
    background-image url('../assets/icon-location.png')
  &.cell-icon-contact
    background-image url('../assets/icon-contact.png')
</style>
