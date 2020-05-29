<template>
    <div id="main">
        
    </div>
</template>
<script>
import echarts from 'echarts'
import option from './gantt'

export default {
    data() {
        return {
            
        }
    },
    mounted() {
        this.drawGantt()
    },
    methods: {
        drawGantt() {
            var myChart = echarts.init(document.getElementById('main'))
            myChart.clear()
            // console.log(option)
            myChart.setOption(option)
        }
    }
}
</script>
<style scoped>
#main{
    width: 800px;
    height: 500px;
}
</style>
