<template>
    <v-table>
        <tbody>
            <history-all-print-status-table-item
                v-for="status in printStatusArrayChart"
                :key="status.name"
                :item="status"
                :value-name="valueName" />
        </tbody>
    </v-table>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import HistoryStatsMixin from '@/components/mixins/historyStats'
import HistoryAllPrintStatusTableItem from '@/components/charts/HistoryAllPrintStatusTableItem.vue'
import { HistoryStatsValueNames } from '@/store/server/history/types'

export default defineComponent({
    name: 'HistoryAllPrintStatusTable',
    components: { HistoryAllPrintStatusTableItem },
    mixins: [BaseMixin, HistoryStatsMixin],
    props: {
        valueName: { type: String, default: 'amount' },
    },
})
</script>
