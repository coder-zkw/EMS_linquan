<template>
  <div id="app">
    <!-- <keep-alive>
      <router-view v-if="iskeepAlive"></router-view>
    </keep-alive> -->
    <router-view></router-view>
  </div>
</template>
<script>
export default {
  name: 'App',
  // data() {
  //   return {
  //     iskeepAlive: this.$route.path === '/login'
  //   }
  // }
}
</script>

<style>
html,body{
  margin: 0;
  padding: 4px;
  font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
}
.el-page-header{
    margin: 10px 0;
}
/* .exitBut{
  position: absolute;
  right: 20px;
  top: 74px;
} */
@media screen and (max-width: 900px) {
  .exitBut{
    top: 26px;
  }
}
</style>
