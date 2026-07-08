<template>
    <div class="d-flex w-100 flex-row align-center">
        <v-icon size="small" start>{{ unitToSymbol(unit) }}</v-icon>
        <span class="flex-grow-1">{{ name }}:</span>
        <span>{{ output }}</span>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { convertName, unitToSymbol } from '@/plugins/helpers'
import BaseMixin from '@/components/mixins/base'

export default defineComponent({
    name: 'MoonrakerSensorValue',
    mixins: [BaseMixin],
    props: {
        sensor: { type: String, required: true },
        valueName: { type: String, required: true },
    },
    data() {
        return {
            convertName: convertName,
            unitToSymbol: unitToSymbol,
        }
    },
    computed: {
        sensorData() {
            const sensors = this.$store.state.server.sensor.sensors
            if (!(this.sensor in sensors)) return {}

            return sensors[this.sensor].values
        },
        sensorConfig() {
            const name = `sensor ${this.sensor}`
            const serverConfig = this.$store.state.server.config?.config ?? {}
            if (!(name in serverConfig)) return {}

            return serverConfig[name]
        },
        parameterConfig() {
            const name = `parameter_${this.valueName}`
            if (!(name in this.sensorConfig)) return {}

            return this.sensorConfig[name]
        },
        unit() {
            if (!('units' in this.parameterConfig)) return null

            return this.parameterConfig.units
        },
        value() {
            if (!(this.valueName in this.sensorData)) return '--'

            return Math.round(this.sensorData[this.valueName] * 1000) / 1000
        },
        output() {
            if (this.unit === null) return this.value

            return `${this.value} ${this.unit}`
        },
        name() {
            return this.convertName(this.valueName)
        },
    },
})
</script>
