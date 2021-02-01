<template>
    <div class="audit">
        <el-page-header @back="goBack" content="首末检审核"></el-page-header>
        <template>
            <el-table :data="tableData" border size="mini" style="width: 100%">
                <el-table-column prop="QP_USERID" label="工号"></el-table-column>
                <el-table-column prop="QP_PLAN_DATE" label="计划日期"></el-table-column>
                <el-table-column prop="QP_MACHINE" label="机台"></el-table-column>
                <el-table-column prop="QP_WORKER" label="制令"></el-table-column>
                <el-table-column prop="QP_ITEM_CODE" label="成品编号"></el-table-column>
                <el-table-column prop="QP_ITEM_NAME" label="成品名称"></el-table-column>
                <!-- <el-table-column prop="QP_ITEM_SPEC" label="成品规格"></el-table-column> -->
                <el-table-column prop="QP_WS_IDX" label="工序号"></el-table-column>
                <el-table-column prop="QP_GX_NAME" label="工序名称"></el-table-column>
                <el-table-column label="操作" width="145">
                    <template slot-scope="scope">
                        <el-button size="mini" type="info" @click="detailAuditOrder(scope.row)">详情</el-button>
                        <el-button size="mini" type="primary" @click="handleAuditResult(scope.row)">审核</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </template>
        <!-- 详情弹出框 -->
        <el-dialog title="品检详情" :visible.sync="dialogAuditVisible" width="80%">
            <el-row :gutter="12">
                <el-col :span="8" class="detailsText" shadow="always" v-for="(item,i) in columnsAll" :key="i">
                    <span class="machine_title">{{item.name}}:</span>
                    <span>{{detailData[item.c]}}</span>
                </el-col>
            </el-row>
            <el-table class="detailTab" :data="auditData" ref="examineRef" size="mini" border style="width: 100%">
                <el-table-column type="index" width="40"></el-table-column>
                <el-table-column prop="QP_CATE_NAME" label="品检类别"></el-table-column>
                <el-table-column prop="QP_QC_ITEM" label="品检项目" show-overflow-tooltip></el-table-column>
                <el-table-column prop="QP_WL_SPEC" label="规格" show-overflow-tooltip></el-table-column>
                <el-table-column prop="QP_QC_REMARK" label="品检备注" width="100"></el-table-column>
                <el-table-column prop="QP_TOOL_NAME" label="判定工具" width="70"></el-table-column>
                <el-table-column prop="QP_INPUT_MODE" label="录入方式" width="70"></el-table-column>
                <el-table-column prop="QP_QC_VALUE" label="标准值" width="70"></el-table-column>
                <el-table-column prop="QP_INPUTVAL" label="检验值" width="60"></el-table-column>
                <el-table-column prop="QP_STATUS" label="状态" width="52">
                    <template slot-scope="scope">
                        <el-tag size="mini" 
                            v-if="scope.row.QP_STATUS != null"
                            :type="scope.row.QP_STATUS === 'OK' ? 'success' : 'danger'">
                            {{scope.row.QP_STATUS}}
                        </el-tag>
                    </template>
                </el-table-column>
            </el-table>
        </el-dialog>
        <!-- 审核弹出框 -->
        <el-dialog title="审核结果" :visible.sync="dialogResultVisible" @closed="resetRemark" width="50%">
            <el-form>
                <el-form-item label="审核备注信息：">
                    <el-input type="textarea" v-model="form.remark"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="auditResultSubmit('N')">驳 回</el-button>
                <el-button type="primary" @click="auditResultSubmit('Y')">通 过</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
import getCurrentTime from '../utils/currentTime'
import axios from 'axios'

export default {
    data() {
        return {
            // 品检数据列表
            tableData: [],
            // 首末检工单列表标题项及对应属性名
            columnsAll: [
                {name:'工 号', c: 'QP_USERID'}, 
                {name:'计划日期', c: 'QP_PLAN_DATE'}, 
                {name:'机 台', c: 'QP_MACHINE'}, 
                {name:'制 令', c: 'QP_WORKER'}, 
                {name:'成品编号', c: 'QP_ITEM_CODE'}, 
                {name:'成品名称', c: 'QP_ITEM_NAME'}, 
                {name:'成品规格', c: 'QP_ITEM_SPEC'}, 
                {name:'客户编号', c: 'QP_CUST_CODE'}, 
                {name:'图纸日期', c: 'QP_CAD_DATE'}, 
                {name:'图纸版次', c: 'QP_CAD_VER'},
                {name:'工序序号', c: 'QP_WS_IDX'}, 
                {name:'工序名称', c: 'QP_GX_NAME'}, 
                {name:'工序描述', c: 'QP_WS_DESC'}, 
                {name:'实物编号', c: 'QP_IDENTIFIER'},
                {name:'备注', c: 'QP_REMARK'},
                {name:'品检结果', c: 'QP_PASS'}

            ],
            detailData: [],
            form: {
                remark: ''
            },
            // 品检详情弹出框
            dialogAuditVisible: false,
            // 具体某工单的品检信息
            auditData: [],
            // 审核结果弹出框
            dialogResultVisible: false,
            currentRow: {},
            auditResult: false,
            timer: null,
            isAllCheck: true
        }
    },
    created() {
        this.getExamineWorks()
    },
    methods: {
        detailAuditOrder(row) {
            this.detailData = row
            // for(let i = 0; i < this.columnsAll.length; i++) {
            //     this.detailData.push(row[this.columnsAll[i].c])
            // }
            // 获取品检结果信息列表
            // axios.get('http://localhost:50814/MES/GetQcDetails?QP_ONLY='+ row.QP_ONLY)
            axios.get(this.httpUrl + 'MES/GetQcDetails?QP_ONLY='+ row.QP_ONLY)
            .then(res => {
                // console.log(res)
                if(res.status === 200 && res.statusText === 'OK'){
                    this.auditData = res.data
                }else{
                    this.$message.error('获取品检信息失败！')
                }
            }).catch(err => err)
            this.dialogAuditVisible = true
        },
        // 获取品检完的工单列表
        getExamineWorks() {
            // axios.get('http://localhost:50814/MES/GetQcProductEnd')
            axios.get(this.httpUrl + 'MES/GetQcProductEnd')
            .then(res => {
                // console.log(res)
                if(res.status === 200 && res.statusText === 'OK'){
                    this.tableData = res.data
                }else{
                    this.$message.error('获取首末检工单信息失败！')
                }
            }).catch(err => err)
        },
        // 点击审核按钮，弹出审核结果备注提交框
        handleAuditResult(row) {
            this.currentRow = row
            this.dialogResultVisible = true
        },
        // 提交审核结果，点击“通过”result为“Y”,点击“驳回”result为“N”
        auditResultSubmit(result){
            if (result === 'N' && this.form.remark === '') {
                return this.$message.warning('驳回备注不能为空！')
            }
            // axios.post('http://localhost:50814/MES/QcProductendPass', {
            axios.post(this.httpUrl + 'MES/QcProductendPass', {
                "QP_ONLY": this.currentRow.QP_ONLY,
                "QP_PASS": result,
                "QP_QC_REMARK": this.form.remark,
                "QP_QC_NAME": localStorage.getItem('operator')
            }).then(res => {
                // console.log(res)
                if(res.data.code === 200){
                    this.$message.success('审核结果提交成功！')
                    // 更新列表
                    this.getExamineWorks()
                    // 驳回则调接口停机
                    if(result === 'N') {
                        this.stopMachine()
                    }
                }else {
                    this.$message.error('审核结果提交失败！请重试')
                }
            }).catch(err => err)
            this.dialogResultVisible = false
            this.form.remark = ''
        },
        stopMachine() {
            let formdata = new FormData()
            formdata.append('machineName', this.currentRow.QP_MACHINE)
            formdata.append('why', '首检审核不通过')
            axios.post(this.killBrowserUrl + 'cmd/stopRun', formdata)
            .then((res) => {
                // console.log(res)
                if(res.data.code === 200) {
                    this.$message.success('机器停止运行')
                } else {
                    this.$message.error('停机失败，请手动关闭')
                }
            }).catch(err => err)
        },
        resetRemark() {
            this.form.remark = ''
        },
        goBack() {
            this.$router.go(-1)
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
.machine_title{
    display: inline-block;
    width: 75px;
}
.detailTab{
    margin-top: 10px;
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