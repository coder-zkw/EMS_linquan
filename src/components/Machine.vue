<template>
    <div class="machine">
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
            <el-table-column type="index" width="30"></el-table-column>
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
import axios from 'axios'
import screenfull from 'screenfull'

export default {
    data() {
        return {
            work_orderId: '',
            machine_name: '',
            titles: ['设备名称','连接状态','生产工单','产品型号','计划数量','计划开始时间','实际开始时间','良品数量','不良数量','稼动效率'],
            result: [],
            isFullscreen: false
        }
    },
    created() {
        this.work_orderId = this.$route.query.work
        this.machine_name = localStorage.getItem('userName')
        // console.log(this.work_orderId, this.machine_name)
        this.getMachineList()
    },
    methods: {
        getMachineList() {
            axios.get(this.httpUrl + 'GetKanban?w='+ this.work_orderId +'&m='+ this.machine_name)
            .then((res ) => {
                // console.log(res)
                let datas = res.data.first_half[0]
                this.result.push(datas.PW_MACHINE)
                this.result.push('在线')
                this.result.push(datas.AW_APS_WORKER)
                this.result.push(datas.AW_PRODUCT_HALF)
                this.result.push(datas.AW_COUNT_PLAN)
                this.result.push(datas.AW_PLAN_DATETIME)
                this.result.push(datas.PW_START)
                this.result.push(datas.PW_OK)
                this.result.push(datas.QC_NG)
                this.result.push(null)
            }).catch(err => err)
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
