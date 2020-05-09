<template>
    <div class="login">
        <el-form class="form-login" :rules="rules" ref="form" :model="form" label-width="80px">
            <h2 class="form-title">林全<span @dblclick="update">MES</span>系统</h2>
            <el-form-item label="设备" prop="userName">
                <el-select v-model="form.userName" placeholder="请选择设备">
                    <el-option v-for="(item,i) in equipmentsList" :key="i" :label="item.BM_NAME" :value="item.BM_NAME"></el-option>
                </el-select>
                <el-button size="mini" v-show="isShow" plain class="changeEquip" @click="ChangeEquip">重新选择设备</el-button>
            </el-form-item>
            <el-form-item label="操作员" prop="operator">
                <el-select v-model="form.operator" placeholder="请选择操作员">
                    <el-option v-for="(item,i) in operators" :key="i" :label="item.S_NAME" :value="item.S_NAME"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input 
                    ref="inputRef"
                    v-model="form.password" 
                    type="password" 
                    @keyup.enter.native="submitForm">
                    <el-button 
                        v-if="isKeyboard"
                        slot="suffix" 
                        size="mini" 
                        type="primary" 
                        circle 
                        class="el-icon-c-scale-to-original"
                        @click="show"
                        data-layout="normal">
                    </el-button>
                </el-input>
            </el-form-item>
            <el-form-item prop="remember">
                <el-checkbox label="记住设备名" v-model="remember" disabled></el-checkbox>
            </el-form-item>
            <el-form-item class="btn_wrap">
                <el-button type="primary" @click="submitForm">登录</el-button>
                <el-button type="info" @click="cancel">取消</el-button>
            </el-form-item>
        </el-form>
        <vue-touch-keyboard
            class="keyboard" 
            :options="options"
            v-if="visible"
            :layout="layout"
            :cancel="hide"
            :accept="accept"
            :input="input">
        </vue-touch-keyboard>
    </div>
</template>
<script>
import Vue from 'vue'
import axios from 'axios'
import VueTouchKeyboard from 'vue-touch-keyboard'
import style from 'vue-touch-keyboard/dist/vue-touch-keyboard.css'

Vue.use(VueTouchKeyboard)

export default {
    data() {
        return {
            equipmentsList: [],
            operators: [],
            // 获取是否林全设备信息保留数据
            isDataLQ: [],
            form: {
                userName: '',
                operator: '',
                password: ''
            },
            // 表单前端校验
            rules: {
                userName: [
                    {required: true, message: '请选择设备！', tigger: 'blur'}
                ],
                operator: [
                    {required: true, message: '请选择操作员！', tigger: 'blur'}
                ],
                password: [
                    {required: true, message: '密码不能为空！', tigger: 'blur'}
                ]
            },
            // 是否记住设备名
            remember: true,
            // 重新选择设备显示隐藏
            isShow: false,
            equipmentsOnline: [],
            // 调用键盘参数
            isKeyboard: true,
            visible: false,
            layout: "normal",
            input: null,
            options: {
                useKbEvents: false,
                preventClickEvent: false
            }
        }
    },
    created() {
        // 获取在线设备数组(要先在下面的return前获取到)
        this.getEquipmentOnline()
        // 获取设备名,操作员列表
        this.getEquipments()
        this.getOpenType()
    },
    methods: {
        getEquipmentOnline() {
            // axios.get('http://mengxuegu.com:7300/mock/5e6a16f0e7a1bb0518bb7477/aps/server/getOnline')
            // axios.get(this.killBrowserUrl + 'server/getOnline')
            // .then((res) => {
            //     // console.log(res)
            //     if(res.data.code === 200) {
            //         this.equipmentsOnline = res.data.content
            //     } 
            // }).catch(err => err)
            // 模拟有在线机台，用于测试
            this.equipmentsOnline = [{name: 'machine02'},{name: 'machine03'}]
        },
        // 登录校验用户名和密码
        submitForm() {
            const {userName, operator, password} = this.form
            this.$refs.form.validate(valid => {
                if(valid) {
                    // 判断已连接设备中是否当前设备
                    const index = this.equipmentsOnline.findIndex(item => item.name === userName)
                    if(index === -1) {
                        this.$message.error('当前机台未连接，请先上线')
                        return
                    }
                    // axios.get('http://mengxuegu.com:7300/mock/5e6a16f0e7a1bb0518bb7477/aps/GetRecord')
                    axios.get(this.httpUrl + 'MES/GetLogin?u=' + operator + '&p=' + password)
                    .then((res) => {
                        // console.log(res)
                        // if(res.status === 200 && res.data.data === 'success') {
                        if(res.status === 200 && res.data === 'success') {
                            // 如果用户勾选了记住设备名则将用户名缓存
                            if(this.remember) {
                                localStorage.setItem('userName', userName)
                                const isUser = this.isDataLQ.find(item => item.BM_NAME === userName)
                                localStorage.setItem('company', isUser.BM_LQ)
                                localStorage.setItem('operator', operator)
                            }
                            // 权限为0，跳至开始生产的工单页面，否则跳至调机、首末检的工单页面
                            const currentOperator = this.operators.find(item => item.S_NAME === this.form.operator)
                            // 当前操作员权限存入缓存
                            localStorage.setItem('author', currentOperator.S_AUTHOR)
                            // 获取缓存中的isKeyboard,判断是电脑还是移动环境
                            const isPc = localStorage.getItem('isKeyboard')
                            // 若权限为2且电脑环境，跳至生产工单页面
                            if(currentOperator.S_AUTHOR === '0' || (isPc==='true' && currentOperator.S_AUTHOR === '2')){
                                this.$router.push('/work_order')
                            }else{
                                this.$router.push('/work_order2')
                            }
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
            // 获取缓存中的设备名
            // localStorage.setItem('userName', 'machine03')
            const userName = localStorage.getItem('userName')
            // axios.get('http://mengxuegu.com:7300/mock/5e6a16f0e7a1bb0518bb7477/aps/GetUser')
            axios.get(this.httpUrl + 'MES/GetUser')
            .then((res) => {
                // 此设备数据保留，待获取是否林全机台用
                this.isDataLQ = res.data.machine
                // console.log(res)
                this.operators = res.data.user
                if(userName != null) {
                    this.form.userName = userName
                    // 有缓存，显示重新获取设备按钮，此时不获取设备列表直接return出去
                    this.isShow = true
                    return
                }
                // 设备信息渲染用
                this.equipmentsList = res.data.machine
            }).catch(err => err)
        },
        // 重新选择设备
        ChangeEquip() {
            // 清缓存中的userName并刷新页面重新获取设备
            localStorage.removeItem('userName')
            localStorage.removeItem('company')
            localStorage.removeItem('operator')
            location.reload()
        },
        update() {
            window.location.href = this.httpUrl+'app/appLinQuan.apk'
        },
        show(e) {
            this.input = this.$refs.inputRef.$refs.input
            // this.layout = e.target.dataset.layout
            if (!this.visible)
                this.visible = true
        },
        accept(text) {
            //   console.log(text);    
            this.hide();
        },
        hide() {
            this.visible = false;
        },
        getOpenType() {
            let sUserAgent = navigator.userAgent.toLowerCase();
            let bIsIpad = sUserAgent.match(/ipad/i) == "ipad";//判断是否为iPad
            let bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";//判断是否为iPhone用户
            let bIsMidp = sUserAgent.match(/midp/i) == "midp";
            let bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
            let bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
            let bIsAndroid = sUserAgent.match(/android/i) == "android";
            let bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
            let bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
        
            if (!(bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM)) {
                // console.log("当前是电脑打开")
                this.isKeyboard = true
                localStorage.setItem('isKeyboard', true)
            }else{
                // console.log("当前是手机打开")
                this.isKeyboard = false
                localStorage.setItem('isKeyboard', false)
            }
        }
    }
};
</script>
<style>
    .login{
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        background: #888;
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
    .keyboard{
        position: fixed;
        left: 0;
        bottom: 0;
    }
</style>