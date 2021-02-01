<template>
    <div class="home">
        <!-- <div class="header">
            <div class="company">
                <img src="../assets/logo.png" alt="林全科技">
                <div>林全MES系统</div>
            </div>
            <div class="controlBtn">
                <el-tag type="success">
                    <i class="el-icon-user-solid"></i>
                    {{user}}
                </el-tag>
                <exit-btn :isFullscreen="isfullScreen"></exit-btn>
            </div>
        </div> -->
        <div class="body">
            <router-view v-if="!isKeepAlive"></router-view>
            <keep-alive>
                <router-view v-if="isKeepAlive"></router-view>
            </keep-alive>
        </div>
        <!-- <div class="footer">
            Copyright © 2020 深圳市林全科技有限公司 版权所有
        </div> -->
    </div>
</template>
<script>
// import ExitBtn from './ExitButton'

export default {
    // components: { ExitBtn },
    data() {
        return {
            user: localStorage.getItem('operator'),
            isKeepAlive: this.$route.path === '/home/examine',
            isFull: false,
            isfullScreen: false
        }
    },
    mounted() {
        // console.log(this.$route)
        window.onresize = () => {
            this.$nextTick(() => {
                // 监听是否全屏切换
                this.isFull = document.fullscreenElement || 
                document.msFullscreenElement || 
                document.mozFullScreenElement ||
                document.webkitFullscreenElement || false
            })
        }
    },
    watch: {
        // 监听是否全屏，val为false时，当前不是全屏，点击后显示全屏按钮为true。否则为false变为非全屏按钮
        isFull(val) {
            if(val === false) {
                this.isfullScreen = false
            }else{
                this.isfullScreen = true
            }
        }
    }
}
</script>
<style scoped>
.header{
    width: 100%;
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    background: lightblue;
    z-index: 100;
}
.company{
    flex: 1;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-left: 10px;
    font-size: 20px;
}
.controlBtn{
    display: flex;
    align-items: center;
    margin-right: 8px;
}
.controlBtn .el-tag{
    margin-right: 10px;
    font-size: 20px;
}
.company img{
    width: 50px;
}
/* .body{
    padding-top: 46px;
} */
.footer{
    width: 100%;
    padding: 5px;
    text-align: center;
    font-size: 70%;
    color: gray;
    background: lightblue;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 100;
}
</style>
