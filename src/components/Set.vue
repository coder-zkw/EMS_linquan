<template>
    <div class="set">
        <el-card>
            <div slot="header" class="clearfix">
                <span>验证设置</span>
                <el-button style="float: right; padding: 3px 0" type="text" v-show="isSet" @click="isSet=false">退出设置</el-button>
            </div>
            <div v-if="!isSet">
                请输入密码：
                <el-input type="password" v-focus v-model="password" @keyup.enter.native="setting"></el-input>
                <el-button type="primary" @click="setting">登录</el-button>
            </div>
            <div v-else>
                <el-tabs v-model="activeName">
                    <el-tab-pane label="验证机台管理" name="machine">
                        <el-row class="border">
                            <el-form ref="Lform" :model="Lform" label-width="120px">
                                <span>林全机台：</span>
                                <el-form-item label="需要全部验证：">
                                    <el-switch v-model="Lform.checkAll"></el-switch>
                                </el-form-item>
                                <el-form-item label="选择验证机台：">
                                    <el-checkbox-group v-model="Lform.machine">
                                        <el-checkbox 
                                            v-for="(item, i) in linquanList"
                                            :label="item.BM_NAME" 
                                            name="machine"
                                            :key="i">
                                        </el-checkbox>
                                    </el-checkbox-group>
                                </el-form-item>
                                <div class="btnwrap">
                                    <el-button type="success" @click="LformSubmit">确定</el-button>
                                </div>
                            </el-form>
                        </el-row>
                        <el-row>
                            <el-form ref="FLform" :model="FLform" label-width="120px">
                                <span>非林全机台：</span>
                                <el-form-item label="需要全部验证：">
                                    <el-switch v-model="FLform.checkAll"></el-switch>
                                </el-form-item>
                                <el-form-item label="选择验证机台：">
                                    <el-checkbox-group v-model="FLform.machine">
                                        <el-checkbox 
                                            v-for="(item, i) in noLinquanList"
                                            :label="item.BM_NAME" 
                                            name="machine"
                                            :key="i">
                                        </el-checkbox>
                                    </el-checkbox-group>
                                </el-form-item>
                                <div class="btnwrap">
                                    <el-button type="success" @click="FLformSubmit">确定</el-button>
                                </div>
                            </el-form>
                        </el-row>
                    </el-tab-pane>
                    <el-tab-pane label="验证时间管理" name="time">
                        <div class="timeSelect">选择取消验证时间段：
                            <el-time-picker
                                is-range
                                v-model="times"
                                range-separator="至"
                                start-placeholder="开始时间"
                                end-placeholder="结束时间"
                                format='HH:mm'
                                value-format='HH:mm'>
                            </el-time-picker>
                            <el-button class="addBtn" type="primary" @click="addTimes">增加</el-button>
                        </div>
                        <el-table :data="timeData" style="width: 100%" v-if="timeData.length>0">
                            <el-table-column type="index"></el-table-column>
                            <el-table-column prop="startTime" label="开始时间"></el-table-column>
                            <el-table-column prop="endTime" label="截止时间"></el-table-column>
                            <el-table-column label="操作">
                                <template slot-scope="scope">
                                    <el-button @click="deleTimes(scope.row)" type="danger">删除</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-tab-pane>
                </el-tabs>
            </div>
        </el-card>
    </div>
</template>
<script>
import axios from 'axios'

export default {
    data() {
        return {
            // 林全设备列表
            linquanList: [],
            // 非林全设备列表
            noLinquanList: [],
            isSet: false,
            password: '',
            Lform: {
                checkAll: false,
                machine: []
            },
            FLform: {
                checkAll: false,
                machine: []
            },
            activeName: 'machine',
            times: '',
            timeData: []
        }
    },
    created() {
        this.getEquipments()
        this.getCheckList()
        this.getNoThunTimes()
    },
    methods: {
        getEquipments() {
            // axios.get('http://mengxuegu.com:7300/mock/5ea245bd2a2f716419f892c5/GetUser')
            axios.get(this.httpUrl + 'MES/GetUser')
            .then((res) => {
                // console.log(res)
                // 设备名分别存入林全机台组和非林全机台组
                if(res.status === 200) {
                    const equipments = res.data.machine
                    equipments.map(item => {
                        if(item.BM_LQ === 0) {
                            this.linquanList.push(item)
                        }else{
                            this.noLinquanList.push(item)
                        }
                    })
                }else{
                    this.$message.error('获取设备名失败！')
                }
            }).catch(err => err)
        },
        getCheckList() {
            axios.get(this.killBrowserUrl + 'server/getRedisSet')
            .then((res) => {
                // console.log(res)
                let result = res.data
                if(result.code === 200) {
                    const sets = result.content
                    this.Lform.checkAll = sets._check_run
                    this.Lform.machine = sets.mac_run_check_list.split(',')
                    this.FLform.checkAll = sets.other_is_check_run
                    this.FLform.machine = sets.other_mac_run_check_list.split(',')
                }else{
                    this.$message.error('获取验证信息失败！')
                }
            }).catch(err => err)
        },
        setting() {
            if(this.password === '88888') {
                this.isSet = true
                this.password = ''
            }else{
                this.$message.error('密码错误！')
            }
        },
        LformSubmit() {
            // console.log(this.Lform)
            let formdata = new FormData()
            formdata.append('model', 'replace')
            formdata.append('checkList', this.Lform.machine.join(','))
            if(this.Lform.checkAll === true) {
                axios.post(this.killBrowserUrl + 'server/setCheckLq')
                .then(() => {
                    this.$message.success('林全机台全部需要验证设置成功！')
                }).catch(err => err)
            }else{
                axios.post(this.killBrowserUrl + 'server/setPassLq', formdata)
                .then(() => {
                    this.$message.success('林全机台部分需要验证设置成功！')
                }).catch(err => err)
            }
        },
        FLformSubmit() {
            let formdata = new FormData()
            formdata.append('model', 'replace')
            formdata.append('checkList', this.FLform.machine.join(','))
            if(this.FLform.checkAll === true) {
                axios.post(this.killBrowserUrl + 'server/setCheckOther')
                .then(() => {
                    this.$message.success('非林全机台全部需要验证设置成功！')
                }).catch(err => err)
            }else{
                axios.post(this.killBrowserUrl + 'server/setPassOther', formdata)
                .then(() => {
                    this.$message.success('非林全机台部分需要验证设置成功！')
                }).catch(err => err)
            }
        },
        // 获取取消验证时间段列表
        getNoThunTimes() {
            // axios.get('http://192.168.1.82:10003/server/getTimerCloseCheck')
            axios.get(this.killBrowserUrl+'server/getTimerCloseCheck')
            .then(res => {
                // console.log(res)
                if(res.data.code === 200) {
                    // 将获取的时间字符串，转换成数组渲染成表格
                    const timeStr = res.data.content
                    if(timeStr != null) {
                        this.toTimeArrTable(timeStr)
                    }
                }else{
                    this.$message.error('获取取消验证时间段失败！请重试')
                }
            }).catch(err => err)
        },
        addTimes() {
            // console.log(this.times)
            let formdata = new FormData()
            formdata.append('start', this.times[0])
            formdata.append('end', this.times[1])
            axios.post(this.killBrowserUrl+'server/addTimerCloseCheck', formdata)
            .then(res => {
                // console.log(res)
                if(res.data.code === 200){
                    this.timeData = []
                    this.getNoThunTimes()
                }else{
                    this.$message.error('新增时间段失败！请重试')
                }
            }).catch(err => err)
        },
        deleTimes(row) {
            // console.log(row)
            let formdata = new FormData()
            formdata.append('start', row.startTime)
            formdata.append('end', row.endTime)
            axios.post(this.killBrowserUrl+'server/delTimerCloseCheck', formdata)
            .then(res => {
                // console.log(res)
                if(res.data.code === 200){
                    this.timeData = []
                    this.getNoThunTimes()
                }else{
                    this.$message.error('删除时间段失败！请重试')
                }
            }).catch(err => err)
        },
        toTimeArrTable(str) {
            const times = str.split(',')
            for(let i = 0; i < times.length-1; i++){
                const time = times[i].split('-')
                let timeItem = {
                    startTime: time[0],
                    endTime: time[1]
                }
                this.timeData.push(timeItem)
            }
            // console.log(this.timeData)
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
.el-input{
    width: 200px;
    margin-right: 20px;
}
.btnwrap{
    text-align: right;
}
.border{
    border-bottom: 2px dashed #eee;
    padding-bottom: 20px;
    margin-bottom: 20px;
}
.timeSelect{
    margin: 10px 0;
}
.addBtn{
    margin-left: 10px;
}
</style>