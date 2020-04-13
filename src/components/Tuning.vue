<template>
    <div class="tuning">
        <el-page-header @back="goBack" content="调机测试"></el-page-header>
        <div class="exitBut">
            <exit-btn :isFullscreen="isfullScreen"></exit-btn>
        </div>
        <el-card>
            <el-row :gutter="12">
                <el-col :span="12">
                    当前设备：
                    <el-tag>{{userName}}</el-tag>
                </el-col>
                <el-col :span="12">
                    当前操作员：
                    <el-tag>{{operator}}</el-tag>
                </el-col>
            </el-row>
            <div class="btnwrap">
                <el-button type="info" class="btnTun" @click="tuningStart">开始调机</el-button>
            </div>
        </el-card>
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
            operator: localStorage.getItem('operator'),
            isFull: false,
            isfullScreen: false
        }
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
        tuningStart() {
            const MT_WORKER = this.$route.query.work
            const MT_PRODUCT_HALF = this.$route.query.product
            const MT_MACHINE = this.userName
            const MT_DOUSER = this.operator
            const MT_STARTTIME = getCurrentTime(new Date())
            // 开始调机，开始时间传后台
            axios.post(this.httpUrl + 'Tune', {MT_WORKER,MT_PRODUCT_HALF,MT_MACHINE,MT_DOUSER,MT_STARTTIME})
            .then((res) => {
                // console.log(res)
                if(res.data.code === 200) {
                    this.$router.push('/examine?work='+MT_WORKER+'&product='+MT_PRODUCT_HALF)
                }else{
                    this.$message.error('连接失败，请重试！')
                }
            }).catch(err => err)

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
.btnwrap{
    margin: 30px 0;
    text-align: center;
}
.btnTun{
    width: 50%;
    height: 200px;
    font-size: 44px;
}
</style>