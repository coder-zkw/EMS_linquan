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
                <el-row class="border">
                    <el-form ref="Lform" :model="Lform" label-width="120px">
                        <span>林全机台：</span>
                        <el-form-item label="需要全部验证：">
                            <el-switch v-model="Lform.checkAll"></el-switch>
                        </el-form-item>
                        <el-form-item label="需要验证机台：">
                            <el-input type="textarea" v-model="Lform.machines"></el-input>
                        </el-form-item>
                        <el-form-item label="设置模式：">
                            <el-radio-group v-model="Lform.mode">
                                <el-radio label="append">追加</el-radio>
                                <el-radio label="replace">覆盖</el-radio>
                            </el-radio-group>
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
                        <el-form-item label="需要验证机台：">
                            <el-input type="textarea" v-model="FLform.machines"></el-input>
                        </el-form-item>
                        <el-form-item label="设置模式：">
                            <el-radio-group v-model="FLform.mode">
                                <el-radio label="append">追加</el-radio>
                                <el-radio label="replace">覆盖</el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <div class="btnwrap">
                            <el-button type="success" @click="FLformSubmit">确定</el-button>
                        </div>
                    </el-form>
                </el-row>
            </div>
        </el-card>
    </div>
</template>
<script>
import axios from 'axios'

export default {
    data() {
        return {
            isSet: false,
            password: '',
            Lform: {
                checkAll: false,
                machines: '',
                mode: 'replace'
            },
            FLform: {
                checkAll: false,
                machines: '',
                mode: 'replace'
            }
        }
    },
    created() {
        this.getCheckList()
    },
    methods: {
        getCheckList() {
            axios.get(this.killBrowserUrl + 'server/getRedisSet')
            .then((res) => {
                // console.log(res)
                let result = res.data
                if(result.code === 200) {
                    this.Lform.checkAll = result.content._check_run
                    this.Lform.machines = result.content.mac_run_check_list
                    this.FLform.checkAll = result.content.other_is_check_run
                    this.FLform.machines = result.content.other_mac_run_check_list
                }else{
                    this.$message.error('获取验证信息失败！')
                }
            }).catch(err => err)
        },
        setting() {
            if(this.password === '0000') {
                this.isSet = true
                this.password = ''
            }else{
                this.$message.error('密码错误！')
            }
        },
        LformSubmit() {
            // console.log(this.Lform)
            let formdata = new FormData()
            formdata.append('model', this.Lform.mode)
            formdata.append('checkList', this.Lform.machines)
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
            formdata.append('model', this.FLform.mode)
            formdata.append('checkList', this.FLform.machines)
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
</style>