<template>
    <div class="set">
        <el-card>
            <div slot="header" class="clearfix">
                <span><i class="el-icon-setting"></i> 上位机设置</span>
            </div>
            <!-- <div v-if="!isSet">
                请输入密码：
                <el-input type="password" v-focus v-model="password" @keyup.enter.native="setting"></el-input>
                <el-button type="primary" @click="setting">登录</el-button>
            </div> -->
            <div>
                <el-tabs v-model="activeName" @tab-click="handleClick">
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
                    <el-tab-pane label="密码管理" name="password">
                        <el-form :model="userForm" :rules="rules" ref="userForm" class="userForm" label-width="120px">
                            <el-form-item label="机台：" prop="machine">
                                <el-select v-model="userForm.machine" placeholder="请选择机台">
                                    <el-option v-for="(item,i) in equipmentsOnline" :key="i" :value="item.name"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="角色：" prop="roles">
                                <el-select v-model="userForm.roles" placeholder="请选择角色">
                                    <el-option label="厂家" value="factory"></el-option>
                                    <el-option label="管理员" value="admin"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="旧密码：" prop="oldPass">
                                <el-input type="password" v-model="userForm.oldPass"></el-input>
                            </el-form-item>
                            <el-form-item label="新密码：" prop="newPass">
                                <el-input type="password" v-model="userForm.newPass" autocomplete="off"></el-input>
                            </el-form-item>
                            <el-form-item label="确认新密码：" prop="checkPass">
                                <el-input type="password" v-model="userForm.checkPass" autocomplete="off"></el-input>
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary" @click="passSubmit">提 交</el-button>
                                <el-button type="info" @click="passReset">重 置</el-button>
                            </el-form-item>
                            </el-form>
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
        var validatePass = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('新密码不能为空！'))
            } else {
                if (this.userForm.checkPass !== '') {
                    this.$refs.userForm.validateField('checkPass')
                }
                callback()
            }
        }
        var validatePass2 = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('确认新密码不能为空！'))
            } else if (value !== this.userForm.newPass) {
                callback(new Error('两次输入密码不一致！'))
            } else {
                callback()
            }
        }
        return {
            // 林全设备列表
            linquanList: [],
            // 非林全设备列表
            noLinquanList: [],
            isSet: false,
            // password: '',
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
            timeData: [],
            equipmentsOnline: [],
            userForm: {
                machine: '',
                roles: 'admin',
                oldPass: '',
                newPass: '',
                checkPass: ''
            },
            rules: {
                machine: [
                    {required: 'true', message: '机台不能为空！', trigger: 'blur'}
                ],
                roles: [
                    {required: 'true', message: '角色不能为空！', trigger: 'blur'}
                ],
                oldPass: [
                    {required: 'true', message: '旧密码不能为空！', trigger: 'blur'}
                ],
                newPass: [
                    {required: 'true', validator: validatePass, trigger: 'change'}
                ],
                checkPass: [
                    {required: 'true', validator: validatePass2, trigger: 'change'}
                ]
            }
        }
    },
    created() {
        this.getEquipments()
        this.getCheckList()
        this.getNoThunTimes()
    },
    methods: {
        handleClick(tab) {
            // console.log(tab)
            if(tab.name === 'password') {
                // console.log('获取在线机台')
                this.getEquipmentOnline()
            }
        },
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
        // setting() {
        //     if(this.password === '88888') {
        //         this.isSet = true
        //         this.password = ''
        //     }else{
        //         this.$message.error('密码错误！')
        //     }
        // },
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
        },
        getEquipmentOnline() {
            // axios.get('http://mengxuegu.com:7300/mock/5e6a16f0e7a1bb0518bb7477/aps/server/getOnline')
            axios.get(this.killBrowserUrl + 'server/getOnline')
            .then((res) => {
                // console.log(res)
                if(res.data.code === 200) {
                    this.equipmentsOnline = res.data.content
                } 
            }).catch(err => err)
        },
        passSubmit() {
            const {machine, roles, oldPass, newPass} = this.userForm
            let formdata = new FormData()
            formdata.append('machineName', machine)
            formdata.append('r', roles)
            formdata.append('o', oldPass)
            formdata.append('n', newPass)
            this.$refs.userForm.validate(valid => {
                if(valid) {
                    axios.post(this.killBrowserUrl + 'cmd/changePwd', formdata)
                    .then((res) => {
                        // console.log(res)
                        if(res.data.code === 200) {
                            this.$message.success('新密码已发送至后台！')
                            // 修改成功后，清空表单
                            this.passReset()
                        } else {
                            this.$message.error('修改密码失败！请重试')
                        }
                    }).catch(err => {
                        this.$message.error('机台已离线，请前往现场设置')
                    })
                }
            })
        },
        passReset() {
            this.$refs.userForm.resetFields()
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
/* .el-input{
    width: 50%;
} */
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
.userForm{
    margin-top: 10px;
}
</style>