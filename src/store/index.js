import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    currentOrderData: {},
    // 调机扫码结果
    res_scan: '',
    // 首检可扫码项保存数组[{name: 'wire', value: '1234'},{name: 'number', value: '432'}]
    scanItems: []
  },
  mutations: {
    changeOrderData(state, data) {
      state.currentOrderData = data
    },
    changeScans(state, scans) {
      state.res_scan = scans
    },
    changeScanItems(state, newItem) {
      let items = state.scanItems
      // 为空时，直接push
      if(items.length === 0) {
        return items.push(newItem)
      }
      // 否则遍历，有相同name改变其value,否则Push
      items.map(item => {
        if(item.name === newItem.name) {
          item.value = newItem.value
        }else{
          items.push(newItem)
        }
      })
    },
    emptyScanItems(state) {
      state.scanItems = []
    }
  },
  actions: {
    handleChangeOrder(context, data) {
      context.commit('changeOrderData', data)
    },
    handleChangeScans(context, scans) {
      context.commit('changeScans', scans)
    },
    handleChangeScanItems(context, newItem) {
      context.commit('changeScanItems', newItem)
    },
    handleEmptyScanItems(context) {
      context.commit('emptyScanItems')
    }
  },
  getter: {

  }
})

export default store