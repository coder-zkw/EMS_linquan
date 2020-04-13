import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    currentOrderData: {},
    res_scan: 'asd'
  },
  mutations: {
    changeOrderData(state, data) {
      state.currentOrderData = data
    },
    changeScans(state, scans) {
      state.res_scan = scans
    }
  },
  actions: {
    handleChangeOrder(context, data) {
      context.commit('changeOrderData', data)
    },
    handleChangeScans(context, scans) {
      context.commit('changeScans', scans)
    }
  },
  getter: {

  }
})

export default store