<template>
    <div class="materials"> 
        <el-page-header @back="goBack" content="物料校验"></el-page-header>
        <div class="exitBut">
            <exit-btn :isFullscreen="isfullScreen"></exit-btn>
        </div>
        <el-form class="formRef" @submit.native.prevent>
            <div class="scan_code">扫码校验</div>
            <el-button type="primary" class="btnSao" :disabled="disabledFlag" @click="scanning()">开始扫码</el-button>
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
        <div class="tabwrap" v-else v-show="noCheckData.length>0">
            <el-button class="btn" type="success" @click="noCheckDataSubmit">确定</el-button>
            <el-button class="btn" type="info" @click="handleEmptyScans">清空</el-button>
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
            title="验证结果已提交！即将返回工单页面"
            type="success"
            center
            show-icon
            :closable="false">
        </el-alert>
        <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="checkOver">确 定</el-button>
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
            // 需要验证列表数据
            tableData: [],
            // 不需要验证扫描数据
            noCheckData: [],
            VerifiedDialogVisible: false,
            userName: localStorage.getItem('userName'),
            isFull: false,
            isfullScreen: false,
            isCheck: this.$route.query.isCheck,
            // 扫码列表
            res_scan: this.$store.state.res_scan
        }
    },
    created() {
        this.work_orderId = this.$route.query.product
        this.work = this.$route.query.work
        if(this.isCheck === '1'){
            if(this.res_scan != '')
            // 需要验证
            this.getMaterialsList()
        }else{
            // 获取扫描结果列表
            this.getScansList()
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
                // 比较新扫码值和需验证的列表项
                this.compareScanResult(this.tableData, this.res_scan)
            })
            .catch(err => err)
        },
        getScansList() {
            const res_scan = this.$store.state.res_scan
            if(res_scan != '') {
                const scans = res_scan.split(',')
                // 扫描结果放入不验证数据列表
                for(let i = 0; i < scans.length; i++) {
                    this.noCheckData.push({scan_result: scans[i]})
                }
            }
        },
        compareScanResult(datas, scan_result) {
            const scans = scan_result.split(',')
            // 遍历查找列表中是否存在输入框中的值
            for(let i = 0; i < scans.length; i++) {
                let index = datas.findIndex((item) => (scans[i].toLowerCase( ).indexOf(item.PA_METRIAL.toLowerCase( )) != -1))
                if(index != '-1') {
                    // 若存在，把扫描结果写入扫描码处，并选中此行
                    this.$set(this.tableData[index], 'scan_result' , scans[i])
                    this.$set(this.tableData[index], 'checked' , true)
                }else{
                    // 有不存在项，把store中保存的扫描结果数据删除此项
                    const newScans = scans.filter(item => item != scans[i])
                    this.$store.dispatch('handleChangeScans', newScans.join(','))
                    this.$message({
                        message: scans[i]+'不属验证项，请重新扫码',
                        type: 'error',
                        duration: 1200
                    })
                }
            }
            // 需要验证的列表项全部验证成功，扫码按钮禁用，保存数据到后台，返回工单页面
            // 遍历列表中checkd属性是否都为true
            let checkedNum = this.tableData.filter(item => item.checked === true)
            if(checkedNum.length != 0 && checkedNum.length === this.tableData.length) {
                // 校验成功，禁用扫码框
                this.disabledFlag = true
                // 保存数据到服务器
                this.checkScans()
                // 弹出确定验证成功框
                this.VerifiedDialogVisible=true
            }
        },
        scanning() {
            const {isCheck, product, work} = this.$route.query
            this.$router.replace('/device?isCheck='+isCheck+'&product='+product+'&work='+work)
        },
        goBack() {
            this.$router.go(-1)
        },
        deleteScan(row) {
            // console.log(row.scan_result)
            let scans = this.$store.state.res_scan
            let newScans = scans.split(',').filter(item => item != row.scan_result)
            this.$store.dispatch('handleChangeScans', newScans.join(','))
            // 清空之前扫描数据，并重新获取不需验证清空下扫描数据渲染
            this.noCheckData = []
            this.getScansList()
        },
        emptyScans() {
            // 清空vuex和无验证扫描列表数据
            this.$store.dispatch('handleChangeScans', '')
            this.noCheckData = []
        },
        noCheckDataSubmit() {
            this.$confirm('点击确定后，将会结束扫码验证，是否继续？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                 // 保存数据到服务器
                this.checkScans()
                // 提示验证成功框显示
                this.VerifiedDialogVisible=true
            })
           
        },
        checkScans() {
            const PM_WORKER = this.work
            const PM_PRODUCT_HALF = this.work_orderId
            const PM_MACHINE = this.userName
            const PM_METRIAL = this.$store.state.res_scan
            axios.post(this.httpUrl + 'MES/Metrial', {PM_WORKER, PM_MACHINE, PM_PRODUCT_HALF, PM_METRIAL})
            .then(res => {
                // console.log(res)
                if(res.data.code===200) {
                    this.$message.success('调机校验成功！')
                    // 调机成功保存数据后，返回工单页面前，把扫码数据列表清空
                    this.emptyScans()
                    this.$router.replace('/work_order2')
                }else{
                    this.$message.error('调机校验失败！')
                }
            }).catch(err => err)
        },
        checkOver() {
            // 保存数据到服务器
            this.VerifiedDialogVisible=false
        },
        handleEmptyScans() {
            this.$confirm('点击确定后，将会清空扫描列表，是否继续？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.emptyScans()
            })
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
.scan_code{
    margin-bottom: 20px;
    font-size: 16px;
}
.btnSao{
    margin: 30px 0;
    width: 100%;
    font-size: 50px;
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
.tabwrap{
    text-align: right;
}
.btn{
    margin-bottom: 20px;
}
</style>
