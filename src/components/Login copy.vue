<template>
    <div class="login">
        <div class="loginWrap">
            <div class="loginHeader">
                <img src="../assets/logo.png" alt="林全科技">
                <h1>林全<span @dblclick="update">MES</span>系统</h1>
            </div>
            <el-form class="form-login" :rules="rules" ref="form" :model="form">
                <h2 class="form-title">用 户 登 录</h2>
                <el-form-item prop="userName">
                    <el-select v-model="form.userName" placeholder="请选择设备">
                        <i slot="prefix" class="iconTitle el-icon-s-platform"></i>
                        <el-option v-for="(item,i) in equipmentsList" :key="i" :label="item.BM_NAME" :value="item.BM_NAME"></el-option>
                    </el-select>
                    <el-button size="mini" v-show="isShow" plain class="changeEquip" @click="ChangeEquip">重新选择设备</el-button>
                </el-form-item>
                <el-form-item prop="operator">
                    <!-- <el-select v-model="form.operator" placeholder="请选择操作员">
                        <i slot="prefix" class="iconTitle el-icon-user"></i>
                        <el-option v-for="(item,i) in operators" :key="i" :label="item.S_NAME" :value="item.S_NAME"></el-option>
                    </el-select> -->
                    <el-input v-model="form.operator" v-focus placeholder="请扫码选择操作员">
                        <i slot="prefix" class="iconTitle el-icon-user"></i>
                    </el-input>
                    <el-button 
                        v-if="!isKeyboard"
                        class="saoma"
                        size="mini" 
                        circle 
                        type="primary" 
                        icon="el-icon-mobile-phone"
                        @click="handleSaoma('operator')">
                    </el-button>
                </el-form-item>
                <el-form-item prop="password" class="clearMargin">
                    <el-input 
                        ref="inputRef"
                        v-model="form.password" 
                        type="password" 
                        placeholder="请输入密码"
                        @keyup.enter.native="submitForm">
                        <i slot="prefix" class="iconTitle el-icon-lock"></i>
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
                <el-form-item prop="remember" class="clearMargin">
                    <el-checkbox label="记住设备名" v-model="remember" disabled></el-checkbox>
                </el-form-item>
                <el-form-item class="btn_wrap">
                    <el-button type="primary" @click="submitForm">登 录</el-button>
                    <!-- <el-button type="info" @click="cancel">取 消</el-button> -->
                </el-form-item>
            </el-form>
        </div>
        <vue-touch-keyboard 
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
                    {required: true, message: '操作员不能为空！', tigger: 'blur'}
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
    activated() {
        // 扫码后返回页面更改可扫码框的值
        const result = this.$store.state.scanItems
        result.map(item => {
            if(item.name === 'operator') {
                this.form.operator = item.value
                return
            }
        })
    },
    methods: {
        getEquipmentOnline() {
            // axios.get('http://mengxuegu.com:7300/mock/5e6a16f0e7a1bb0518bb7477/aps/server/getOnline')
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
                            const author = currentOperator.S_AUTHOR
                            // 当前操作员权限存入缓存
                            localStorage.setItem('author', author)
                            // 获取缓存中的isKeyboard,判断是电脑还是移动环境
                            const isPc = localStorage.getItem('isKeyboard')
                            // 若权限为2且电脑环境，跳至生产工单页面
                            if(author === '0' || (isPc==='true' && author === '2')){
                                this.$router.push('/home/work_order')
                            }else if(author === '3') { //权限为3，品检审核页面
                                this.$router.push('/home/audit')
                            }else{
                                this.$router.push('/home/work_order2')
                            }
                            // 加了keep-alive,返回此页面需要密码清空
                            this.form.password = ''
                        }else{
                            this.$message.error('密码错误！请重新输入')
                        }
                    }).catch(err => err)
                }
            })
        },
        // 重置
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
        handleSaoma(item) {
            this.$router.push('/device?name='+item)
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
<style>
    .login{
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        background: url(../assets/bg.jpg) no-repeat center center;
        background-size: 100% 100%;
    }
    .loginWrap{
        width: 40%;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -60%);
    }
    .loginHeader{
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 1rem;
        color:  #0766a1;;
    }
    .loginHeader img{
        width: 100px;
    }
    .form-login{
        background: rgba(0, 0, 0, .3);
        padding: 15px 30px;
        border-radius: 15px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.2);
    }
    .form-title{
        color: #fff;
        text-align: center;
    }
    .el-select{
        width: 100%;
    }
    .btn_wrap .el-button{
        width: 100%;
    }
    .changeEquip{
        position: absolute;
        right: 0;
        bottom: -20px;
        padding: 2px 5px;
    }
    .vue-touch-keyboard{
        width: 100%;
        position: fixed;
        left: 0;
        bottom: 0;
    }
    .iconTitle{
        margin-left: 2px;
        font-size: 20px;
        font-weight: 700;
        color:rgb(38, 181, 238);
    }
    .clearMargin{
        margin: 5px 0;
    }
    .saoma{
        position: absolute;
        right: 5px;
        top: 6px;
    }
</style>