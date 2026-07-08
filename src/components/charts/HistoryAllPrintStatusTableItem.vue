<template>
    <tr>
        <td>{{ item.displayName }}</td>
        <td class="text-right">{{ value }}</td>
    </tr>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { HistoryStatsValueNames, ServerHistoryStateAllPrintStatusEntry } from '@/store/server/history/types'
import { formatPrintTime } from '@/plugins/helpers'

export default defineComponent({
    name: 'HistoryAllPrintStatusTableItem',
    components: {},
    mixins: [BaseMixin],
    props: {
        item: { type: Object },
        valueName: { type: String, default: 'amount' },
    },
    computed: {
        value() {
            if (this.valueName === 'filament') {
                if (this.item.value > 1000) return Math.round(this.item.value / 1000).toFixed(2) + ' m'

                return this.item.value.toFixed(0) + ' mm'
            }

            if (this.valueName === 'time') {
                return formatPrintTime(this.item.value, false)
            }

            return this.item.value.toString()
        },
    },
})
</script>
