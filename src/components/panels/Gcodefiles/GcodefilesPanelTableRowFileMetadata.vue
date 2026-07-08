<template>
    <td :class="tdClass">{{ value }}</td>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import GcodefilesMixin from '@/components/mixins/gcodefiles'
import { formatFilesize, formatPrintTime } from '@/plugins/helpers'

export default defineComponent({
    name: 'GcodefilesPanelTableRowFileMetadata',
    mixins: [BaseMixin, GcodefilesMixin],
    props: {
        item: { type: Object, required: true },
        col: { type: Object, required: true },
    },
    computed: {
        tdClass() {
            return this.col.outputType !== 'date' ? 'text-no-wrap' : ''
        },
        value() {
            const value = this.col.value in this.item ? this.item[this.col.value] : null

            if (value === null) return '--'

            switch (this.col.outputType) {
                case 'filesize':
                    return formatFilesize(value)

                case 'date':
                    return this.formatDateTime(value)

                case 'time':
                    return formatPrintTime(value)

                case 'temp':
                    return value.toFixed() + ' °C'

                case 'length':
                    if (value > 1000) return (value / 1000).toFixed(2) + ' m'

                    return value.toFixed(2) + ' mm'

                case 'weight':
                    return value.toFixed(2) + ' g'

                default:
                    return value
            }
        },
    },
})
</script>
