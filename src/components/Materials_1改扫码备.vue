<template>
    <div class="materials"> 
        <el-page-header @back="goBack" content="物料校验"></el-page-header>
        <el-form class="formRef" @submit.native.prevent>
            <div class="scan_code">扫码校验</div>
            <el-form-item v-if="isPC">
                <el-input v-model="inputVal" v-focus ref="inputRef" :disabled="disabledFlag" @keyup.enter.native="scanning()"></el-input>
            </el-form-item>
            <el-button v-else type="primary" class="btnSao" :disabled="disabledFlag" @click="scanning()">开始扫码</el-button>
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
import getCurrentTime from '../utils/currentTime'

export default {
    data() {
        return {
            // 工单号
            work_orderId: '',
            // 输入框扫码值
            inputVal: '',
            // 列表title
            disabledFlag: false,
            // 需验证列表的列项
            columns: [],
            // 需要验证列表数据
            tableData: [],
            // 不需要验证扫描数据
            noCheckData: [],
            VerifiedDialogVisible: false,
            userName: localStorage.getItem('userName'),
            isCheck: this.$route.query.isCheck,
            // ipad扫码列表
            res_scan: this.$store.state.res_scan,
            isPC: localStorage.getItem('isKeyboard') === 'true'
        }
    },
    created() {
        this.work_orderId = this.$route.query.product
        this.work = this.$route.query.work
        if(this.isCheck === '1'){
            // 需要验证
            this.getMaterialsList()
            // console.log(121)
        }else if(!this.isPC && this.isCheck === '0'){
            // ipad下不需验证情况，获取扫描结果列表
            this.getScansList()
            // console.log(122)
        }
        // console.log(123)
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
            })
            .catch(err => err)
            // axios.get('http://mengxuegu.com:7300/mock/5e6a16f0e7a1bb0518bb7477/aps/GetProductHalf?wo='+ this.work_orderId)
            axios.get(this.httpUrl + 'MES/GetProductHalf?wo='+ this.work_orderId)
            .then((res) => {
                // console.log(res)
                this.tableData = res.data
                // ipad下比较新扫码值和需验证的列表项
                if(!this.isPC) {
                    this.compareScanResult(this.tableData, this.res_scan)
                }
            })
            .catch(err => err)
        },
        // ipad且不需验证， 获取扫描列表
        getScansList() {
            const res_scan = this.$store.state.res_scan
            if(res_scan != '') {
                // 清空之前数据
                this.noCheckData = []
                const scans = res_scan.split(',')
                // 扫描结果放入不验证数据列表
                for(let i = 0; i < scans.length; i++) {
                    this.noCheckData.push({scan_result: scans[i]})
                }
            }
        },
        // ipad 比较扫码值与验证列表的验证项
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
                // 弹出确定验证成功框
                this.VerifiedDialogVisible=true
            }
        },
        scanning() {
            if(!this.isPC) {//ipad 下，跳转至扫描页面
                const {isCheck, product, work} = this.$route.query
                this.$router.replace('/device?isCheck='+isCheck+'&product='+product+'&work='+work)
            }else{//pc下扫码判断
                this.scanPC()
            }
        },
        scanPC() {
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
                    // 弹出提交验证数据且页面将返回框
                    this.VerifiedDialogVisible=true
                }
            }
            // 输入框清空
            this.inputVal = ''
        },
        goBack() {
            this.$router.go(-1)
        },
        deleteScan(row) {
            if(this.isPC) {
                const newData = this.noCheckData.filter(item => item.scan_result != row.scan_result)
                this.noCheckData = newData
                // 扫码框获取焦点
                this.scanFocus()
            }else{
                let scans = this.$store.state.res_scan
                let newScans = scans.split(',').filter(item => item != row.scan_result)
                this.$store.dispatch('handleChangeScans', newScans.join(','))
                // 清空之前扫描数据，并重新获取不需验证清空下扫描数据渲染
                this.noCheckData = []
                this.getScansList()
            }
        },
        scanFocus() {
            this.$refs.inputRef.focus()
        },
        emptyScans() {
            if(this.isPC) {
                this.scanFocus()
            }else{
                // ipad下清空vuex和无验证扫描列表数据
                this.$store.dispatch('handleChangeScans', '')
            }
            this.noCheckData = []
        },
        noCheckDataSubmit() {
            this.$confirm('点击确定后，将会结束扫码验证，是否继续？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                // 手动提交后弹出提交验证数据且页面将返回框
                this.VerifiedDialogVisible=true
            })
           
        },
        // 将扫码结果数组变为字符串格式
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
            return scans.join(',')
        },
        // 上传验证结果
        checkScans() {
            const PM_WORKER = this.work
            const PM_PRODUCT_HALF = this.work_orderId
            const PM_MACHINE = this.userName
            // ipad下从store获取扫码值
            const PM_METRIAL = this.isPC ? this.getScans() : this.$store.state.res_scan
            axios.post(this.httpUrl + 'MES/Metrial', {PM_WORKER, PM_MACHINE, PM_PRODUCT_HALF, PM_METRIAL})
            .then(res => {
                // console.log(res)
                if(res.data.code===200) {
                    this.$message.success('调机校验成功！')
                    // 调机成功保存数据后，返回工单页面前，把扫码数据列表清空
                    if(!this.isPC) {
                        this.emptyScans()
                    }
                    this.$router.replace('/home/work_order2')
                }else{
                    this.$message.error('调机校验失败！请重试')
                }
            }).catch(err => err)
        },
        checkOver() {
            // 提交验证结果
            this.checkScans()
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
.tabwrap{
    text-align: right;
}
.btn{
    margin-bottom: 20px;
}
</style>
