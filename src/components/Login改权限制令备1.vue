<template>
    <div class="login">
        <div class="loginWrap">
            <el-form class="form-login" ref="form" :model="form" @submit.native.prevent>
                <div class="loginHeader">
                    <img src="../assets/logo.png" alt="林全科技">
                    <h1>林全<span @dblclick="update">MES</span>系统</h1>
                </div>
                <h2 class="form-title">用 户 登 录</h2>
                <el-form-item prop="jobNum" class="clearMargin">
                    <el-input v-model="form.jobNum" v-focus @keyup.enter.native="scanLogin()" placeholder="请扫码登录">
                        <i slot="prefix" class="iconTitle el-icon-user"></i>
                    </el-input>
                    <el-button 
                        v-if="!isKeyboard"
                        class="saoma"
                        type="primary" 
                        icon="el-icon-mobile-phone"
                        @click="handleSaoma">
                        扫码
                    </el-button>
                </el-form-item>
            </el-form>
        </div>
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
            form: {
                jobNum: ''
            },
            scanShow: false
        }
    },
    created() {
        // 获取设备类型
        this.getOpenType()
    },
    methods: {
        // 扫码登录
        scanLogin() {
            const value = this.form.jobNum.trim()
            if(value === '') {
                this.$message.error('扫描结果为空！')
                return
            }
            
            // 发送扫码结果到后台验证是否通过，并返回工号和姓名
            // axios.get('http://localhost:50814/MES/GetLogin?uid='+value)
            axios.get(this.httpUrl + 'MES/GetLogin?uid='+value)
            .then(res => {
                if(res.data.code === 200) {
                    const result = res.data.data[0]
                    if(result.STATUS === '0') {
                        this.form.jobNum = result.EMP_NAME
                        const author = result.bu_role
                        // 缓存扫码员工姓名
                        localStorage.setItem('operator', result.EMP_NAME)
                        localStorage.setItem('jobNum', result.EMP_NO)
                        // 扫码直接判断是否登录
                        // this.$router.push('/home/command?author='+author)
                        this.$router.push('/home/command')
                    }else{
                        this.$message.error('该用户不存在！')
                    }
                }else{
                    this.$message.error('判断用户是否存在失败！请重试')
                }
            }).catch(err => err)
        },
        handleSaoma() {
            this.scanShow = true
            // 开启扫描框后，触发子组件的开始扫描方法
            this.$nextTick(() => {
                this.$refs.scan.handleScan()
            })
        },
        getScan(value) {
            this.form.jobNum = value
            this.scanLogin()
        },
        closeScan() {
            this.scanShow = false
        },
        update() {
            window.location.href = this.httpUrl+'app/appLinQuan.apk'
        },
        // 判断运行环境
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
                // this.operator = '2'
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
        width: 46%;
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
    .iconTitle{
        margin-left: 1px;
        font-size: 20px;
        font-weight: 700;
        color:rgb(38, 181, 238);
    }
    .clearMargin{
        margin: 50px 0;
    }
    .saoma{
        font-size: 14px;
        position: absolute;
        right: 0;
        top: 0;
    }
</style>