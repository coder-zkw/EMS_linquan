<template>
  <div class="WorkerOrder">
    <div class="el-page-header">
      <el-page-header @back="$router.back()" content="工单列表"></el-page-header>
      <div class="exitBut">
        <search-input @workSearch="workSearch"></search-input>
        <el-button plain size="small" @click="refreshData">
          <i class="el-icon-search"></i> 查询
        </el-button>
      </div>
    </div>
    <div class="btnwrap">
      <el-button type="info" size="small" @click="detailWorkOrder(currentRow)">查看详情</el-button>
      <el-button type="warning" size="small" @click="toExamine">首/中/末检</el-button>
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
      <el-table-column type="index" width="45"></el-table-column>
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
      keepData: [],
      // 弹出框用，全部列
      columnsAll: [],
      // 弹出框用，某行具体内容
      detailData: [],
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
      isMoveButton: true,
      // 当前行信息
      currentRow: null,
      // 查找工单的值
      workVal: '',
      userName: localStorage.getItem('userName'),
      operator: localStorage.getItem('operator'),
      jobNum: localStorage.getItem('jobNum')
    }
  },
  // currentdata: null,
  created() {
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
    getWorkList() {
      axios.get(this.httpUrl + 'MES/GetTitle?page=APS_WORKER_SIMPLE')
      // axios.get(' http://mengxuegu.com:7300/mock/5ea245bd2a2f716419f892c5/getApsWorkerTitle')
      .then((res) => {
        this.columns = res.data
      })
      .catch(err => err)
      // axios.get(' http://mengxuegu.com:7300/mock/5ea245bd2a2f716419f892c5/GetApsWorker')
       axios.get(this.httpUrl + 'MES/GetApsWorkerQc?u=' + this.jobNum+'|'+this.operator)
      .then((res) => {
        // console.log(res)
        if(res.status === 200) {
          let datas = res.data
          if(datas.length === 0) {
            return this.$message.warning('查询数据数为0')
          }
          // 工单匹配有值则过滤查询的数据
          if (this.inputVal != '') {
            this.tableData = datas.filter(item => (item.AW_APS_WORKER.indexOf(this.inputVal) != -1))
          }else{
            this.tableData = datas
          }
        }else{
          this.$message.error('获取品检数据失败！')
        }
      })
      .catch(err => err)
      // axios.get('http://mengxuegu.com:7300/mock/5e6a16f0e7a1bb0518bb7477/aps/getApsWorkerTitle')
      axios.get(this.httpUrl + 'MES/GetTitle?page=APS_WORKER')
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
      this.getWorkList()
    },
    refreshData() {
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
    handleCurrentChange(currentRow) {
      this.currentRow = currentRow
    },
    toExamine() {
      if(this.currentRow === null) {
        return this.$message.error('请先选择制令单号！')
      }
      const {AW_APS_WORKER, AW_MACHINE, AW_PRODUCT_HALF, AW_PLAN_DATE} = this.currentRow
      this.$router.push('/home/examine?work='+AW_APS_WORKER+'&machine='+AW_MACHINE+'&product='+AW_PRODUCT_HALF+'&date='+AW_PLAN_DATE)
    },
    workSearch(value) {
      this.inputVal = value
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
