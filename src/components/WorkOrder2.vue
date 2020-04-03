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
        <exit-btn class="btn_group"></exit-btn>
      </div>
    </div>
    <div class="btnwrap">
      <el-button type="info" @click="detailWorkOrder(currentRow)">查看详情</el-button>
      <el-button type="primary" @click="tuningStart">开始调机</el-button>
      <el-button type="warning" @click="toExamine">首/末/巡检</el-button>
      <el-button type="success" @click="tuningEnd">结束调机</el-button>
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
      operator: localStorage.getItem('operator')
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
      this.tableHeight = window.innerHeight - this.$refs.tableRef.$el.offsetTop -60
    }, 100)
    
  },
  beforeUpdate(){
    // 处理表格可滚动高度刷新偶尔不一致问题，tableHeight>0,减少一些不必要的重载
    if(this.tableHeight > 0){
      // this.$nextTick(()=>{
        this.$refs.tableRef.doLayout()
      // })
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
      // axios.get('http://mengxuegu.com:7300/mock/5e6a16f0e7a1bb0518bb7477/aps/getApsWorkerTitle')
      axios.get(this.httpUrl + 'GetTitle?page=APS_WORKER')
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
    },
    tuningStart() {
      if(this.currentRow === null) {
        return this.$message.error('请先选择制令单号！')
      }
      // 跳至物料验证页面
      this.$router.push('/materials?type=tune&work='+this.currentRow.AW_APS_WORKER+'&product='+this.currentRow.AW_PRODUCT_HALF)
    },
    tuningEnd() {
      if(this.currentRow === null) {
        return this.$message.error('请先选择制令单号！')
      }
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
          }else if(res.data.code === 401) {
            this.$message.error(res.data.value)
          }else{
              this.$message.error('结束时间写入失败，请重试！')
          }
      }).catch(err => err)
    },
    toExamine() {
      if(this.currentRow === null) {
        return this.$message.error('请先选择制令单号！')
      }
      this.$router.push('/examine?work='+this.currentRow.AW_APS_WORKER+'&product='+this.currentRow.AW_PRODUCT_HALF)
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
</style>
