<template>
    <div >
        <div class="btnwrap">
            <el-button type="primary" size="mini" @click="setFilters">自动过滤设置</el-button>
            <el-button type="warning" size="mini" @click="clearFilters">清除过滤器</el-button>
        </div>
        <el-table 
            :data="tableData" 
            border 
            size="mini" 
            height="800" 
            row-key="S_ID" 
            :row-class-name="tableRowClassName"
            v-el-table-infinite-scroll="load">
            <!-- <el-table-column type="index"></el-table-column> -->
            <el-table-column 
                v-for="item in col"   
                :key="item.S_ID" 
                sortable 
                :show-overflow-tooltip="true" 
                :prop="item.S_COLUMN"    
                :label="item.S_DESCRIBE">
            </el-table-column>
        </el-table>
        <!-- 设置筛选条件弹出框 -->
        <el-dialog
            title="自定义自动过滤器"
            class="dialog"
            :visible.sync="dialogFilterVisible"
            width="70%">
            <el-table :data="dropCol" border size="mini">
                <el-table-column label="过滤项" prop="S_DESCRIBE"></el-table-column>
                <el-table-column label="数据类型" prop="S_COLUMN_TYPE"></el-table-column>
                <el-table-column label="条件选择">
                    <template slot-scope="scope">
                        <el-date-picker 
                            v-if="scope.row.S_COLUMN_TYPE==='DATE'" 
                            type="date" 
                            placeholder="选择日期" 
                            size="mini" 
                            format="yyyy/MM/dd"
                            value-format="yyyy/MM/dd"
                            v-model="scope.row.dateFilter">
                        </el-date-picker>
                        <div v-else>
                            <el-input placeholder="请输入一个值" v-model="scope.row.inputVal" size="mini">
                                <el-select v-model="scope.row.selectVal" slot="prepend" placeholder="筛选条件">
                                    <el-option
                                    v-for="item in options"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value">
                                    </el-option>
                                </el-select>
                            </el-input>
                            <!-- <el-select v-model="scope.row.selectVal" size="mini" placeholder="请选择条件">
                                <el-option
                                v-for="item in options"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value">
                                </el-option>
                            </el-select>
                            <el-input v-model="scope.row.inputVal" size="mini" placeholder="请输入一个值"></el-input> -->
                        </div>
                    </template>
                </el-table-column>
            </el-table>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogFilterVisible = false">取 消</el-button>
                <el-button type="primary" @click="filtersSubmit">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
    import Sortable from 'sortablejs'
    import axios from 'axios'
    import elTableInfiniteScroll from 'el-table-infinite-scroll'
    import titles from './title.json'
    import moni from './da.json'
 
    export default {
        data () {
            return {
                userName: localStorage.getItem('userName'),
                // 获取列项
                col:[],
                // 保存排序后的列项
                dropCol:[],
                // 获取的所有数据
                datas: [],
                // 渲染列表数据
                tableData: [],
                // 保留数据，清空筛选条件后，用于渲染原始数据
                keepData: [],
                dialogFilterVisible: false,
                options: [
                    {
                        value: '===',
                        label: '等于='
                    }, 
                    {
                        value: '!=',
                        label: '不等于<>'
                    }, 
                    {
                        value: '()',
                        label: '包含'
                    }, 
                    {
                        value: '!()',
                        label: '不包含'
                    }, 
                    {
                        value: '>',
                        label: '大于>'
                    }, 
                    {
                        value: '>=',
                        label: '大于>='
                    }, 
                    {
                        value: '<',
                        label: '小于<'
                    }, 
                    {
                        value: '<=',
                        label: '小于<='
                    }
                ],
                filters: [],
                count: 100
            }
        },
        created() {
            this.getDatas()
        },
        mounted () {
            this.rowDrop()
            
            this.columnDrop()
        },
        methods: {
            getDatas() {
                // axios.get(this.httpUrl + 'MES/GetPReportQuery')
                // .then((res) => {
                //     // console.log(res)
                //     if(res.data.code === 200) {
                //         this.da = res.data.data
                //         for(var i = 0; i< 1003; i++){
                //             this.datas.push(this.da[i])
                //         }
                //         console.log(this.datas.length)
                //         for(var i = 0; i< this.count; i++){
                //             this.tableData.push(this.datas[i])
                //         }
                //         // console.log(this.tableData.length)
                //         // this.keepData = this.tableData
                //     }
                // })
                // .catch(err => err)

                this.col = titles.data
                this.dropCol = this.col

                this.da = moni.data
                this.keepData = this.da
                    for(var i = 0; i< 2003; i++){
                        this.datas.push(this.da[i])
                    }
                    // console.log(this.datas.length)
                    for(var i = 0; i< this.count; i++){
                        this.tableData.push(this.datas[i])
                    }

                // axios.get(this.httpUrl + 'MES/GetRpPattern?rpname=PReportQuery&user=0')
                // .then((res) => {
                //     // console.log(res)
                //     if(res.data.code === 200){
                //         this.col = res.data.data
                //         this.dropCol = this.col
                //     }
                // })
            },
            // 行拖拽
            rowDrop () {
                // 此时找到的元素是要拖拽元素的父容器
                const tbody = document.querySelector('.el-table__body-wrapper tbody')
                const _this = this
                Sortable.create(tbody, {
                //  指定父元素下可被拖拽的子元素
                draggable: ".el-table__row",
                    onEnd ({ newIndex, oldIndex }) {
                        const currRow = _this.tableData.splice(oldIndex, 1)[0]
                        _this.tableData.splice(newIndex, 0, currRow)
                    }
                })
            },
            // 列拖拽
            columnDrop () {
                const wrapperTr = document.querySelector('.el-table__header-wrapper tr')
                this.sortable = Sortable.create(wrapperTr, {
                    animation: 180,
                    delay: 0,
                    onEnd: evt => {
                        // console.log(evt)
                        // 截取一条数据保存
                        const oldItem = this.dropCol[evt.oldIndex]
                        this.dropCol.splice(evt.oldIndex, 1)
                        // 把截取的数据插到新数据之前
                        this.dropCol.splice(evt.newIndex, 0, oldItem)
                        // console.log(this.dropCol)
                        // this.col = this.dropCol  ***此种写法无效
                        // 可能是顺序改变，虚拟dom检测不到，把原数据清空，再重新赋值排序后的数据有效
                        var newArray = this.dropCol
                        this.col = []
                        this.$nextTick(() => {
                            this.col = newArray
                        })
                    }
                })
            },
            clearFilters() {
                // this.tableData = this.keepData
                // 清空数据，再从新加载数据
                this.datas = []
                this.getDatas()
            },
            setFilters() {
                this.dialogFilterVisible=true
                // console.log(this.col)
                // this.filters = this.col
            },
            filtersSubmit() {
                // console.log(this.dropCol)
                let tempDate = this.tableData
                // console.log(tempDate)
                const filterArr = this.dropCol
                // console.log(filterArr)
                for(let i = 0; i < filterArr.length; i++) {
                    const dateVal = filterArr[i].dateFilter
                    const selectVal = filterArr[i].selectVal
                    const inputVal = filterArr[i].inputVal
                    const type = filterArr[i].S_COLUMN
                    // console.log(type)
                    if(dateVal) {
                        // console.log(filterArr[i].dateFilter)
                        tempDate = tempDate.filter(item => item.AW_PLAN_DATE === dateVal)
                        // console.log(this.tableData)
                    }else if(selectVal) {
                        switch(selectVal) {
                            case '===': tempDate = tempDate.filter(item => item[type] == inputVal)
                            break;
                            case '!=': tempDate = tempDate.filter(item => item[type] != inputVal)
                            break;
                            case '()': tempDate = tempDate.filter(item => item[type].indexOf(inputVal) != -1)
                            break;
                            case '!()': tempDate = tempDate.filter(item => item[type].indexOf(inputVal) === -1)
                            break;
                            case '>': tempDate = tempDate.filter(item => item[type] > inputVal)
                            break;
                            case '>=': tempDate = tempDate.filter(item => item[type] >= inputVal)
                            break;
                            case '<': tempDate = tempDate.filter(item => item[type] < inputVal)
                            break;
                            case '<=': tempDate = tempDate.filter(item => item[type] <= inputVal)
                            break;
                        }
                        // this.tableData = tempDate
                    }
                    this.tableData = tempDate
                }

                this.dialogFilterVisible = false
            },
            load() {
                // 当渲染列表数据数达到了全部数据数，退出函数
                if(this.tableData.length >= this.datas.length) {
                    return
                }
                // 列表有数据时执行加载，因为页面初始化渲染时会执行两次，还未弄明白为什么，加上这个解决
                if(this.tableData.length > 0) {
                    // console.log(this.count)
                    // 数据每次下拉增加渲染100条
                    this.count += 100
                    this.$message.success('加载下一页')
                    // console.log(this.tableData.length)
                    // 循环渲染新增的100条数据
                    for(let i = this.count-100; i < this.count; i++){
                        // 当循环到全部数据的最后一条时，提示没有数据了，并退出函数
                        if(i >= this.datas.length) {
                            this.$message.error('没有数据了！')
                            return
                        }
                        this.tableData.push(this.datas[i])
                    }
                }    
            },
            tableRowClassName({row, rowIndex}) {
                if (rowIndex%2 === 1) {
                return 'tag-row'
                }
                return ''
            }
        },
        directives: {
            'el-table-infinite-scroll': elTableInfiniteScroll
        }
    }
</script>
<style scoped>
.btnwrap{
    margin-bottom: 10px;
    text-align: right;
}
/deep/ .el-table--mini td, .el-table--mini th{
    padding: 0;
}
/deep/ .dialog .el-table--mini td, .el-table--mini th{
    padding: 4px 0;
}
.el-select-dropdown__item{
    font-size: 12px;
    height: 24px; 
    line-height: 24px;
}
.el-select{
    width: 110px;
}
/deep/ .tag-row, /deep/ .el-table th{
    background: #efffef;
}
</style>