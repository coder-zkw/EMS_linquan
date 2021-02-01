<template>
    <div class="worktime">
        <div class="timeSelect">
            白班开始时间：
            <el-time-picker
            v-model="daytimestart"
            format='HH:mm'
            value-format='HH:mm'
            placeholder="任意时间点">
            </el-time-picker>
            白班结束时间：
            <el-time-picker
            v-model="daytimeend"
            format='HH:mm'
            value-format='HH:mm'
            placeholder="任意时间点">
            </el-time-picker>
        </div>
        <div class="timeSelect">
            夜班开始时间：
            <el-time-picker
            v-model="nighttimestart"
            format='HH:mm'
            value-format='HH:mm'
            placeholder="任意时间点">
            </el-time-picker>
            夜班结束时间：
            <el-time-picker
            v-model="nighttimeend"
            format='HH:mm'
            value-format='HH:mm'
            placeholder="任意时间点">
            </el-time-picker>
        </div>
        <div class="btnwrap">
            <el-button type="success" @click="submitWorkTimes">确定</el-button>
        </div>
    </div>
</template>
<script>
import axios from 'axios'

export default {
    data() {
        return {
            daytimestart: null,
            daytimeend: null,
            nighttimestart: null,
            nighttimeend: null
        }
    },
    created() {
        this.getWorkTimes();
    },
    methods: {
        getWorkTimes() {
            axios.get(this.httpUrl + 'MES/GetTimeClasses')
            .then(res => {
                // console.log(res)
                if(res.status === 200) {
                    const { BC_DAY_START, BC_DAY_END, BC_NIGHT_START, BC_NIGHT_END } = res.data[0]
                    this.daytimestart = BC_DAY_START
                    this.daytimeend = BC_DAY_END
                    this.nighttimestart = BC_NIGHT_START
                    this.nighttimeend = BC_NIGHT_END
                }else{
                    this.$message.error('获取白夜班时间失败！')
                }
            }).catch(err => err)
        },
        submitWorkTimes() {
            if(this.daytimestart === null || this.daytimeend === null || this.nighttimestart === null || this.nighttimeend === null){
                return this.$message.warning('请选择白夜班时间')
            }
            if(this.daytimeend > this.nighttimestart) {
                return this.$message.warning('夜班开始时间不能早于白班结束时间')
            }
            // console.log(this.daytime, this.nighttime)
            axios.post(this.httpUrl + 'MES/TimeClasses', {
                BC_DAY_START: this.daytimestart,
                BC_DAY_END: this.daytimeend,
                BC_NIGHT_START: this.nighttimestart,
                BC_NIGHT_END: this.nighttimeend
            })
            .then(res => {
                // console.log(res)
                if(res.data.code === 200 && res.data.value === 'Record Success!'){
                    this.$message.success('白夜班时间设置成功！')
                }else{
                    this.$message.error('白夜班时间设置失败！')
                }
            }).catch(err => err)
        }
    },
}
</script>
<style scoped>
.timeSelect{
    margin: 18px 0;
}
.btnwrap{
    text-align: center;
}
</style>