<template>
  <div class="WorkerOrder">
    <div class="el-page-header">
      <div class="el-page-header__left">
        <i class="el-icon-s-home"></i>
        <div class="el-page-header__title">首页</div>
      </div>
      <div class="el-page-header__content">工单列表</div>
      <div class="exitBut">
        <el-date-picker
          v-model="valueDate"
          type="date"
          @change="valueChange"
          format="yyyy/MM/dd"
          value-format="yyyy/MM/dd"
          placeholder="选择日期">
        </el-date-picker>
        <el-button plain @click="refreshData">刷新</el-button>
        <exit-btn class="btn_group"  :isFullscreen="isfullScreen"></exit-btn>
      </div>
    </div>
    <div class="btnwrap">
      <el-button type="info" @click="detailWorkOrder(currentRow)">查看详情</el-button>
      <el-button type="primary" :disabled="isTuneStart" v-if="isShowTune" @click="tuningStart">开始调机</el-button>
      <el-button type="success" :disabled="isTuneEnd" v-if="isShowTune" @click="tuningEnd">结束调机</el-button>
      <el-button type="warning" v-if="isShowExamine" @click="toExamine">首/末/巡检</el-button>
    </div>
    <!-- 工单列表 -->
    <el-table
      :data="tableData"
      ref="tableRef"
      border
      :height="tableHeight"
      highlight-current-row
      @current-change="handleCurrentChange"
      style="width: 100%">
      <el-table-column type="index" width="42"></el-table-column>
      <el-table-column
        v-for="(item, i) in columns"
        :prop="item.S_NAME"
        :label="item.S_CHINESE"
        :key="i"
        :width="i===0 ? '65' : ''"
        :min-width="item.S_NAME==='AW_LINE' ? '120' : ''">
      </el-table-column>
    </el-table>
    <!-- 上下按钮 -->
    <el-row class="moveBit" v-if="isMoveButton">
      <el-button icon="el-icon-bottom" plain circle :disabled="moveBottom" @click="moveing(360)"></el-button>
      <el-button icon="el-icon-top" plain circle :disabled="moveTop" @click="moveing(-360)"></el-button>
    </el-row>
    <!-- 详情弹出框 -->
    <el-dialog
      title="工单详情"
      :visible.sync="dialogWorkVisible"
      @close="dialogClosed"
      width="80%">
      <!-- 工单详情列表 -->
      <el-row :gutter="12">
      <el-col :span="12" class="detailsText" shadow="always" v-for="(item,i) in columnsAll" :key="i">
          <span class="machine_title">{{item.S_CHINESE}}:</span>
          <span>{{detailData[i]}}</span>
      </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'
import ExitBtn from './ExitButton'
import getCurrentTime from '../utils/currentTime'

export default {
  components: { ExitBtn },
  data() {
    return {
      // 选择部分展示列
      columns: [],
      // 所有行数据全部展示
      tableData: [],
      // 弹出框用，全部列
      columnsAll: [],
      // 弹出框用，某行具体内容
      detailData: [],
      // 弹出框切换显示/隐藏
      dialogWorkVisible: false,
      // 选择日期的值
      valueDate: '',
      // 上移，下移按钮是否禁用
      moveTop: true,
      moveBottom: false,
      // 保留上一次滚动高度，
      preHeight: 0,
      // 表格高度
      tableHeight: 0,
      // 是否显示移动按钮
      isMoveButton: true,
      // 当前行信息
      currentRow: null,
      userName: localStorage.getItem('userName'),
      operator: localStorage.getItem('operator'),
      isFull: false,
      isfullScreen: false,
      // 开始、结束调机禁用切换
      isTuneStart: true,
      isTuneEnd: true,
      // 按钮显示隐藏切换
      isShowTune: localStorage.getItem('author') === '1' ? true : false,
      isShowExamine: localStorage.getItem('author') === '2' ? true : false
    }
  },
  // currentdata: null,
  created() {
    // const screenHeight = window.screen.height
    // const screenHeight = window.screen.availHeight
  
    // 获取工单列表
    this.getWorkList()
  },
  mounted() {
    // 定义表格高度
    setTimeout(() => {
        this.tableHeight = window.innerHeight - this.$refs.tableRef.$el.offsetTop - 30
      }, 100)
    window.onresize = () => {
      this.$nextTick(() => {
        // 监听工单列表高度变化
        this.tableHeight = window.innerHeight - this.$refs.tableRef.$el.offsetTop - 30
        // 监听是否全屏切换
        this.isFull = document.fullscreenElement || 
          document.msFullscreenElement || 
          document.mozFullScreenElement ||
          document.webkitFullscreenElement || false
      })
    }
  },
  beforeUpdate(){
    // 处理表格可滚动高度刷新偶尔不一致问题，tableHeight>0,减少一些不必要的重载
    if(this.tableHeight > 0){
      this.$nextTick(()=>{
        this.$refs.tableRef.doLayout()
      })
    }
  },
  updated() {
    // 获取表格的滚动区域
    const tableBody = this.$refs.tableRef.$refs.bodyWrapper
    // 当有滚动条时，滚动按钮出现，否则隐藏
    // console.log(tableBody.scrollHeight, tableBody.clientHeight)
    if(tableBody.scrollHeight <= tableBody.clientHeight) {
      this.isMoveButton = false
    }else{
      this.isMoveButton = true
    }
  },
  methods: {
    getWorkList(time, isNew) {
      // axios.get(this.httpUrl + 'GetTitle?page=APS_WORKER_SIMPLE')
      axios.get('http://mengxuegu.com:7300/mock/5e6a16f0e7a1bb0518bb7477/aps/getApsWorkerTitle_copy')
      .then((res) => {
        this.columns = res.data
      })
      .catch(err => err)
      const baseDate = time || getCurrentTime(new Date()).split(' ')[0]
      axios.get('http://mengxuegu.com:7300/mock/5e6a16f0e7a1bb0518bb7477/aps/GetApsWorker?machine=' + this.userName + '&time=' + baseDate)
      // axios.get(this.httpUrl + 'GetApsWorker?machine=' + this.userName + '&time=' + baseDate)
      .then((res) => {
        this.tableData = res.data
        if(isNew === true) {
          this.$message({
            type: 'success',
            message: '数据已更新',
            duration: 1000
          })
        }
      })
      .catch(err => err)
      axios.get('http://mengxuegu.com:7300/mock/5e6a16f0e7a1bb0518bb7477/aps/getApsWorkerTitle')
      // axios.get(this.httpUrl + 'GetTitle?page=APS_WORKER')
      .then((res) => {
        this.columnsAll = res.data
      })
    },
    detailWorkOrder(row) {
      if(row === null) {
        return this.$message.error('请先选择制令单号！')
      }
      // console.log(this.columnsAll)
      for(let i = 0; i < this.columnsAll.length; i++) {
        // console.log(this.columnsAll[i].S_NAME)
        this.detailData.push(row[this.columnsAll[i].S_NAME])
      }
      this.dialogWorkVisible = true
    },
    dialogClosed() {
      // 弹出框关闭，清空详情数据
      this.detailData = []
    },
    valueChange() {
      // console.log(this.valueDate)
      // 选择时间后，重新获取工单列表
      this.getWorkList(this.valueDate)
    },
    refreshData() {
      this.getWorkList(this.valueDate, true)
    },
    moveing(distance) {
      // 获取表格dom
      const obj = this.$refs.tableRef
      // 滚动条高度改变，distance传的增或减的距离
      // console.log(obj.$refs)
      obj.$refs.bodyWrapper.scrollTop += distance
      // 获取当前滚动高度
      let height = obj.$refs.bodyWrapper.scrollTop
      // 当滚动高度为0时，禁用向上滚动按钮
      if(height <= 0) {
        this.moveTop = true
      }else{
        this.moveTop = false
      }
      // 当滚动新高度与上一次高度相同时，禁用向下滚动按钮
      if(height === this.preHeight) {
        this.moveBottom = true
      }else{
        this.moveBottom = false
      }
      // 把当前滚动高度保存到上一次滚动高度中，留在最后比较用
      this.preHeight = height
    },
    handleCurrentChange(currentRow) {
      this.currentRow = currentRow
      // 传0验证当前工单是否已开始调机
      this.setStartTime(0)
    },
    tuningStart() {
      // 写入开始调机时间
      this.setStartTime()
      // 跳至物料验证页面
      this.$router.push('/materials_1?isCheck='+this.currentRow.SW_CHECK+'&work='+this.currentRow.AW_APS_WORKER+'&product='+this.currentRow.AW_PRODUCT_HALF)
    },
    tuningEnd() {
      const MT_WORKER = this.currentRow.AW_APS_WORKER
      const MT_PRODUCT_HALF = this.currentRow.AW_PRODUCT_HALF
      const MT_MACHINE = this.userName
      const MT_DOUSER = this.operator
      const MT_ENDTIME = getCurrentTime(new Date())
      // 开始调机，开始时间传后台
      axios.post(this.httpUrl + 'Tune', {MT_WORKER,MT_PRODUCT_HALF,MT_MACHINE,MT_DOUSER,MT_ENDTIME})
      .then((res) => {
          // console.log(res)
          if(res.data.code === 200) {
            this.$message.success('调机结束时间已保存成功！')
            this.isTuneEnd = true
          }else if(res.data.code === 401) {
            this.$message.error(res.data.value)
          }else{
            this.$message.error('结束时间写入失败，请重试！')
          }
      }).catch(err => err)
    },
    setStartTime(time) {
        const MT_WORKER = this.currentRow.AW_APS_WORKER
        const MT_PRODUCT_HALF = this.currentRow.AW_PRODUCT_HALF
        const MT_MACHINE = this.userName
        const MT_DOUSER = this.operator
        const MT_STARTTIME = (time === 0 ? '' : getCurrentTime(new Date()))
        // 开始调机，开始时间传后台
        axios.post(this.httpUrl + 'Tune', {MT_WORKER,MT_PRODUCT_HALF,MT_MACHINE,MT_DOUSER,MT_STARTTIME})
        .then((res) => {
            // console.log(res)
            if(res.data.code === 200) {
              // time为空时，才验证是否在调机中
              if(time === 0) {
                // 返回数组为空，说明没有正在调机的工单，开始调机开
                if(res.data.data.length === 0) {
                  this.isTuneStart = false
                  this.isTuneEnd = true
                }else {
                  const work = res.data.data[0].MT_WORKER
                  const user = res.data.data[0].MT_DOUSER
                  if(work === this.currentRow.AW_APS_WORKER) {
                    // 结束调机按钮开
                    this.isTuneStart = true
                    this.isTuneEnd = false
                  }else{
                    // 提示有未结束的调机工单
                    this.$message({
                      type: 'error',
                      message: user+' 有未结束调机的工单：'+ work,
                      duration: 1500
                    })
                    this.isTuneEnd = true
                  }
                }
              }
            // code不为200时
            }else{
              if(time === 0) {
                this.$message.error('验证此工单是否在调机状态失败，请重试！')
              }else{
                this.$message.error('开始时间写入失败，请重试！')
              }
            }
        }).catch(err => err)
    },
    toExamine() {
      if(this.currentRow === null) {
        return this.$message.error('请先选择制令单号！')
      }
      this.$router.push('/examine?work='+this.currentRow.AW_APS_WORKER+'&product='+this.currentRow.AW_PRODUCT_HALF)
    }
  },
  watch: {
    // 监听是否全屏，val为false时，当前不是全屏，点击后显示全屏按钮为true。否则为false变为非全屏按钮
    isFull(val) {
      if(val === false) {
          this.isfullScreen = false
      }else{
          this.isfullScreen = true
      }
    }
  }
}
</script>
<style scoped>
.el-icon-s-home{
  padding: 4px;
}
.machine_title{
  display: inline-block;
  width: 100px;
}
.btn_group{
  margin-left: 10px;
}
.btnwrap{
  margin-bottom: 20px;
  text-align: right;
}
@media screen and (max-width: 1100px) {
  .el-table{
    font-size: 12px;
  }
  /deep/ .el-table .cell{
    padding: 0 5px;
  }
}
.detailsText{
  padding: 5px 0;
  font-size: 15px;
  border-bottom: 1px solid #eee;
}
.el-date-editor{
  margin-right: 10px;
}
.moveBit{
  position: fixed;
  bottom: 84px;
  left: 50%;
  transform: translateX(-63px);
}
/deep/ .moveBit>.el-button{
  font-size: 32px;
  background-color: transparent;
  color: #3a8ee6;
  border: 1px solid #3a8ee6;
}
/deep/ .el-table__body tr.current-row>td{
  background: #409EFF;
  color: #fff;
}
</style>
