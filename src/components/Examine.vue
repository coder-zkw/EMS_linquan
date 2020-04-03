<template>
    <div class="examine">
        <el-page-header @back="goBack" content="首检表单"></el-page-header>
        <div class="exitBut">
            <exit-btn></exit-btn>
        </div>
        <el-card>
            <el-form ref="form" :model="form" label-width="160px">
                <el-row :gutter="12">
                    <el-col :span="12" >
                        <el-form-item label="当前制令单号：">
                            <el-tag>{{form.workId}}</el-tag>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12" >
                        <el-form-item label="当前产品型号：">
                            <el-tag>{{form.product}}</el-tag>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12" v-for="(item,i) in checkList" :key="i" >
                        <el-form-item :label="item.title" :prop="item.attrs" 
                        :rules="[{ required: true, message: '此项不能为空'}]">
                            <el-input :type="item.attrs === 'pe00010' ? '' : 'number'" v-model="form[item.attrs]"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="检查类型：" prop="type" :rules="[{ required: true, message: '此项不能为空'}]">
                            <el-select v-model="form.type" placeholder="请选择检查类型">
                                <el-option label="首检" value="首检"></el-option>
                                <el-option label="末检" value="末检"></el-option>
                                <el-option label="巡检" value="巡检"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <div class="btnwrap">
                    <el-button type="info" @click="add">新增</el-button>
                </div>
            </el-form>
        </el-card>
    </div>
</template>
<script>
import ExitBtn from './ExitButton'
import getCurrentTime from '../utils/currentTime'
import axios from 'axios'

export default {
    components: { ExitBtn },
    data() {
        return {
            checkList: [
                {title: '线材：', attrs: 'wire'},
                {title: '总长尺寸：', attrs: 'length'},
                {title: '左捻线上锡：', attrs: 'tin'},
                {title: '锡PE00010千住：', attrs: 'pe00010'},
                {title: '沾锡温度：', attrs: 'temperature'},
                {title: '右开口打端:', attrs: 'fight'},
                {title: '端子SFPS-617-250：', attrs: 'SFPS'},
                {title: '导体锡高：', attrs: 'conductor'},
                {title: '绝缘锡高：', attrs: 'insulation'},
                {title: '拉力：', attrs: 'pull'},
                {title: '模具编号：', attrs: 'number'}
            ],
            form: {
                type: '',
                workId: this.$route.query.work,
                product: this.$route.query.product
            }
        }
    },
    methods: {
        goBack() {
            this.$router.go(-1)
        },
        add() {
            // 发送表单信息到后台
            this.form.endTime = getCurrentTime(new Date())
            // console.log(this.form)
            this.$refs.form.validate(valid => {
                if(valid) {
                    axios.post(this.httpUrl +'FirstArticle', this.form)
                    .then((res) => {
                        console.log(res)
                        if(res.data.code === 200) {
                            this.$message.success('首检数据写入成功！')
                        }else{
                            this.$message.error('首检数据写入失败，请重试！')
                        }
                    }).catch(err => err)
                }
            })
        }
    }
}
</script>
<style scoped>
.btnwrap{
    text-align: right;
}
</style>