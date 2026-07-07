<style scoped></style>

<template>
    <div>
        <template v-if="['printing', 'paused', 'error', 'cancelled'].includes(printer_state)">
            <status-panel-printstatus-printing></status-panel-printstatus-printing>
        </template>
        <template v-if="['complete'].includes(printer_state)">
            <status-panel-printstatus-complete></status-panel-printstatus-complete>
        </template>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import StatusPanelPrintstatusPrinting from '@/components/panels/Status/PrintstatusPrinting.vue'
import StatusPanelPrintstatusComplete from '@/components/panels/Status/PrintstatusComplete.vue'

export default defineComponent({
    name: 'StatusPanelPrintstatus',
    components: {
        StatusPanelPrintstatusPrinting,
        StatusPanelPrintstatusComplete,
    },
    mixins: [BaseMixin],
})
</script>
