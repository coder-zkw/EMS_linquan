<template>
<div class="scan">
    <div id="bcid">
      <div style="height:40%"></div>
      <p class="tip">...载入中...</p>
    </div>
    <footer>
      <!-- <button @click="startRecognize">1.创建控件</button>
      <button @click="startScan">2.开始扫描</button>
      <button @click="cancelScan">3.结束扫描</button>
      <button @click="closeScan">4.关闭控件</button> -->
      <el-button type="primary" @click="exitSao">退出扫描</el-button>
    </footer>
  </div>
</template>

<script type='text/ecmascript-6'>
  let scan = null

  export default {
    data () {
      return {
        codeUrl: '',
      }
    },
    mounted() {
      this.startRecognize()
      this.startScan()
    },
    methods: {
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

          // 如果有name项，说明是首检页面扫码
          const {name} = this.$route.query
          if(name) {
            this.$store.dispatch('handleChangeScanItems', {name, value: result})
          }else{
            let res_scan = this.$store.state.res_scan
            const isHave = res_scan.split(',').findIndex(item => item===result)
            if(isHave != -1) {
              this.$message.error('此条码已扫描！')
            }else{
              if(res_scan != '') {
                res_scan += ','+result
              }else{
                res_scan = result
              }
              this.$store.dispatch('handleChangeScans', res_scan)
            }
          }

          this.codeUrl = result
          // alert(result)
          this.closeScan()
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
        // 退出扫码返回校验页面
        this.exitSao()
      },
      exitSao () {
        // 手动退出，先关闭扫描
        this.cancelScan()
        
        const {name} = this.$route.query
        // console.log(name)
        if(name) {
          if(name === 'jobNum') {
            this.$router.replace('/login')
          }else{
            this.$router.replace('/home/examine')
          }
        }else {
          const {isCheck, product, work} = this.$route.query
          this.$router.replace('/home/materials_1?isCheck='+isCheck+'&product='+product+'&work='+work)
        } 
      }
    } 
  }
</script>
<style scoped>
  .scan {
    height: 100%;
  }
  #bcid {
    width: 100%;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 6rem;
    text-align: center;
    color: #fff;
    background: #ccc;
  }
  footer {
    position: absolute;
    left: 50%;
    transform: translateX(-49px);
    bottom: 2rem;
    z-index: 2;
  }
</style>
