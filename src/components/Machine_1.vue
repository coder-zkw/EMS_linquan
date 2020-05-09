<template>
    <div class="machine1">
        <el-page-header @back="goBack" content="机台看板"></el-page-header>
        <div class="exitBut">
            <exit-btn :isFullscreen="isfullScreen" :isShow="true"></exit-btn>
        </div>
        <el-row :gutter="12">
            <el-col :span="12" v-for="(item,i) in titles" :key="item">
                <el-card class="bottom_width" shadow="always">
                    <span class="machine_title">
                        {{item}}
                        <el-button type="info" size="mini" plain v-if="i===7" @click="setdialogVisible = true">x {{selectVal}}</el-button>：
                    </span>
                    <el-tag 
                        :type="i === 7 ? '': 'success'" 
                        :class="i === 7 ? 'count': ''" 
                        v-if="result[i] != null">
                        {{i === 7 ? count*selectVal : result[i]}}
                    </el-tag>
                </el-card>
            </el-col>
        </el-row>
        <el-dialog
        title="系数设置"
        :visible.sync="setdialogVisible"
        width="50%">
        <el-form label-width="100px">
            <el-form-item label="请选择系数：">
                <el-select v-model="selectVal">
                    <el-option
                    v-for="item in 5"
                    :key="item.value"
                    :label="item"
                    :value="item">
                    </el-option>
                </el-select>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="setdialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="handleClick">确 定</el-button>
        </span>
        </el-dialog>
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
import axios from 'axios'

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
            setdialogVisible: false,
            selectVal: '1',
            // 计数
            count: 0,
            isFull: false,
            isfullScreen: false
        }
    },
    created() {
        this.getMachineList()
        // 获取当前计数系数
        this.getCoefficient()
        this.getCount()
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
        getCoefficient() {
            axios.get(this.httpUrl + 'MES/GetCoefficient?wo='+this.rowData.AW_APS_WORKER)
            .then(res => {
                // console.log(res)
                if(res.status === 200){
                    const data = res.data[0]
                    this.selectVal = data.MB_COEFFICIENT
                    this.count = data.PW_TOTAL
                }
            }).catch(err=>err)
        },
        getCount() {
            // this.killBrowserUrl.replace('http', 'ws') +'ws/'+this.userName
            let websocket = new WebSocket('ws://192.168.13.12:10003/ws/'+this.userName)
            websocket.onopen = () => {
                // websocket.send(formdata)
                if(websocket.readyState === 1){
                    // this.status = '在线'
                    // 挂载获取的数据
                    // this.getMachineList()
                }
            }
            websocket.onerror = () => {
                this.$message.error('websocket错误');
            }
            websocket.onmessage = (evt) => {
                this.status = '在线'
                // console.log(evt)
                const result = JSON.parse(evt.data)
                // 收到后台getUiCount制令，更新当前计数
                if(result.cmd === 'getUiCount' && result.worker === this.rowData.AW_APS_WORKER){
                    this.count = result.count
                }else if(result.cmd === 'getUiForbidRun') {
                    this.$confirm('因条码验证未通过或失效，设备拒绝启动，是否前往条码验证页面？', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        this.$router.replace('/work_order')
                    }).catch(err => err)
                }
            }
        },
        handleClick() {
            // 改变系数值后，发送到后台保存
            this.changeValue()
            this.setdialogVisible = false
            // 从新获取系数
            // this.getCoefficient()
        },
        changeValue() {
            axios.post(this.httpUrl+'MES/UpCoefficient',{MB_COEFFICIENT: this.selectVal, MB_WORKER: this.rowData.AW_APS_WORKER})
            .then(res => {
                // console.log(res)
                if(res.data.code === 200){
                    // 保存成功后，从新获取系数渲染
                    this.getCoefficient()
                }else{
                    this.$message.error('计数系数修改失败')
                }
            }).catch(err => err)
        },
        getMachineList() {
            this.result.push(this.userName) //获取缓存的设备名
            this.result.push(this.status) //连接机台状态
            this.result.push(this.rowData.AW_APS_WORKER)
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
