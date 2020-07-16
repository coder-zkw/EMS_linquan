<template>
  <div class="WorkerOrder">
    <div class="el-page-header">
      <!-- <div class="el-page-header__left">
        <i class="el-icon-s-home"></i>
        <div class="el-page-header__title">首页</div>
      </div>
      <div class="el-page-header__content">工单列表</div> -->
      <el-page-header @back="$router.back()" content="工单列表"></el-page-header>
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
        <el-button plain size="small" @click="refreshData">
          <i class="el-icon-search"></i> 查询
        </el-button>
      </div>
    </div>
    <div class="btnwrap">
      <el-button type="info" size="small" @click="detailWorkOrder(currentRow)">查看详情</el-button>
      <el-button type="success" size="small" :disabled="isTuneStart" @click="getReasons">开始调机</el-button>
      <el-button type="primary" size="small" :disabled="isMaterial" @click="verification(currentRow)">条码验证</el-button>
      <el-button type="danger" size="small" :disabled="isTuneEnd" @click="tuningEnd">结束调机</el-button>
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
    <el-row class="moveBit" v-if="isMoveButton" v-show="isSee">
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
    <!-- 调机原因选择弹出框 -->
    <el-dialog
      title="调机原因"
      :visible.sync="dialogReasonVisible"
      @close="dialogClosed"
      width="60%">
      <div class="block">请选择调机原因：
        <el-cascader v-model="reasonVal" :options="reasonOpt"></el-cascader>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogReasonVisible = false">取 消</el-button>
        <el-button type="primary" @click="tuningCheck">确 定</el-button>
      </span>
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
      isMoveButton: false,
      isSee: localStorage.getItem('isKeyboard') === 'true',
      // 当前行信息
      currentRow: null,
      // 查找工单的值
      workVal: '',
      userName: localStorage.getItem('userName'),
      company: localStorage.getItem('company'),
      operator: localStorage.getItem('operator'),
      // 调机原因弹出框
      dialogReasonVisible: false,
      reasonVal: '',
      // 调机原因数据
      reasonOpt: [],
      // 开始、结束调机禁用切换
      isTuneStart: true,
      // 条码验证按钮禁用切换
      isMaterial: true,
      isTuneEnd: true,
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
       axios.get(this.httpUrl + 'MES/GetApsWorkerQ?machine=' + this.userName + '&time=' + this.startDate + '&EndTime=' +this.endDate)
      .then((res) => {
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
          this.$message.error('获取调机y数据失败！')
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
      // 传0验证当前工单是否已开始调机
      this.setStartTime(0)
    },
    getReasons() {
      // 先清空上次的数据
      this.reasonOpt = []
      axios.get(this.httpUrl + 'MES/GetTuneNg')
      .then(res => {
        // console.log(res)
        if(res.data.code === 200) {
          const datas = res.data.data
          const obj = {}
          // 把获取的数据进行归类处理成一个对象
          datas.map(item => {
            if(!obj[item.F_ITEMCODE]) {
              obj[item.F_ITEMCODE] = [item.F_ITEMNAME]
            }else{
              obj[item.F_ITEMCODE].push(item.F_ITEMNAME)
            }
          })
          // 把归类后的对象处理成渲染二级列表所需的对象格式
          for(let key in obj) {
            let o = {}
            o.label = key+'类'
            o.value = key
            o.children = []
            obj[key].map(item => {
              o.children.push({
                label: item,
                value: item
              })
            })
            this.reasonOpt.push(o)
          }
          // console.log(this.reasonOpt)
        }else{
          this.$message.error('获取调机原因列表失败！')
        }
      }).catch(err => err)
      // 调机原因弹出框弹出进行选择操作
      this.dialogReasonVisible = true
    },
    // 验证机台是否运行中，未运行才可开始调机
    tuningCheck() {
      if(this.reasonVal === '') {
        this.$message.error('请选择调机原因！')
        return
      }
      // 调机原因弹出框关闭
      this.dialogReasonVisible = false
      // 非林全机台直接开始调机
      if(this.company === 1) {
          return this.tuningStart()
      }
      this.tuningStart()
      // 林全机台需查看设备是否在运行中，需停机才可开始调机
      // axios.get(this.writeUrl+'cmd/getMachineStatusRs?machineName='+this.userName)
      // axios.get(this.writeUrl+'cmd/getMachineStatusRs', {params: {machineName: this.userName}})
      // let formdata = new FormData()
      // formdata.append('machineName', this.userName)
      // axios.post(this.writeUrl+'cmd/getMachineStatusRs', formdata)
      // .then(res => {
      //   // console.log(res)
      //   const data = res.data
      //   if(data.code === 200) {
      //     if(data.content === 'Stop') {
      //       // 机台停止状态，则开始调机
      //       this.tuningStart()
      //     }else{
      //       this.$message.error('设备运行中，调机需停止运行！')
      //     }
      //   }else if(data.code === 500) {
      //     this.$message.warning('获取状态超时，请重试！')
      //   }else{
      //     this.$message.error('获取状态失败，请重试！')
      //   }
      // }).catch(() => {
      //   this.$message.error('获取状态请求错误！')
      // })
    },
    tuningStart() {
      // 写入开始调机时间
      this.setStartTime()
      this.$confirm('已开始调机，是否立即进行条码验证？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 跳转至条码验证页面
        // this.toMaterials()
        this.verification(this.currentRow)
      }).catch(err => err)
    },
    tuningEnd(e, work, machine, product) {
      const MT_WORKER = work || this.currentRow.AW_APS_WORKER
      const MT_PRODUCT_HALF = product || this.currentRow.AW_PRODUCT_HALF
      const MT_MACHINE = machine || this.userName
      const MT_DOUSER = this.operator
      const MT_ENDTIME = getCurrentTime(new Date())
      // 结束调机，结束时间传后台
      axios.post(this.httpUrl + 'MES/Tune', {MT_WORKER,MT_PRODUCT_HALF,MT_MACHINE,MT_DOUSER,MT_ENDTIME})
      .then((res) => {
          // console.log(res)
          if(res.data.code === 200) {
            this.$message.success('调机结束时间已保存成功！')
            // 结束调机成功后，条码验证按钮、结束调机按钮禁用开
            this.isMaterial = true
            this.isTuneEnd = true
          }else if(res.data.code === 401) {
            this.$message.error(res.data.value)
          }else{
            this.$message.error('结束时间写入失败，请重试！')
          }
      }).catch(err => err)
      // 结束调机，发送请求通知上位机切换操作员权限
      let formdata = new FormData()
      formdata.append('machineName', this.userName)
      axios.post(this.writeUrl+'cmd/changeUser', formdata)
      .then(res => {
        if(res.data.code === 200) {
          this.$message.success('上位机切换操作员权限成功！')
        }else{
          this.$message.error('上位机切换操作权限失败！请手动切换')
        }
      }).catch(() => {
        this.$message.error('上位机自动切换操作权限失败！请手动切换')
      })
    },
    setStartTime(time) {
        const MT_WORKER = this.currentRow.AW_APS_WORKER
        const MT_PRODUCT_HALF = this.currentRow.AW_PRODUCT_HALF
        const MT_MACHINE = this.userName
        const MT_DOUSER = this.operator
        const MT_STARTTIME = (time === 0 ? '' : getCurrentTime(new Date()))
        // 调机原因
        const F_ITEMCODE = this.reasonVal[0]
        const F_ITEMNAME = this.reasonVal[1]
        // 开始调机，开始时间传后台
        axios.post(this.httpUrl + 'MES/Tune', {MT_WORKER,MT_PRODUCT_HALF,MT_MACHINE,MT_DOUSER,MT_STARTTIME,F_ITEMCODE,F_ITEMNAME})
        .then((res) => {
            // console.log(res)
            if(res.data.code === 200) {
              // time为0时，才验证是否在调机中
              if(time === 0) {
                // 正在调机的设备
                const machines = res.data.data
                // 返回数组为空，说明没有正在调机的工单，开始调机开
                if(machines.length === 0) {
                  this.isTuneStart = false
                  // this.isMaterial = false
                  this.isTuneEnd = true
                }else {
                  const work = machines[0].MT_WORKER
                  const machine = machines[0].MT_MACHINE
                  const product = machines[0].MT_PRODUCT_HALF
                  if(work === this.currentRow.AW_APS_WORKER) {
                    // 条码验证、结束调机按钮开
                    this.isTuneStart = true
                    this.isMaterial = false
                    this.isTuneEnd = false
                  }else{
                    // 提示有未结束的调机工单
                    this.isTuneOver(work, machine, product)
                    this.isTuneEnd = true
                  }
                }
              }else{
                // time不为0时，点击开始调机按钮后，开始调机按钮禁用开，条码验证按钮禁用关
                this.isTuneStart = true
                this.isMaterial = false
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
    // 确定是否立即结束未结束的调机工单
    isTuneOver(work, machine, product) {
      this.$confirm(machine+'有未结束调机的工单：'+work+',是否结束？', '提示', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
      }).then(() => {
        this.tuningEnd(null, work, machine, product)
      }).catch(err => err)
    },
    // 条码验证
    verification(row) {
      this.$confirm('点击确定后，将会向机台写入制令信息，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 工单号传参
        const work_Id = row.AW_PRODUCT_HALF
        const worker = row.AW_APS_WORKER
        // const isCheck = row.SW_CHECK
        // 获取缓存中设备名首字母并转为小写
        const userName = localStorage.getItem('userName')
        // 林全机台，则写入制令信息，否则不用写
        if(this.company === '0'){
          // 校验是否通过允许跳转
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
        }
        // 无论是否写制令信息，都跳转物料验证页面
        this.toMaterials()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消验证'
        })       
      })
    },
    toMaterials() {
      const {AW_CLASS, AW_APS_WORKER, AW_PRODUCT_HALF, SW_CHECK} = this.currentRow
      if(AW_CLASS === 'APS') {
        axios.get(this.httpUrl + 'MES/GetProductHalf?wo='+ AW_PRODUCT_HALF)
        .then((res) => {
            // console.log(res)
            let isCheck = '0';
            if(res.data.length > 0){
              isCheck = '1'
            }
            this.$router.push('/home/materials_1?isCheck='+isCheck+'&work='+AW_APS_WORKER+'&product='+AW_PRODUCT_HALF)
        }).catch(err => err)
      }else{
        // 跳至物料验证页面
        this.$router.push('/home/materials_1?isCheck='+SW_CHECK+'&work='+AW_APS_WORKER+'&product='+AW_PRODUCT_HALF)
      }
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
