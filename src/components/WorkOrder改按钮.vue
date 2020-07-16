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
          size="small"
          v-model="startDate"
          type="date"
          format="yyyy/MM/dd"
          value-format="yyyy/MM/dd"
          placeholder="起始日期">
        </el-date-picker>
        <el-date-picker
          size="small"
          v-model="endDate"
          type="date"
          format="yyyy/MM/dd"
          value-format="yyyy/MM/dd"
          placeholder="截止日期">
        </el-date-picker>
        <search-input @workSearch="workSearch"></search-input>
        <el-button plain size="small" @click="refreshData">查询</el-button>
        <!-- <exit-btn class="btn_group" :isFullscreen="isfullScreen"></exit-btn> -->
      </div>
    </div>
    <el-table
      :data="tableData"
      ref="tableRef"
      size="small"
      border
      :height="tableHeight"
      style="width: 100%">
      <el-table-column type="index" width="45"></el-table-column>
      <el-table-column
        v-for="(item, i) in columns"
        :prop="item.S_NAME"
        :formatter="item.S_NAME==='AW_PLAN_DATETIME' ? formateDate : null"
        :label="item.S_CHINESE"
        :key="i"
        :width="i===0 ? '60' : ''"
        :min-width="item.S_NAME==='AW_LINE' ? '120' : ''"
        show-overflow-tooltip>
      </el-table-column>
      <el-table-column label="操作" width="262">
        <template slot-scope="scope">
          <el-button size="mini" type="info" @click="detailWorkOrder(scope.row)">详情</el-button>
          <el-button size="mini" type="warning" @click="writeInfo(scope.row)">写入制令</el-button>
          <el-button size="mini" type="primary" @click="jumpTo(scope.row)" :disabled="scope.row.AW_STATUS === 0 ? false : true">{{scope.row.AW_STATUS === 0?'开始生产':'生产完成'}}</el-button>
        </template>
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
import SearchInput from './SearchInput'
import getCurrentTime from '../utils/currentTime'

export default {
  components: { SearchInput },
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
      keepData: [],
      // 弹出框切换显示/隐藏
      dialogWorkVisible: false,
      // 开始日期的值
      startDate: '',
      // 结束日期的值
      endDate: '',
      // 匹配工单的值
      inputVal: '',
      // 上移，下移按钮是否禁用
      moveTop: true,
      moveBottom: false,
      // 保留上一次滚动高度，
      preHeight: 0,
      // 表格高度
      tableHeight: 0,
      // 是否显示移动按钮
      isMoveButton: true
    }
  },
  // currentdata: null,
  created() {
    // 获取此时时间点
    const today = new Date()
    // 默认结束时间为当天
    this.endDate = getCurrentTime(today).split(' ')[0]
    // 默认开始时间为当天的前两天
    this.startDate = getCurrentTime(new Date(today.getTime()-2*24*60*60*1000)).split(' ')[0]
    // 获取工单列表
    this.getWorkList()
  },
  mounted() {
    setTimeout(() => {
        this.tableHeight = window.innerHeight - this.$refs.tableRef.$el.offsetTop - 30
      }, 100)
    window.onresize = () => {
      this.$nextTick(() => {
        this.tableHeight = window.innerHeight - this.$refs.tableRef.$el.offsetTop - 30
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
    if(tableBody.scrollHeight <= tableBody.clientHeight) {
      this.isMoveButton = false
    }else{
      this.isMoveButton = true
    }
  },
  methods: {
    getWorkList(time, isNew) {
      const userName = localStorage.getItem('userName')
      // axios.get(this.httpUrl + 'MES/GetTitle?page=APS_WORKER_SIMPLE')
      axios.get(' http://mengxuegu.com:7300/mock/5ea245bd2a2f716419f892c5/getApsWorkerTitle')
      .then((res) => {
        // console.log(res)
        this.columns = res.data
      })
      .catch(err => err)
      // console.log(userName)
      axios.get(' http://mengxuegu.com:7300/mock/5ea245bd2a2f716419f892c5/GetApsWorker')
      // axios.get(this.httpUrl + 'MES/GetApsWorkerQ?machine=' + userName + '&time=' + this.startDate + '&EndTime=' +this.endDate)
      .then((res) => {
        // console.log(res)
        let datas = res.data
        if (this.inputVal != '') {
          this.tableData = datas.filter(item => (item.AW_APS_WORKER.indexOf(this.inputVal) != -1))
        }else{
          this.tableData = datas
        }
        // workSearch(value)
        // this.keepData = this.tableData
      })
      .catch(err => err)
      // axios.get('http://mengxuegu.com:7300/mock/5e6a16f0e7a1bb0518bb7477/aps/getApsWorkerTitle')
      axios.get(this.httpUrl + 'MES/GetTitle?page=APS_WORKER')
      .then((res) => {
        this.columnsAll = res.data
      })
    },
    jumpTo(row) {
      // 之前是否有未完成工单，有则不允许下一步
      axios.post(this.httpUrl + 'MES/WorkerExamine', {PLAN_DATE: row.PLAN_DATE})
      .then(res => {
        // console.log(res)
        if(res.data.code === 200) {
          this.$store.dispatch('handleChangeOrder', row)
          const {AW_CLASS, AW_APS_WORKER, AW_PRODUCT_HALF, SW_CHECK} = row
          if(AW_CLASS === 'APS') {
            axios.get(this.httpUrl + 'MES/GetProductHalf?wo='+ AW_PRODUCT_HALF)
            .then((res) => {
                // console.log(res)
                let isCheck = '0';
                if(res.data.length > 0){
                  isCheck = '1'
                }
                this.$router.push('/home/materials?isCheck='+isCheck+'&work='+AW_APS_WORKER+'&product='+AW_PRODUCT_HALF)
            }).catch(err => err)
          }else{
            // 跳至物料验证页面
            this.$router.push('/home/materials?isCheck='+SW_CHECK+'&work='+AW_APS_WORKER+'&product='+AW_PRODUCT_HALF)
          }
          
        }else{
          this.$message.warning('此工单日期之前还有未完成的工单！请按序生产')
        }
      }).catch(err => err)
    },
    writeInfo(row) {
       // 获取缓存中设备名,是否林全设备
      const company = localStorage.getItem('company')
       // 工单号传参
      const work_Id = row.AW_PRODUCT_HALF
      const worker = row.AW_APS_WORKER
      // this.currentdata = row
      if(company === '0') {
        // 林全机台校验是否通过允许跳转
        this.$confirm('点击确定后，将会向机台写入制令信息，是否继续？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const userName = localStorage.getItem('userName')
          // 发送写入指令信息请求
          let formdata = new FormData()  
          formdata.append('machineName', userName)
          formdata.append('worker', worker)
          // axios.get(this.writeUrl +'cmd/writeMakeInfo?machineName='+userName+'&worker='+worker)
          axios.post(this.writeUrl +'cmd/writeMakeInfo', formdata)
          .then((res) => {
            // console.log(res)
            // 写入失败，提示手动输入
            if(res.data.code != 200) {
              this.$message.error('未找到'+work_Id+'制令信息！请在机台手动输入。')
            }
          }).catch(() => this.$message.error('制令信息写入失败！请在机台手动输入。'))
          
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消写入指令信息'
          })       
        })
      }
    },
    detailWorkOrder(row) {
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
      // this.getWorkList(this.valueDate, true)
      this.getWorkList()
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
    workSearch(value) {
      this.inputVal = value
      // 从获取的所有数据中筛选出包含搜索框内容的数据
      // const searchData = this.keepData.filter(item => (item.AW_APS_WORKER.indexOf(value) != -1))
      // this.tableData = searchData
    },
    formateDate(row) {
      console.log(row)
      return row.AW_PLAN_DATETIME.substr(0, 10)
    }
  }
}
</script>
<style scoped>
.el-page-header{
  display: flex;
  align-items: center;
}
.exitBut{
  flex: 1;
  display: flex;
  justify-content: flex-end;
}
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
  width: 140px;
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
