<template>
    <span class="btngroup">
        <el-button type="info" :icon="isFullscreen ? 'el-icon-full-screen' : 'el-icon-crop'" plain @click="toggleFullscreen"></el-button>
        <el-button type="primary" plain @click="browserClosed">退出</el-button>
    </span>
</template>
<script>
import axios from 'axios'
import screenfull from 'screenfull'

export default {
    data() {
        return {
            // 全屏切换按钮
            isFullscreen: true,
            // 获取是否为全屏状态
            isFull: false
        }
    },
    mounted() {
        // 窗口变化isFull属性重新获值，等待监听改变按钮变化
        window.onresize = () => {
            return (() => {this.isFull = document.fullscreenElement || 
                    document.msFullscreenElement || 
                    document.mozFullScreenElement ||
                    document.webkitFullscreenElement || false
            })()
        }
    },
    methods: {
        browserClosed() {
            const userName = localStorage.getItem('userName')
            // let formdata = new FormData()
            // formdata.append('machineName', userName)
            this.$confirm('是否确认关闭浏览器？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let formdata = new FormData()
                formdata.append('machineName', userName)
                // 调用后台接口关闭浏览器
                axios.post(this.killBrowserUrl + 'server/killClientBrowser', formdata)
                // axios.get(this.killBrowserUrl + 'server/killClientBrowser?machineName='+userName)
                .then(() => {
                    // 直接关闭浏览器
                }).catch(() => {
                    this.$message.error('浏览器关闭失败，请手动关闭！')
                })
            }).catch(() => {
                this.$message({
                type: 'info',
                message: '已取消退出'
                })       
            })
        },
        toggleFullscreen() {
            screenfull.toggle()
        },
    },
    watch: {
        // 监听是否全屏，val为false时，当前不是全屏，点击后显示全屏按钮为true。否则为false变为非全屏按钮
        isFull(val) {
            if(val === false) {
                this.isFullscreen = true
            }else{
                this.isFullscreen = false
            }
        }
    }
}
</script>