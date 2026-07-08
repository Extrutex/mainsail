<template>
    <v-row>
        <v-col v-for="(printer, key) in printers" :key="key" cols="12" sm="6" md="4" class="pb-0">
            <farm-printer-panel :printer="printer"></farm-printer-panel>
        </v-col>
    </v-row>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import FarmPrinterPanel from '@/components/panels/FarmPrinterPanel.vue'

export default defineComponent({
    name: 'PageFarm',
    components: { FarmPrinterPanel },
    mixins: [BaseMixin],
    computed: {
        printers() {
            return this.$store.getters['farm/getPrinters']
        },
    },
})
</script>
<style scoped></style>
