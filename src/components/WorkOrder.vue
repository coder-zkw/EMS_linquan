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
        <el-button class="fullScreen" type="info" plain @click="toggleFullscreen">全屏</el-button>
        <el-button  type="primary" plain @click="exiting">退出</el-button>
      </div>
    </div>
    <el-table
      :data="tableData"
      border
      style="width: 100%">
      <el-table-column type="index" width="40"></el-table-column>
      <el-table-column v-for="(item, i) in columns" :prop="item.S_NAME" :label="item.S_CHINESE" :key="i"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="info" @click="detailWorkOrder(scope.row)">详情</el-button>
          <el-button type="primary" @click="jumpTo(scope.row)">开始生产</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 详情弹出框 -->
    <el-dialog
      title="工单详情"
      :visible.sync="dialogWorkVisible"
      @close="dialogClosed">
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
import screenfull from 'screenfull'
import currentTime from '../utils/currentTime'

export default {
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
      valueDate: '',
      isFullscreen: false
    }
  },
  currentdata: null,
  created() {
    this.getWorkList()
  },
  beforeDestroy() {
    // 当前条有数据时，通过事件总线传送给看板页面
    if(this.currentdata != null) {
      this.$EventBus.$emit("sendMsg", this.currentdata)
    }
  },
  methods: {
    getWorkList(time) {
      const userName = localStorage.getItem('userName')
      axios.get(this.httpUrl + 'GetTitle?page=APS_WORKER')
      // axios.get(' http://mengxuegu.com:7300/mock/5e6a16f0e7a1bb0518bb7477/aps/getApsWorkerTitle?page=APS_WORKER')
      .then((res) => {
        // console.log(res)
        this.columnsAll = res.data
        // 声明一个新数组存放要展示的列
        let newArr = []
        newArr.push(res.data[0])
        newArr.push(res.data[1])
        newArr.push(res.data[2])
        newArr.push(res.data[6])
        newArr.push(res.data[11])
        // 把要展示的列放入数据源
        this.columns = newArr
      })
      .catch(err => err)
      // console.log(userName)
      axios.get(this.httpUrl + 'GetApsWorker?machine=' + userName)
      // axios.get('http://mengxuegu.com:7300/mock/5e6a16f0e7a1bb0518bb7477/aps/getWorkerByMachine?machine=' + userName)
      .then((res) => {
        // console.log(res)
        // 有选择时间用选择的时间，没有用当前时间截取出年月日
        const baseDate = time || currentTime.split(' ')[0]
        // 过滤出符合时间的内容
        this.tableData = res.data.filter(item => item.AW_PLAN_DATE === baseDate)
      })
      .catch(err => err)
    },
    jumpTo(row) {
      // console.log(row)
      // 工单号传参
      const work_Id = row.AW_PRODUCT_HALF
      const worker = row.AW_APS_WORKER
      // 获取缓存中设备名首字母并转为小写
      const userName = localStorage.getItem('userName')
      const first_name = userName.substr(0, 1).toLowerCase()
      // 首字母j,调至扫码页面，否则调至看板页面
      if(first_name === 'j') {
        // 校验是否通过允许跳转
        axios.post('http://192.168.1.33:8083/cmd/writeMakeInfo', {machineName: userName, worker})
        .then((res) => {
          // console.log(res)
          // 写入失败，提示手动输入
          if(res.data.code != 200) {
            this.$message.error('指令信息写入失败！请在机台手动输入。')
          }
        }).catch(err => err)
        // 跳转至物料校验页面
        this.$router.push('/materials?work_id=' + work_Id + '&work=' + worker)
      }else {
        // 赋值，currentdata不为null就可通过事件总线把当前行数据传给其他页面
        this.currentdata = row
        this.$router.push('/machine_1?work_id=' + work_Id)
      }
      
    },
    exiting() {
      // 退出至login页面
      this.$router.replace('/login')
    },
    detailWorkOrder(row) {
      // console.log(row)
      this.detailData.push(row.AW_PLAN_DATETIME)
      this.detailData.push(row.AW_PLAN_DATE)
      this.detailData.push(row.AW_PRODUCT_HALF)
      this.detailData.push(row.AW_PRODUCT_END)
      this.detailData.push(row.AW_MACHINE)
      this.detailData.push(row.AW_CLIENT)

      this.detailData.push(row.AW_WORKER)
      this.detailData.push(row.AW_PRODUCT_CLIENT)
      this.detailData.push(row.AW_COUNT_UNFINISH)
      this.detailData.push(row.AW_COUNT_PLAN)
      this.detailData.push(row.AW_CAPACITY)
      this.detailData.push(row.AW_LINE)

      this.detailData.push(row.AW_COUNT_LINE)
      this.detailData.push(row.AW_PRODUCT_TERMINAL1)
      this.detailData.push(row.AW_COUNT_TERMINAL1)
      this.detailData.push(row.AW_PRODUCT_TERMINAL2)
      this.detailData.push(row.AW_COUNT_TERMINAL2)
      this.detailData.push(row.AW_PRODUCT_MOULD1)

      this.detailData.push(row.AW_PRODUCT_MOULD2)
      this.detailData.push(row.AW_DOTIME)
      this.detailData.push(row.AW_APS_WORKER)
      this.dialogWorkVisible = true
    },
    dialogClosed() {
      // 弹出框关闭，清空详情数据
      this.detailData = []
    },
    toggleFullscreen() {
        screenfull.toggle()
        this.isFullscreen = true
    },
    valueChange() {
      // console.log(this.valueDate)
      // 选择时间后，重新获取工单列表
      this.getWorkList(this.valueDate)
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
.detailsText{
  padding: 5px 0;
  font-size: 15px;
  border-bottom: 1px solid #eee;
}
.el-date-editor{
  margin-right: 10px;
}
</style>
