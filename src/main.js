import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import router from './router'
import store from './store'

Vue.use(ElementUI)
// 声明全局 根URL
// const baseUrl = 'http://192.168.1.120:50814/MES/'
// const baseUrl = 'http://127.0.0.1:8080/MES/'
Vue.prototype.httpUrl = process.env.VUE_APP_BASE_API
Vue.prototype.killBrowserUrl = process.env.VUE_APP_BASE_KILL_API
Vue.prototype.writeUrl = process.env.VUE_APP_BASE_WRITE_API
// 定义事件总线
// var EventBus = new Vue()
// Object.defineProperties(Vue.prototype, {
//   $EventBus: {
//     get: function() {
//       return EventBus
//     }
//   }
// })
Vue.prototype.$EventBus = new Vue()

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
