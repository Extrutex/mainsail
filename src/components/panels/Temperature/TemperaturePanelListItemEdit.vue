<template>
    <v-dialog v-model="showDialog" persistent :width="400">
        <panel :title="formatName" :icon="icon" card-class="temperature-edit-heater-dialog" :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text class="pt-6">
                <temperature-panel-list-item-edit-chart-serie
                    v-for="dataset in chartSeries"
                    :key="dataset"
                    :object-name="objectName"
                    :serie-name="dataset" />
                <temperature-panel-list-item-edit-additional-sensor
                    v-for="additionalSensor in additionalValues"
                    :key="additionalSensor"
                    :object-name="objectName"
                    :additional-sensor="additionalSensor" />
                <v-row>
                    <v-col cols="12" class="text-center pb-0">
                        <v-color-picker
                            hide-mode-switch
                            mode="hexa"
                            :value="color"
                            class="mx-auto"
                            @update:color="setChartColor" />
                    </v-col>
                </v-row>
            </v-card-text>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { debounce } from '@/plugins/helpers'
import BaseMixin from '@/components/mixins/base'
import { mdiCloseThick } from '@mdi/js'
import TemperaturePanelListItemEditChartSerie from '@/components/panels/Temperature/TemperaturePanelListItemEditChartSerie.vue'
import TemperaturePanelListItemEditAdditionalSensor from '@/components/panels/Temperature/TemperaturePanelListItemEditAdditionalSensor.vue'

export default defineComponent({
    name: 'TemperaturePanelListItemEdit',
    components: { TemperaturePanelListItemEditAdditionalSensor, TemperaturePanelListItemEditChartSerie },
    mixins: [BaseMixin],
    props: {
        modelValue: { type: Boolean },
        objectName: { type: String, required: true },
        name: { type: String, required: true },
        additionalSensorName: { type: String, required: true },
        formatName: { type: String, required: true },
        icon: { type: String, required: true },
        color: { type: String, required: true },
    },
    emits: ['update:modelValue'],
    data() {
        return {
            mdiCloseThick: mdiCloseThick,
        }
    },
    computed: {
        showDialog: {
            get(): boolean {
                return this.modelValue
            },
            set(value: boolean) {
                this.$emit('update:modelValue', value)
            },
        },
        chartSeries() {
            return this.$store.getters['printer/tempHistory/getSerieNames'](this.objectName) ?? []
        },
        printerObjectAdditionalSensor() {
            if (this.additionalSensorName === null || !(this.additionalSensorName in this.$store.state.printer))
                return {}

            return this.$store.state.printer[this.additionalSensorName]
        },
        additionalValues() {
            if (this.objectName === 'z_thermal_adjust') return ['current_z_adjust']
            if (this.objectName.startsWith('nevermore')) return ['temperature', 'pressure', 'humidity', 'rpm']

            return Object.keys(this.printerObjectAdditionalSensor).filter((key) => key !== 'temperature')
        },
    },
    methods: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setChartColor: debounce(function (this: any, value: string | { hex: string }) {
            if (typeof value === 'object' && 'hex' in value) value = value.hex

            this.$store.dispatch('gui/setChartColor', {
                objectName: this.objectName,
                value,
            })

            this.$store.dispatch('printer/tempHistory/setColor', { name: this.objectName, value })
        }, 500),
        closeDialog() {
            this.showDialog = false
        },
    },
})
</script>
