<template>
    <div class="audit">
        <el-page-header @back="goBack" content="首末检审核"></el-page-header>
        <div class="exitBut">
            <exit-btn :isFullscreen="isfullScreen"></exit-btn>
        </div>
        <template>
            <el-table :data="tableData" border style="width: 100%">
                <el-table-column prop="index" label="工号"></el-table-column>
                <el-table-column prop="date" label="计划日期"></el-table-column>
                <el-table-column prop="machine" label="机台"></el-table-column>
                <el-table-column prop="worker" label="制令"></el-table-column>
                <el-table-column prop="num" label="成品编号"></el-table-column>
                <el-table-column prop="name" label="成品名称"></el-table-column>
                <el-table-column prop="type" label="成品规格"></el-table-column>
                <el-table-column prop="kehu" label="客户编号"></el-table-column>
                <el-table-column label="操作" width="192">
                    <template slot-scope="scope">
                        <el-button size="mini" type="info" @click="detailAuditOrder(scope.row)">详情</el-button>
                        <el-button size="mini" type="primary">审核</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </template>
        <!-- 详情弹出框 -->
        <el-dialog
        title="品检详情"
        :visible.sync="dialogAuditVisible"
        width="80%">
        <!-- 工单详情列表 -->
        <el-row :gutter="12">
            <el-col :span="12" class="detailsText" shadow="always" v-for="(item,i) in columnsAll" :key="i">
                <span class="machine_title">{{item.name}}:</span>
                <span>{{detailData[item.c]}}</span>
            </el-col>
        </el-row>
        </el-dialog>
    </div>
</template>
<script>
import ExitBtn from './ExitButton'
import getCurrentTime from '../utils/currentTime'
import axios from 'axios'

export default {
    components: { ExitBtn },
    data() {
        return {
            userName: localStorage.getItem('userName'),
            // 品检数据列表
            tableData: [
                {
                    index: '123',
                    date: '2020/05/09',
                    machine: 'machine02',
                    worker: 'MO93492831',
                    num: 'YO123111',
                    name: 'YO123111',
                    type: 'M-1',
                    kehu: 'k001',
                    drawDate: '2009/12/04',
                    version: '0.1'
                },
                {
                    index: '125',
                    date: '2020/05/09',
                    machine: 'machine03',
                    worker: 'MO93492801',
                    num: 'YO123145',
                    name: 'YO123145',
                    type: 'M-1',
                    kehu: 'k002',
                    drawDate: '2010/08/24',
                    version: '0.2'
                },
                {
                    index: '129',
                    date: '2020/05/09',
                    machine: 'machine02',
                    worker: 'MO934928123',
                    num: 'YO121231',
                    name: 'YO121231',
                    type: 'M-3',
                    kehu: 'k003',
                    drawDate: '2015/05/18',
                    version: '0.6'
                }
            ],
            columnsAll: [
                {name:'工号', c: 'index'}, 
                {name:'计划日期', c: 'date'}, 
                {name:'机台', c: 'machine'}, 
                {name:'制令', c: 'worker'}, 
                {name:'成品编号', c: 'num'}, 
                {name:'成品名称', c: 'name'}, 
                {name:'成品规格', c: 'type'}, 
                {name:'客户编号', c: 'kehu'}, 
                {name:'图纸日期', c: 'drawDate'}, 
                {name:'图纸版次', c: 'version'}
            ],
            detailData: [],
            form: {

            },
            dialogAuditVisible: false,
            isFull: false,
            isfullScreen: false,
            timer: null,
            isAllCheck: true
        }
    },
    created() {
        
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
    methods: {
        detailAuditOrder(row) {
            // console.log(row)
            this.detailData = row
            // for(let i = 0; i < this.columnsAll.length; i++) {
            //     this.detailData.push(row[this.columnsAll[i].c])
            // }
            this.dialogAuditVisible = true
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
.examine{
    padding-bottom: 40px;
}
.el-card{
    padding-bottom: 10px;
}
.detailsText{
  padding: 5px 0;
  font-size: 15px;
  border-bottom: 1px solid #eee;
}
.el-date-editor{
  width: 180px;
  margin-right: 10px;
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