<template>
    <div class="materials"> 
        <el-page-header @back="goBack" content="物料校验"></el-page-header>
        <div class="exitBut">
            <el-button class="fullScreen" type="info" plain @click="toggleFullscreen">全屏</el-button>
            <el-button  type="primary" plain @click="exiting">退出</el-button>
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
        <el-table-column type="index" width="40"></el-table-column>
        <el-table-column v-for="(item, i) in columns" :prop="item.S_NAME" :label="item.S_CHINESE" :key="i"></el-table-column>
        <el-table-column label="校验结果">
            <template slot-scope="scope">
                <el-checkbox v-model="scope.row.checked" :checked="scope.row.checked"></el-checkbox>
            </template>
        </el-table-column>
        </el-table>
    </div>
</template>
<script>
import axios from 'axios'
import screenfull from 'screenfull'

export default {
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
            isFullscreen: false
        }
    },
    created() {
        this.work_orderId = this.$route.query.work_id
        this.work = this.$route.query.work
        // console.log(this.work_orderId, this.work)
        this.getMaterialsList()
    },
    methods: {
        getMaterialsList() {
            axios.get(this.httpUrl + 'GetTitle?page=PRD_APS_BOM')
            // axios.get('http://mengxuegu.com:7300/mock/5e6a16f0e7a1bb0518bb7477/aps/GetTitle?page=PRD_APS_BOM')
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
            // axios.get('http://mengxuegu.com:7300/mock/5e6a16f0e7a1bb0518bb7477/aps/GetProductHalf?wo='+ this.work_orderId)
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
            if(checkedNum.length === datas.length) {
                // 校验成功，禁用扫码框
                this.disabledFlag = true
                // 校验
                axios.get(this.httpUrl + 'GetRecord?w=')
                // axios.get('http://mengxuegu.com:7300/mock/5e6a16f0e7a1bb0518bb7477/aps/GetRecord')
                .then((res) => {
                    // console.log(res)
                    // 校验成功，跳转页面
                    if(res.data === 'success') {
                        this.$message.success('校验成功，页面即将跳至看板页面！')
                        // 延迟3秒跳转至看板页面
                        setTimeout(() => {
                            this.$router.push('/machine?work=' + this.work)
                        }, 3000)
                    }else {
                        // 校验失败，返回重新校验
                        this.$message.error('插入标识失败！请重新尝试。')
                        this.$router.replace('/work_order')
                    }
                }).catch(err => err)
            }
            // 输入框清空
            this.inputVal = ''
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
</style>
