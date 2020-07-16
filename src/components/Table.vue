<template>
  <div>
    <DxDataGrid
      id="gridContainer"
      :ref="dataGridRefName"
      :data-source="orders"
      :show-borders="true"
      :allow-column-reordering="true"
      :allow-column-resizing="true"
      :column-auto-width="true"
    >
      <DxFilterRow
        :visible="showFilterRow"
        :apply-filter="currentFilter"
      />
      <DxHeaderFilter
        :visible="showHeaderFilter"
      />
      <DxSearchPanel
        :visible="true"
        :width="240"
        placeholder="搜索"
      />
      <DxPaging :page-size="30"/>
      <!-- <DxScrolling mode="infinite"/> -->
      <!-- <DxColumn
        :header-filter="{ groupInterval: 10000 }"
        data-field="SW_STATUS"
        caption="工单类别"
      />
      <DxColumn
        :calculate-filter-expression="calculateFilterExpression"
        :header-filter="{ dataSource: orderHeaderFilter }"
        data-field="AW_PLAN_DATE"
        caption="计划日期"
        alignment="right"
        data-type="date"
        format="yyyy/M/d"
      />
      <DxColumn
        data-field="PW_OK"
        caption="已完工量"
        alignment="right"
      />
      <DxColumn
        :header-filter="{ dataSource: saleAmountHeaderFilter }"
        :editor-options="{ format: 'currency', showClearButton: true }"
        data-field="PW_MACHINE"
        caption="机台"
        alignment="right"
        format="currency"
      />
      <DxColumn
        :header-filter="{ allowSearch: true }"
        data-field="PW_WORKER"
        caption="工单"
      /> -->
      <DxColumn 
        v-for="item in titles" 
        :key="item.S_ID" 
        alignment="left"
        :data-field="item.S_COLUMN" 
        :caption="item.S_DESCRIBE"
        :data-type="item.S_COLUMN_TYPE === 'DATE'? 'date' : ''"/>
    </DxDataGrid>
    <div class="options">
      <div class="caption">Options</div>
      <div class="option">
        <span>Apply Filter</span>
        <DxSelectBox
          id="useFilterApplyButton"
          :items="applyFilterTypes"
          :value.sync="currentFilter"
          :disabled="!showFilterRow"
          value-expr="key"
          display-expr="name"
        />
      </div>
      <div class="option">
        <DxCheckBox
          :value.sync="showFilterRow"
          text="Filter Row"
          @valueChanged="clearFilter()"
        />
      </div>
      <div class="option">
        <DxCheckBox
          :value.sync="showHeaderFilter"
          text="Header Filter"
          @valueChanged="clearFilter()"
        />
      </div>
    </div>
  </div>
</template>
<script>
import {
  DxDataGrid,
  DxColumn,
  DxHeaderFilter,
  DxSearchPanel,
  DxFilterRow,
  DxPaging
} from 'devextreme-vue/data-grid'
import { DxSelectBox, DxCheckBox } from 'devextreme-vue'
// 汉化
import zhMessages from 'devextreme/localization/messages/zh.json'
import { locale, loadMessages } from 'devextreme/localization'

import 'devextreme/dist/css/dx.common.css'
import 'devextreme/dist/css/dx.light.css'
// import service from './data.js'
import service from './da.json'
import title from './title.json'
const getOrderDay = (rowData) => {
  return (new Date(rowData.OrderDate)).getDay()
}

export default {
  components: {
    DxSelectBox,
    DxCheckBox,
    DxDataGrid,
    DxColumn,
    DxHeaderFilter,
    DxSearchPanel,
    DxFilterRow,
    DxPaging
  },
  data() {
    const applyFilterTypes = [
        {
          key: 'auto',
          name: 'Immediately'
        },
        {
          key: 'onClick',
          name: 'On Button Click'
        }], currentFilter = applyFilterTypes[0].key;
    return {
    //   orders: service.getOrders(),
      titles: title.data,
      orders: service.data,
      showFilterRow: true,
      showHeaderFilter: true,
      applyFilterTypes,
      saleAmountHeaderFilter:  [{
        text: 'Less than $3000',
        value: ['SaleAmount', '<', 3000]
      }, {
        text: '$3000 - $5000',
        value: [
          ['SaleAmount', '>=', 3000],
          ['SaleAmount', '<', 5000]
        ]
      }, {
        text: '$5000 - $10000',
        value: [
          ['SaleAmount', '>=', 5000],
          ['SaleAmount', '<', 10000]
        ]
      }, {
        text: '$10000 - $20000',
        value: [
          ['SaleAmount', '>=', 10000],
          ['SaleAmount', '<', 20000]
        ]
      }, {
        text: 'Greater than $20000',
        value: ['SaleAmount', '>=', 20000]
      }],
      calculateFilterExpression(value, selectedFilterOperations, target) {
        let column = this;
        if(target === 'headerFilter' && value === 'weekends') {
          return [[getOrderDay, '=', 0], 'or', [getOrderDay, '=', 6]];
        }
        return column.defaultCalculateFilterExpression.apply(this, arguments);
      },
      currentFilter,
      dataGridRefName: 'dataGrid'
    };
  },
  created() {
    loadMessages(zhMessages)
    locale(navigator.language)
  },
  methods: {
    orderHeaderFilter(data) {
      data.dataSource.postProcess = (results) => {
        results.push({
          text: 'Weekends',
          value: 'weekends'
        });
        return results;
      };
    },
    clearFilter() {
      this.$refs[this.dataGridRefName].instance.clearFilter();
    }
  }
};
</script>
<style scoped>
#gridContainer {
  height: 640px;
}

.options {
  padding: 20px;
  margin-top: 20px;
  background-color: rgba(191, 191, 191, 0.15);
}

.caption {
  font-size: 18px;
  font-weight: 500;
}

.option {
  margin-top: 10px;
}

.option > span {
  margin-right: 10px;
}

.option > .dx-selectbox {
  display: inline-block;
  vertical-align: middle;
}
</style>
