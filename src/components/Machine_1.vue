<template>
    <div class="machine1">
        <el-page-header @back="goBack" content="机台看板"></el-page-header>
        <div class="exitBut">
            <exit-btn :isFullscreen="isfullScreen"></exit-btn>
        </div>
        <el-row :gutter="12">
            <el-col :span="12" v-for="(item,i) in titles" :key="item">
                <el-card class="bottom_width" shadow="always">
                    <span class="machine_title">{{item}}：</span>
                    <el-tag :type="i === 7 ? '': 'success'" :class="i === 7 ? 'count': ''" v-if="result[i] != null">{{i === 7 ? count : result[i]}}</el-tag>
                </el-card>
            </el-col>
        </el-row>
        <!-- <el-table
            :data="tableData"
            border
            style="width: 100%">
            <el-table-column type="index" width="40"></el-table-column>
            <el-table-column v-for="(item, i) in columns" :prop="item.tname" :label="item.tmark" :key="i"></el-table-column>
            <el-table-column label="操作">
                <template slot-scope="scope">
                <el-button size="mini" type="primary" @click="jumpTo(scope.row.id)">跳转</el-button>
                </template>
            </el-table-column>
        </el-table> -->
    </div>
</template>
<script>
// import axios from 'axios'
import ExitBtn from './ExitButton'
import getCurrentTime from '../utils/currentTime'

export default {
    components: { ExitBtn },
    data() {
        return {
            userName: localStorage.getItem('userName'),
            work_orderId: '',
            titles: ['设备名称','连接状态','制令单号','产品型号','计划开始时间','实际开始时间','计划数量','当前计数'],
            // columns: [],
            // tableData: []
            // result: ['fkjskfweakksjk',3,4,754,null,'sdfew', 'sdf213244',2321, 232,null]
            result: [],
            rowData: this.$store.state.currentOrderData,
            status: '离线',
            // 计数
            count: 0,
            // 定时器
            timer: null,
            isFull: false,
            isfullScreen: false
        }
    },
    created() {
        // this.work_orderId = this.$route.query.work
        // this.machine_name = localStorage.getItem('userName')
        // console.log(this.work_orderId, this.machine_name)
        // this.$EventBus.$on('sendMsg2', row => {
        //     // 接收工单列表传给校验页面的数据进行数据展示
        //     this.rowData = row
        // })
        this.getMachineList()
        this.getCount()
        // 开启定时器，每5秒获取一次计数数据
        // this.timer = setInterval(() => {
        //     this.getCount()
        // }, 5000);
    },
    mounted() {
        window.onresize = () => {
            this.$nextTick(() => {
                this.isFull = document.fullscreenElement || 
                document.msFullscreenElement || 
                document.mozFullScreenElement ||
                document.webkitFullscreenElement || false
            })
        }
    },
    // beforeDestroy() {
    //     // 移除监听sendMsg2
    //     this.$EventBus.$off('sendMsg2')
    //     // 移除定时器
    //     clearInterval(this.timer)
    // },
    methods: {
        getCount() {
            // 调用接口获取实时计数
            // let formdata = new FormData()
            // formdata.append('PW_MACHINE', this.userName)
            // formdata.append('PW_WORKER', this.work_orderId)
            // const formdata = {
            //     'PW_MACHINE': this.userName,
            //     'PW_WORKER': this.work_orderId
            // }
            // 获取最新计数量接口
            // axios.post(this.httpUrl + 'WorkerAmount', formdata)
            // .then((res) => {
            //     // console.log(res)
            //     if(res.data.code === 200){
            //         // 保存设备、工单成功，允许跳转至看板页面
            //         this.count = res.data.value
            //     }else{
            //         this.$message.error('获取计数失败！请重新尝试')
            //     }
            // }).catch(err => err)
            // const formdata = '{cmd: "count",worker: "'+this.work_orderId+'"}'
            // console.log(this.killBrowserUrl.replace('http', 'ws'))
            let websocket = new WebSocket(this.killBrowserUrl.replace('http', 'ws') +'ws/'+this.userName)
            // console.log(formdata)
            websocket.onopen = () => {
                // websocket.send(formdata)
                if(websocket.readyState === 1){
                    this.status = '在线'
                    // 挂载获取的数据
                    this.getMachineList()
                }
            }
            websocket.onerror = () => {
                this.$message.error('websocket错误');
            }
            websocket.onmessage = (evt) => {
                // console.log(evt)
                const result = JSON.parse(evt.data)
                if(result.cmd === 'getUiCount' && result.worker === this.rowData.AW_WORKER){
                    this.count = result.count
                }
            }
        },
        getMachineList() {
            this.result.push(this.userName) //获取缓存的设备名
            this.result.push(this.status) //连接机台状态
            this.result.push(this.rowData.AW_WORKER)
            this.result.push(this.rowData.AW_PRODUCT_HALF)
            this.result.push(this.rowData.AW_PLAN_DATETIME)
            this.result.push(getCurrentTime()) //实际开始时间，获取当前时间
            this.result.push(this.rowData.AW_COUNT_PLAN)
            this.result.push(this.count) //当前计数，后台websocket实时更新
        },
        goBack() {
            this.$router.go(-1)
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
.bottom_width{
    margin-bottom: 20px;    
}
.machine_title{
    display: inline-block;
    width: 140px;
}
.el-card{
    height: 76px;
    line-height: 32px;
}
.el-tag{
    font-size: 16px;
}
.el-tag.count{
    width: 100px;
    height: 40px;
    line-height: 40px;
    text-align: center;
    vertical-align: middle;
    font-size: 34px;
}
</style>
