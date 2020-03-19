import axios from 'axios'
import { Loading, Message } from 'element-ui'

const loading = {
    loadingInstance: null,
    open() {
        this.loadingInstance = Loading.service({
            target: '.main',
            text: '拼命加载中...',
            background: 'rgba(255, 255, 255, 0.5)'
        })
    }, 
    close() {
        this.loadingInstance.close()
    }
}

const request = axios.create({
    baseURL: 'http://192.168.1.26:8083/aps/',
    timeout: 5000
})

request.interceptors.request.use(config => {
    loading.open()
    return config
}, error => {
    loading.close()
    return Promise.reject(error)
})

request.interceptors.response.use(response => {
    loading.close()
    const resp = response.data
    if (resp.code !== 2000) {
        Message({
            message: resp.message,
            type: 'warning',
            duration: 5000
        })
    }
    return response
}, error => {
    loading.close()
    Message({
        message: error,
        type: 'warning',
        duration: 5000
    })
    return Promise.reject(error)
})

export default request