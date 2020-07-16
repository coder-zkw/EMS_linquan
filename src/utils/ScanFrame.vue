<template>
  <div class="scan">
    <div id="bcid">
      <div style="height:40%"></div>
      <p class="tip">...载入中...</p>
    </div>
    <footer>
      <el-button type="primary" @click="exitSao">退出扫描</el-button>
    </footer>
  </div>
</template>

<script type='text/ecmascript-6'>
  let scan = null

  export default {
    methods: {
      handleScan() {
          this.startRecognize()
          this.startScan()
          // this.$emit('getScan', 'machine02')
      },
      // 创建扫描控件
      startRecognize () {
        // let that = this
        if (!window.plus) return
        scan = new plus.barcode.Barcode('bcid')
        scan.onmarked = (type, result, file) => {
          switch (type) {
            case plus.barcode.QR:
              type = 'QR'
              break
            case plus.barcode.EAN13:
              type = 'EAN13'
              break
            case plus.barcode.EAN8:
              type = 'EAN8'
              break
            default:
              type = '其它' + type
              break
          }
          result = result.replace(/\n/g, '')
          // 将扫描结果传给父组件
          this.$emit('getScan', result)
          // alert(result)
          this.exitSao()
        }
      },
      // 开始扫描
      startScan () {
        if (!window.plus) return
        scan.start()
      },
      // 关闭扫描
      cancelScan () {
        if (!window.plus) return
        scan.cancel()
      },
      // 关闭条码识别控件
      closeScan () {
        if (!window.plus) return
        scan.close()
      },
      exitSao () {
        // 手动退出，先关闭扫描
        this.cancelScan()
        this.closeScan()
        this.$emit('closeScan')
      }
    }
  }
</script>
<style scoped>
  .scan {
    height: 100%;
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 6rem;
    text-align: center;
    color: #fff;
    background: #ccc;
    z-index: 9999;
  }
  #bcid {
    width: 100%;
    height: 84%;
  }
  footer {
    width: 100%;
    position: absolute;
    bottom: 2rem;
  }
</style>
