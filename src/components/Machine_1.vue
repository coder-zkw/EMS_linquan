<template>
    <div class="machine1">
        <el-page-header @back="goBack" content="机台看板"></el-page-header>
        <div class="exitBut">
            <el-button class="fullScreen" type="info" plain @click="toggleFullscreen">全屏</el-button>
            <el-button  type="primary" plain @click="exiting">退出</el-button>
        </div>
        <el-row :gutter="12">
            <el-col :span="12" v-for="(item,i) in titles" :key="item">
                <el-card class="bottom_width" shadow="always">
                    <span class="machine_title">{{item}}：</span>
                    <el-tag type="success" v-if="result[i] != null">{{result[i]}}</el-tag>
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
import screenfull from 'screenfull'
import currentTime from '../utils/currentTime'

export default {
    data() {
        return {
            work_orderId: '',
            titles: ['设备名称','连接状态','制令单号','产品型号','计划开始时间','实际开始时间','计划数量','当前计数'],
            // columns: [],
            // tableData: []
            // result: ['fkjskfweakksjk',3,4,754,null,'sdfew', 'sdf213244',2321, 232,null]
            result: [],
            rowData: {},
            isFullscreen: false
        }
    },
    created() {
        this.work_orderId = this.$route.query.work_id
        this.machine_name = localStorage.getItem('userName')
        // console.log(this.work_orderId, this.machine_name)
        this.$EventBus.$on('sendMsg', row => {
            // 接收工单列表的数据进行数据展示
            // console.log(row)
            this.rowData = row
        })
    },
    mounted() {
        // 挂着获取的数据
        this.getMachineList()
    },
    beforeDestroy() {
        // 移除监听
        this.$EventBus.$off('sendMsg')
    },
    methods: {
        getMachineList() {
            let datas = this.rowData
            // console.log(datas)
            this.result.push(localStorage.getItem('userName')) //获取缓存的设备名
            this.result.push('在线')
            this.result.push(datas.AW_WORKER)
            this.result.push(datas.AW_PRODUCT_HALF)
            this.result.push(datas.AW_PLAN_DATETIME)
            this.result.push(currentTime) //实际开始时间，获取当前时间
            this.result.push(datas.AW_COUNT_PLAN)
            this.result.push(null)
            // axios.get(this.httpUrl + 'GetKanban?w='+ this.work_orderId +'&m='+ this.machine_name)
            // .then((res ) => {
            //     // console.log(res)
            //     let datas = res.data.first_half[0]
            //     this.result.push(datas.PW_MACHINE)
            //     this.result.push('在线')
            //     this.result.push(datas.AW_APS_WORKER)
            //     this.result.push(datas.AW_PRODUCT_HALF)
            //     this.result.push(datas.AW_PLAN_DATETIME)
            //     this.result.push(this.getCurrentTime()) //实际开始时间，获取当前时间
            //     this.result.push(datas.AW_COUNT_PLAN)
            //     this.result.push(null)
            // }).catch(err => err)
        },
        goBack() {
            this.$router.go(-1)
        },
        exiting() {
            // 跳至login页面
            this.$router.replace('/login')
        },
        toggleFullscreen() {
            screenfull.toggle()
            this.isFullscreen = true
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
</style>
