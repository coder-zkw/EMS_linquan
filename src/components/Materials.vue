<template>
    <div class="materials"> 
        <el-page-header @back="goBack" content="物料校验"></el-page-header>
        <div class="exitBut">
            <exit-btn :isFullscreen="isfullScreen"></exit-btn>
        </div>
        <el-form class="formRef" @submit.native.prevent>
            <div class="scan_code">扫码校验</div>
            <el-form-item>
                <el-input v-model="inputVal" v-focus ref="inputRef" :disabled="disabledFlag" @keyup.enter.native="scanning()"></el-input>
            </el-form-item>
        </el-form>
        <el-table
        v-if="isCheck==='1'"
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
        <div class="noCheckWrap" v-else v-show="noCheckData.length>0">
            <el-button type="success" @click="noCheckDataSubmit">确定</el-button>
            <el-button type="info" @click="noCheckDataEmpty">清空</el-button>
            <el-table
                :data="noCheckData"
                border
                style="width: 100%">
                    <el-table-column type="index"></el-table-column>
                    <el-table-column prop="scan_result" label="扫码结果"></el-table-column>
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-button type="danger" icon="el-icon-delete" @click="deleteScan(scope.row)"></el-button>
                        </template>
                    </el-table-column>
                </el-table>
        </div>
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
            noCheckData: [],
            VerifiedDialogVisible: false,
            userName: localStorage.getItem('userName'),
            // 是否跳至看板页面
            goLayOut: false,
            isFull: false,
            isfullScreen: false,
            isCheck: this.$route.query.isCheck
        }
    },
    created() {
        this.work_orderId = this.$route.query.product
        this.work = this.$route.query.work
        if(this.isCheck === '1'){
            // 需要验证
            this.getMaterialsList()
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
        getMaterialsList() {
            // axios.get('http://mengxuegu.com:7300/mock/5e6a16f0e7a1bb0518bb7477/aps/GetTitle?page=PRD_APS_BOM')
            axios.get(this.httpUrl + 'MES/GetTitle?page=PRD_APS_BOM')
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
            // axios.get('http://mengxuegu.com:7300/mock/5e6a16f0e7a1bb0518bb7477/aps/GetProductHalf?wo='+ this.work_orderId)
            axios.get(this.httpUrl + 'MES/GetProductHalf?wo='+ this.work_orderId)
            .then((res) => {
                // console.log(res)
                this.tableData = res.data
            })
            .catch(err => err)
        },
        noCheckDataSubmit() {
            this.$confirm('点击确定后，将会结束扫码验证，是否继续？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                 // this.VerifiedDialogVisible=true
                this.toCheckProduct()
                // this.checkScans()
            })
           
        },
        noCheckDataEmpty() {
            this.$confirm('点击确定后，将会清空扫描列表，是否继续？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.noCheckData = []
                this.scanFocus()
            })
        },
        scanning() {
            const value = this.inputVal.trim()
            if(value === '') {
                this.$message.error('扫描结果为空！')
                return
            }
            // 不需验证只增加扫描值
            if(this.isCheck === '0'){
                this.noCheckData.push({scan_result: value})
            }else{
                // 需要验证则验证结果
                const datas = this.tableData
                // 遍历查找列表中是否存在输入框中的值
                let index = datas.findIndex((item) => (value.toLowerCase( ).indexOf(item.PA_METRIAL.toLowerCase( )) != -1))
                if(index != '-1') {
                    // 若存在，把扫描结果写入扫描码处，并选中此行
                    this.$set(this.tableData[index], 'scan_result' , value)
                    this.$set(this.tableData[index], 'checked' , true)
                }else{
                    this.$message({
                        message: value+'不属验证项，请重新扫码',
                        type: 'error',
                        duration: 1200
                    })
                }
                // 遍历列表中checkd属性是否都为true
                let checkedNum = datas.filter(item => item.checked === true)
                if(checkedNum.length != 0 && checkedNum.length === datas.length) {
                    // 校验成功，禁用扫码框
                    this.disabledFlag = true
                    this.toCheckProduct()    
                }
            }
            // 输入框清空
            this.inputVal = ''
        },
        // 生产校验
        toCheckProduct() {
            // axios.get('http://mengxuegu.com:7300/mock/5e6a16f0e7a1bb0518bb7477/aps/GetRecord?w=' + this.work+'&m=' + this.userName)
            axios.get(this.httpUrl + 'MES/GetRecord?w=' + this.work+'&m=' + this.userName)
            .then((res) => {
                // console.log(res)
                // 校验成功，跳转页面
                if(res.data === 'success' || res.data.data === 'success') {
                // if(res.data.data === 'success') {
                    // const firstChars = this.userName.substr(0, 3).toLowerCase()
                    const company = localStorage.getItem('company')
                    // if(firstChars != 'jdd' && firstChars != 'jsd') {
                        if(company === '1') {
                        // 调用接口，后台写数据
                        // let formdata = new FormData()
                        // formdata.append('PW_MACHINE', this.userName)
                        // formdata.append('PW_WORKER', this.work_orderId)
                        const formdata = {
                            'PW_MACHINE': this.userName,
                            'PW_WORKER': this.work
                        }
                        // 保存设备名和工单号接口
                        axios.post(this.httpUrl + 'MES/StartRecord', formdata)
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
                    // 保存扫描结果
                    this.checkScans()
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
        deleteScan(row) {
            // console.log(row)
            const newData = this.noCheckData.filter(item => item.scan_result != row.scan_result)
            this.noCheckData = newData
            // 扫码框获取焦点
            this.scanFocus()
        },
        goBack() {
            this.$router.go(-1)
        },
        scanFocus() {
            this.$refs.inputRef.focus()
        },
        getScans(){
            // console.log(this.noCheckData)
            let scans = []
            let scansArray = null;
            if(this.isCheck==='0'){
                scansArray = this.noCheckData
            }else{
                scansArray = this.tableData
            }
            scansArray.map(item => scans.push(item.scan_result))
            // alert(scans.join(','))
            return scans.join(',')
        },
        checkScans() {
            const PM_WORKER = this.work
            const PM_PRODUCT_HALF = this.work_orderId
            const PM_MACHINE = this.userName
            const PM_METRIAL = this.getScans()
            axios.post(this.httpUrl + 'MES/Metrial', {PM_WORKER, PM_MACHINE, PM_PRODUCT_HALF, PM_METRIAL})
            .then(res => {
                // console.log(res)
                if(res.data.code===200) {
                    this.$message.success('扫码结果保存成功！')
                }else{
                    this.$message.error('扫码结果保存失败！')
                }
            }).catch(err => err)
        },
        browserClosed() {
            // 关闭弹出框
            this.VerifiedDialogVisible = false
            // goLayOUt为true,允许跳转看板页面,否则关闭浏览器
            if(this.goLayOut) {
                this.$message.success('校验成功，页面即将跳至看板页面！')
                // 延迟3秒跳转至看板页面
                setTimeout(() => {
                    this.$router.push('/machine_1?work=' + this.work)
                }, 2000)
            }else{
                let formdata = new FormData()
                formdata.append('machineName', this.userName)
                // 调用后台接口关闭浏览器
                axios.post(this.killBrowserUrl + 'server/killClientBrowser', formdata)
                .then(() => {
                    // 直接关闭浏览器
                }).catch(() => {
                    this.$message.error('浏览器自动关闭失败，请手动关闭！')
                })
                
            }
        }
    },
    // 自定义指令输入框自动聚焦
    directives: {
        focus: {
            inserted: function (el) {
                el.querySelector('input').focus()
            }
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
.formRef{
    width: 50%;
    margin: 0 auto;
    text-align: center;
}
.el-table{
    margin-top: 20px;
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
.noCheckWrap{
    text-align: right;
}
</style>
