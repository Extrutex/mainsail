<template>
    <v-row>
        <v-col class="py-1">
            <v-checkbox v-model="value" :label="label" hide-details class="mt-0" />
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { capitalize } from '@/plugins/helpers'

export default defineComponent({
    name: 'TemperaturePanelListItemEditChartSerie',
    mixins: [BaseMixin],
    props: {
        objectName: { type: String, required: true },
        serieName: { type: String, required: true },
    },
    computed: {
        value: {
            get() {
                return this.$store.getters['gui/getDatasetValue']({ name: this.objectName, type: this.serieName })
            },
            setvalue(newVal) {
                this.$store.dispatch('gui/setChartDatasetStatus', {
                    objectName: this.objectName,
                    dataset: this.serieName,
                    value: newVal,
                })
            },
        },
        label() {
            return this.$t('Panels.TemperaturePanel.ShowNameInChart', {
                name: this.formatSerieName,
            })
        },
        formatSerieName() {
            return capitalize(this.serieName)
        },
    },
})
</script>
