<template>
    <div class="login">
        <el-form class="form-login" :rules="rules" ref="form" :model="form" label-width="80px">
            <h2 class="form-title">林全MES系统</h2>
            <el-form-item label="设备" prop="userName">
                <el-select v-model="form.userName" placeholder="请选择设备">
                    <el-option v-for="(item,i) in equipmentsList" :key="i" :label="item.BM_NAME" :value="item.BM_NAME"></el-option>
                </el-select>
                <el-button size="mini" v-show="isShow" plain class="changeEquip" @click="ChangeEquip">重新选择设备</el-button>
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input v-model="form.password" type="password" @keyup.enter.native="submitForm"></el-input>
            </el-form-item>
            <el-form-item prop="remember">
                <el-checkbox label="记住设备名" v-model="remember" disabled></el-checkbox>
            </el-form-item>
            <el-form-item class="btn_wrap">
                <el-button type="primary" @click="submitForm">登录</el-button>
                <el-button type="info" @click="cancel">取消</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>
<script>
import axios from 'axios'

// const moni = [
//     {
//         S_NAME: 'sd'
//     },
//     {
//         S_NAME: 'qw'
//     },
//     {
//         S_NAME: 'er'
//     }
// ]
export default {
    data() {
        return {
            equipmentsList: [],
            form: {
                userName: '',
                password: ''
            },
            // 表单前端校验
            rules: {
                userName: [
                    {required: true, message: '请选择设备！', tigger: 'blur'}
                ],
                password: [
                    {required: true, message: '密码不能为空！', tigger: 'blur'}
                ]
            },
            // 是否记住设备名
            remember: true,
            // 重新选择设备显示隐藏
            isShow: false
        }
    },
    created() {
        // 获取缓存中的设备名
        // localStorage.setItem('userName', 'jachine2')
        const userName = localStorage.getItem('userName')
        if(userName != null) {
            this.form.userName = userName
            // 有缓存，显示重新获取设备按钮，此时不获取设备列表直接return出去
            this.isShow = true
            return
        }
        // 获取设备名列表
        this.getEquipments()
    },
    methods: {
        // 登录校验用户名和密码
        submitForm() {
            const {userName, password} = this.form
            this.$refs.form.validate(valid => {
                if(valid) {
                    axios.get(this.httpUrl + 'GetLogin?u=' + userName + '&p=' + password)
                    .then((res) => {
                        // console.log(res)
                        if(res.status === 200 && res.data === 'success') {
                            // 如果用户勾选了记住设备名则将用户名缓存
                            if(this.remember) {
                                localStorage.setItem('userName', userName)
                            }
                            this.$router.push('/work_order')
                        }else{
                            this.$message.error('密码错误！请重新输入')
                        }
                    }).catch(err => err)
                }
            })
        },
        // 取消重置
        cancel() {
            this.$refs.form.resetFields()
        },
        // 获取设备名称
        getEquipments() {
            axios.get(this.httpUrl + 'GetUser')
            .then((res) => {
                // console.log(res)
                this.equipmentsList = res.data
            }).catch(err => err)
        },
        // 重新选择设备
        ChangeEquip() {
            // 清缓存中的userName并刷新页面重新获取设备
            localStorage.removeItem('userName')
            location.reload()
        }
    }
};
</script>
<style>
    .login{
        position: absolute;
        width: 100%;
        height: 100%;
        background: #888;
        background-size: cover;
    }
    .form-login{
        width: 420px;
        margin: 160px auto;
        background: rgba(255, 255, 255, .8);
        padding: 24px;
        border-radius: 15px;
    }
    .form-title{
        color: #333202;
        text-align: center;
    }
    .el-select{
        width: 100%;
    }
    .btn_wrap .el-button{
        margin-right: 30px;
    }
    .changeEquip{
        position: absolute;
        right: 0;
        bottom: -20px;
        padding: 2px 5px;
    }
</style>