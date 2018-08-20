<template>
  <div>
    <div class="list-card">
      <router-link v-for="item in list" :key="item.id" :to="`/detail/${item.id}`">
        <van-card class="van-hairline--bottom"
          :title="item.title"
          :thumb="(item.firstpic || item.smallpic) | fixSpotImage"
        >
          <div slot="desc" class="van-card__desc">
            <p class="distance">距您 {{ item.distance | fixDistance }} KM</p>
            <p class="address">{{ item.address }}</p>
          </div>
          <div slot="footer" class="buttons">
            <a class="btn btn-detail" v-if="categoryInfo.type === 'spot'">详情</a>
            <router-link :to="{ path: `/navi/${item.id}`, query: item }" class="btn btn-navi" v-if="categoryInfo.type !== 'restaurant' && categoryInfo.type !== 'hotel'">导航</router-link>
            <span class="price" v-if="categoryInfo.type === 'restaurant'"><em>{{ item.price | fixPrice }}</em> /人</span>
            <span class="price" v-if="categoryInfo.type === 'hotel'"><em>{{ item.price | fixPrice }}</em></span>
          </div>
        </van-card>
      </router-link>
    </div>
    <mugen-scroll :handler="fetchData" :should-handle="!LoadingData">
      <van-loading color="black" v-show="hasMoreData" />
    </mugen-scroll>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { mapActions } from 'vuex'
import { Card, Loading } from 'vant'
import MugenScroll from 'vue-mugen-scroll'
import { fixSpotImage } from '@/service/utils'

export default {
  name: 'List',
  components: {
    MugenScroll,
    [Card.name]: Card,
    [Loading.name]: Loading
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
      categoryId: Number(this.$route.params.id),
      list: [],
      pagination: {
        pageIndex: 1,
        pageSize: 20,
        pageMax: null
      }
    }
  },
  computed: {
    categoryInfo () {
      const info = this.SpotsCategory.filter(item => item.id === this.categoryId)[0]
      if (info) this.$store.commit('SET_PAGE_TITLE', info.name)
      return info || {
        id: this.categoryId,
        name: '未知'
      }
    },
    hasMoreData () {
      return this.pagination.pageMax > this.pagination.pageIndex || !this.pagination.pageMax
    },
    ...mapState([
      'LoadingData',
      'MyLocation',
      'SpotsCategory'
    ])
  },
  created () {
    // this.$store.commit('SET_PAGE_TITLE', '列表')
    // this.fetchData()
  },
  beforeRouteUpdate (to, from, next) {
    if (to.params.id !== from.params.id) {
      this.categoryId = Number(to.params.id)
      this.pagination.pageIndex = 1
      this.pagination.pageMax = null
      this.list = []
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
      if (this.hasMoreData) {
        await this.GET_LOCATION()
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
            this.list = this.list.concat(res.data)
            if (res.data.length === 0) {
              this.pagination.pageMax = this.pagination.pageIndex
            } else {
              this.pagination.pageIndex++
            }
          }
        })
      }
    }
  }
}
</script>

<style lang="stylus">
.list-card
  .van-card
  .van-card__content
  .van-card__thumb
  .van-card__footer
    height 3.3rem
  .van-card
    box-sizing content-box
    padding .6rem 3.7rem .6rem 6.7rem
    margin-top 0
  .van-card__content
    overflow hidden
  .van-card__thumb
    width 5.5rem
    top .6rem
    left .6rem
    img
      width 100%
      height 100%
      object-fit cover
      border-radius .1rem
  .van-card__title
    font-size .8rem
  .van-card__desc
    max-height initial
    margin-top .2rem
    p
      margin .1rem 0
      &.address
        font-size .5rem
  .van-card__footer
    right .6rem
    top .6rem
    .btn
      display block
      width 2.5rem
      height 1rem
      line-height 1rem
      background #5ab6e6
      color #fff
      text-align center
      border-radius 10px
      font-size 11px
      &.btn-detail
        background-color #f5a37a
        margin .1rem 0 1rem
    .price
      position absolute
      bottom 0
      right 0
      white-space nowrap
      font-size .6rem
      em
        font-size .75rem
        color #f6aa84
        font-style normal
        &:before
          content '￥'
          font-size .6rem
</style>
