<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style lang="stylus">
html
body
  background-color #f8f8f8
  font-size 20px
  color #333
.fullpage
  width 100%
  height 100%
  position absolute
  overflow hidden
.mugen-scroll .van-loading
  margin 1rem auto

.map-layer
  position absolute
  z-index 3
  width 100%
  height 100%
  box-sizing border-box
  top calc(100% - 7rem)
  left 0
  background rgba(255, 255, 255, .95)
  box-sizing border-box
  padding 0 .75rem
  transition top .3s
  box-shadow 0 -5px 10px rgba(0, 0, 0, .1)
  &.extend
    top 0
  .spot-info
    position relative
    margin 0
    padding .75rem 0
  .spot-title
    font-size .8rem
    margin 0 0 .25rem
    padding-right 3rem
  .spot-desc
    font-size .6rem
    color #555
    .spot-label
      font-size .5rem
      border 1px solid #ddd
      color #555
      padding 0 .2rem
      margin-right .3rem
      border-radius .2rem
  .spot-navi
    position absolute
    right 0
    top 50%
    margin-top -.5rem
    display block
    height 1rem
    line-height 1rem
    padding 0 .5rem
    background #5ab6e6
    border 0 none
    color #fff
    text-align center
    border-radius 10px
    font-size .55rem
</style>
