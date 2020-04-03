<template>
    <div class="materials"> 
        <el-page-header @back="goBack" content="物料校验"></el-page-header>
        <div class="exitBut">
            <exit-btn></exit-btn>
        </div>
        <el-form class="formRef" @submit.native.prevent>
            <div class="scan_code">扫码校验</div>
            <el-form-item>
                <el-input v-model="inputVal" v-focus :disabled="disabledFlag" @keyup.enter.native="scanning()"></el-input>
            </el-form-item>
        </el-form>
        <el-table
        :data="tableData"
        border
        style="width: 100%">
        <el-table-column type="index" width="30"></el-table-column>
        <el-table-column v-for="(item, i) in columns" :prop="item.S_NAME" :label="item.S_CHINESE" :key="i"></el-table-column>
        <el-table-column label="校验结果">
            <template slot-scope="scope">
                <el-checkbox v-model="scope.row.checked" :checked="scope.row.checked"></el-checkbox>
            </template>
        </el-table-column>
        </el-table>
        <!-- 验证通过 -->
        <el-dialog
        title="温馨提示"
        :visible.sync="VerifiedDialogVisible"
        :show-close="false"
        :close-on-click-modal="false"
        width="66%">
        <el-alert
            title="验证通过！请在5分钟内对机台进行启动操作"
            type="success"
            center
            show-icon
            :closable="false">
        </el-alert>
        <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="browserClosed">确 定</el-button>
        </span>
        </el-dialog>
    </div>
</template>
<script>
import axios from 'axios'
import ExitBtn from './ExitButton'
import getCurrentTime from '../utils/currentTime'

export default {
    components: { ExitBtn },
    data() {
        return {
            // 工单号
            work_orderId: '',
            // 输入框扫码值
            inputVal: '',
            // 列表title
            disabledFlag: false,
            columns: [],
            // 每列具体内容
            tableData: [],
            VerifiedDialogVisible: false,
            userName: localStorage.getItem('userName'),
            // 是否跳至看板页面
            goLayOut: false,
            // rowData: {}
        }
    },
    created() {
        this.work_orderId = this.$route.query.product
        this.work = this.$route.query.work
        // console.log(this.work_orderId, this.work)
        this.getMaterialsList()
        // this.$EventBus.$on('sendMsg', row => {
        //     // 接收工单列表的数据进行数据,页面离开时再传给看板页面
        //     // console.log(row)
        //     this.rowData = row
        // })
    },
    // beforeDestroy() {
    //     // 接收来自工单列表的数据再传给看板页面
    //     this.$EventBus.$emit("sendMsg2", this.rowData)
    //     // 移除监听sendMsg
    //     this.$EventBus.$off('sendMsg')
    // },
    methods: {
        getMaterialsList() {
            axios.get(this.httpUrl + 'GetTitle?page=PRD_APS_BOM')
            .then((res) => {
                let newData = res.data
                const newcolum = {
                    S_CHINESE: "扫描码",
                    S_NAME: 'scan_result'
                }
                newData.push(newcolum)
                this.columns = newData
                // console.log(this.columns)
            })
            .catch(err => err)
            axios.get(this.httpUrl + 'GetProductHalf?wo='+ this.work_orderId)
            .then((res) => {
                // console.log(res)
                this.tableData = res.data
            })
            .catch(err => err)
        },
        scanning() {
            const datas = this.tableData
            const value = this.inputVal
            // 遍历查找列表中是否存在输入框中的值
            let index = datas.findIndex((item) => (value.toLowerCase( ).indexOf(item.PA_METRIAL.toLowerCase( )) != -1))
            if(index != '-1') {
                // 若存在，把扫描结果写入扫描码处，并选中此行
                this.$set(this.tableData[index], 'scan_result' , value)
                this.$set(this.tableData[index], 'checked' , true)
            }else{
                this.$message({
                    message: '输入码有误，请重新输入',
                    type: 'error',
                    duration: 1000
                })
            }
            // console.log(this.tableData)
            // 遍历列表中checkd属性是否都为true
            let checkedNum = datas.filter(item => item.checked === true)
            if(checkedNum.length != 0 && checkedNum.length === datas.length) {
                // 校验成功，禁用扫码框
                this.disabledFlag = true
                // 判断是调机还是生产
                if(this.$route.query.type === 'tune') {
                    // 插入开始调机时间
                    this.setStartTime()
                }else{
                    this.toDoDifferent()
                }
            }
            // 输入框清空
            this.inputVal = ''
        },
        // 校验是否为林全机台，执行不同操作
        toDoDifferent() {
            axios.get(this.httpUrl + 'GetRecord?w=' + this.work+'&m=' + this.userName)
            .then((res) => {
                // console.log(res)
                // 校验成功，跳转页面
                if(res.data === 'success' || res.data.data === 'success') {
                // if(res.data.data === 'success') {
                    const firstChars = this.userName.substr(0, 3).toLowerCase()
                    if(firstChars != 'jdd' && firstChars != 'jsd') {
                        // 调用接口，后台写数据
                        // let formdata = new FormData()
                        // formdata.append('PW_MACHINE', this.userName)
                        // formdata.append('PW_WORKER', this.work_orderId)
                        const formdata = {
                            'PW_MACHINE': this.userName,
                            'PW_WORKER': this.work_orderId
                        }
                        // 保存设备名和工单号接口
                        axios.post(this.httpUrl + 'StartRecord', formdata)
                        .then((res) => {
                            // console.log(res)
                            if(res.data.code === 200){
                                // 保存设备、工单成功，允许跳转至看板页面
                                this.goLayOut = true
                            }else{
                                this.$message.error('保存设备名和工单失败！请重新尝试')
                                this.$router.replace('/work_order')
                            }
                        }).catch(() => {
                            this.$message.error('请求保存设备名和工单失败！请重新尝试')
                            this.$router.replace('/work_order')
                        })
                    }
                    this.VerifiedDialogVisible = true
                }else {
                    // 校验失败，返回重新校验
                    this.$message.error('插入标识失败！请重新尝试')
                    this.$router.replace('/work_order')
                }
            }).catch(() => {
                this.$message.error('请求插入标识失败！请重新尝试')
                this.$router.replace('/work_order')
            })
        },
        goBack() {
            this.$router.go(-1)
        },
        browserClosed() {
            // goLayOUt为true,允许跳转看板页面,否则关闭浏览器
            if(this.goLayOut) {
                this.$message.success('校验成功，页面即将跳至看板页面！')
                // 延迟3秒跳转至看板页面
                setTimeout(() => {
                    this.$router.push('/machine_1?work=' + this.work)
                }, 3000)
            }else{
                let formdata = new FormData()
                formdata.append('machineName', this.userName)
                // 调用后台接口关闭浏览器
                axios.post(this.killBrowserUrl + 'server/killClientBrowser', formdata)
                // axios.get(this.killBrowserUrl + 'server/killClientBrowser?machineName='+this.userName)
                .then(() => {
                    // 直接关闭浏览器
                }).catch(() => {
                    this.$message.error('浏览器自动关闭失败，请手动关闭！')
                })
                // 关闭弹出框
                this.VerifiedDialogVisible = false
            }
        },
        setStartTime() {
            // let formdata = new FormData()
            // formdata.append('MT_WORKER', this.currentRow.AW_APS_WORKER)
            // formdata.append('MT_PRODUCT_HALF', this.currentRow.AW_PRODUCT_HALF)
            // formdata.append('MT_MACHINE', this.userName)
            // formdata.append('MT_DOUSER', this.operator)
            // formdata.append('MT_STARTTIME', getCurrentTime(new Date()))
            const MT_WORKER = this.work
            const MT_PRODUCT_HALF = this.work_orderId
            const MT_MACHINE = this.userName
            const MT_DOUSER = localStorage.getItem('operator')
            const MT_STARTTIME = getCurrentTime(new Date())
            // 开始调机，开始时间传后台
            axios.post(this.httpUrl + 'Tune', {MT_WORKER,MT_PRODUCT_HALF,MT_MACHINE,MT_DOUSER,MT_STARTTIME})
            .then((res) => {
                // console.log(res)
                if(res.data.code === 200) {
                    this.$message.success('调机开始时间已保存成功！')
                    // 成功返回工单调机页面
                    this.$router.replace('/work_order2')
                }else{
                    this.$message.error('开始时间写入失败，请重试！')
                }
            }).catch(err => err)
        }
    },
    // 自定义指令输入框自动聚焦
    directives: {
        focus: {
            inserted: function (el) {
                el.querySelector('input').focus()
            }
        }
    }
}
</script>
<style scoped>
.formRef{
    width: 50%;
    height: 260px;
    margin: 0 auto;
    text-align: center;
}
.scan_code{
    margin-bottom: 20px;
    font-size: 16px;
}
/deep/ .el-input__inner{
    height: 100px;
    font-size: 30px;
    font-weight: bold;
}
/deep/ .el-alert{
    padding: 12px 16px;
}
/deep/ .el-alert__icon{
    font-size: 24px;
    width: 24px;
}
/deep/ .el-alert__title{
    font-size: 24px;
}
</style>
