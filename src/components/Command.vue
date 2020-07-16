<template>
    <div class="command">
        <div class="el-page-header">
            <div class="el-page-header__left">
                <i class="el-icon-s-home"></i>
                <div class="el-page-header__title">首页</div>
            </div>
            <div class="el-page-header__content">指令选择</div>
        </div>
        <el-card class="box-card">
            <el-row :gutter="12">
                <el-col :span="8" v-for="(item, i) in commands" :key="i">
                    <el-button type="primary" @click="toTargetPage(item)">{{item.text}}</el-button>
                </el-col>
            </el-row>
        </el-card>
        <!-- 选择机台弹出框 -->
        <el-dialog
            title="选择机台"
            :visible.sync="selectMachineVisible"
            width="60%">
            <el-form>
                <el-form-item prop="machine">
                    <el-select v-model="machine" placeholder="请选择机台">
                        <i slot="prefix" class="iconTitle el-icon-s-platform"></i>
                        <el-option v-for="(item,i) in equipmentsList" :key="i" :label="item.BM_NAME" :value="item.BM_NAME"></el-option>
                    </el-select>
                    <el-button type="primary" icon="el-icon-mobile-phone" @click="handleSaoma">扫码</el-button>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button type="success" @click="machineChecked">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 扫码控件 -->
        <scan-frame v-show="scanShow" ref="scan" @getScan="getScan" @closeScan="closeScan"></scan-frame>
    </div>
</template>
<script>
import axios from 'axios'
import ScanFrame from '../utils/ScanFrame'

export default {
    components: { ScanFrame },
    data() {
        return {
            equipmentsList: [
                // {BM_NAME: 'machine01'},{BM_NAME: 'machine03'}
                ],
            machine: '',
            equipmentsOnline: [],
            isDataLQ: [],
            author: this.$route.query.author,
            commands: [
                {text: '调 机', path: '/home/work_order2', isHasMachine: true, author: '1'},
                {text: '首 / 中 / 末检', path: '/home/examworks', isHasMachine: false, author: '2'},
                {text: 'IPQC审核', path: '/home/audit', isHasMachine: false, author: '3'}
            ],
            selectMachineVisible: false,
            selectMachinePath: '',
            scanShow: false
        }
    },
    created() {
        // console.log(this.author)
        // this.showCommands(this.author)
        // 获取设备名,操作员列表
        this.getEquipments()
        // 获取在线设备数组
        this.getEquipmentOnline()
    },
    methods: {
        showCommands(author) {
            if(author === '0'){
                return this.$message.warning('可操作指令为空！请找管理员配置相关权限')
            }
            const authors = author.split(',')
            authors.map(item => {
                if(item === '1'){
                    this.commands.push({text: '调 机', path: '/home/work_order2', isHasMachine: true})
                }else if(item === '3'){
                    this.commands.push({text: '首 / 中 / 末检', path: '/home/examworks', isHasMachine: false})
                }else if(item === '2'){
                    this.commands.push({text: 'IPQC审核', path: '/home/audit', isHasMachine: false})
                }
            })
        },
        // 获取设备名称
        getEquipments() {
            // axios.get('http://mengxuegu.com:7300/mock/5e6a16f0e7a1bb0518bb7477/aps/GetUser')
            axios.get(this.httpUrl + 'MES/GetUser')
            .then((res) => {
                // 此设备数据保留，待获取是否林全机台用
                this.isDataLQ = res.data.machine
                // console.log(res)
                this.equipmentsList = res.data.machine
            }).catch(err => err)
        },
        getEquipmentOnline() {
            axios.get(this.killBrowserUrl + 'server/getOnline')
            .then((res) => {
                // console.log(res)
                if(res.data.code === 200) {
                    this.equipmentsOnline = res.data.content
                } 
            }).catch(err => err)
            // 模拟有在线机台，用于测试
            // this.equipmentsOnline = [{name: 'machine02'},{name: 'machine03'}]
        },
        toTargetPage(item) {
            // localStorage.setItem('author', item.author)
            if(item.isHasMachine) {
                this.selectMachineVisible = true
                this.selectMachinePath = item.path
            }else{
                this.$router.push(item.path)
            }
        },
        machineChecked() {
            if(this.machine === '') {
                return this.$message.warning('机台不能为空！')
            }
            if(this.isMachineOnline()) {
                localStorage.setItem('userName', this.machine)
                this.$router.push(this.selectMachinePath)
            }
        },
        isMachineOnline() {
            const index = this.equipmentsOnline.findIndex(item => item.name === this.machine)
            if(index === -1) {
                this.$message.error('当前机台未连接，请先上线')
                return false
            }
            const isUser = this.isDataLQ.find(item => item.BM_NAME === this.machine)
            // 缓存是否林全公司机台
            localStorage.setItem('company', isUser.BM_LQ)
            return true
        },
        selectMachine(machine) {
            this.machine = machine
        },
        handleSaoma() {
            this.scanShow = true
            // 开启扫描框后，触发子组件的开始扫描方法
            this.$nextTick(() => {
                this.$refs.scan.handleScan()
            })
        },
        getScan(value) {
            // 如果扫码结果在机台数组存在则赋值给下拉框
            const isMachine = this.equipmentsList.findIndex(item => item.BM_NAME === value)
            if(isMachine === -1) {
                return this.$message.error('此机台不存在！请选择正确机台')
            }
            this.machine = value
        },
        closeScan() {
            this.scanShow = false
        },
    }
}
</script>
<style scoped>
.el-page-header{
  display: flex;
  align-items: center;
}
.el-icon-s-home{
  padding: 4px;
}
.iconTitle{
    margin-left: 2px;
    font-size: 20px;
    font-weight: 700;
    color:rgb(38, 181, 238);
}
</style>
