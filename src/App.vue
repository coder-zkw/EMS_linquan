<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
html,body{
  margin: 0;
  padding: 4px;
}
.el-page-header{
    margin: 30px 0;
}
.exitBut{
  position: absolute;
  right: 20px;
  top: 20px;
}
@media screen and (max-width: 900px) {
  .exitBut{
    top: 26px;
  }
}
</style>
