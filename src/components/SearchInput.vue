<template>
    <div class="search">
        <el-input
            size="small"
            ref="inputRef"
            placeholder="工单号匹配"
            prefix-icon="el-icon-document-checked"
            v-model="workVal"
            clearable
            @input="workSearch">
            <el-button 
                v-if="isKeyboard==='true'"
                slot="suffix" 
                size="mini" 
                type="primary" 
                circle 
                class="el-icon-c-scale-to-original"
                @click="show"
                data-layout="normal">
            </el-button>
        </el-input>
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
export default {
    data() {
        return {
            workVal: '',
            isKeyboard: localStorage.getItem('isKeyboard'),
            visible: false,
            layout: "normal",
            input: null,
            options: {
                useKbEvents: false,
                preventClickEvent: false
            }
        }
    },
    methods: {
        workSearch() {
            // console.log(this.workVal)
            const value = this.workVal.trim().toUpperCase();
            this.$emit('workSearch', value)
        },
        show(e) {
            this.input = this.$refs.inputRef.$refs.input
            // this.layout = e.target.dataset.layout
            // if (!this.visible)
            //     this.visible = true
            this.visible = !this.visible //改为显示隐藏切换
        },
        accept(text) {
            //   console.log(text);    
            this.hide();
        },
        hide() {
            this.visible = false;
        }
    }
}
</script>
<style scoped>
.search{
    display: inline;
}
.search .el-button{
    position: relative;
    left: 0;
    bottom: -2px;
}
.el-date-editor, .el-input--prefix{
    width: 140px;
    margin-right: 10px;
}
.keyboard{
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 1000;
}
</style>