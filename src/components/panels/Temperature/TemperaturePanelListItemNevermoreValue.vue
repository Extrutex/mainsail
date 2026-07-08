<template>
    <div v-if="isVisible">
        <v-tooltip top :disabled="disableTooltip">
            <template #activator="{ props }">
                <span :style="cssStyle" v-bind="props">{{ formatValue }}</span>
            </template>
            <span>
                {{ $t('Panels.TemperaturePanel.Max') }}: {{ formatValue_max }}
                <br />
                {{ $t('Panels.TemperaturePanel.Min') }}: {{ formatValue_min }}
            </span>
        </v-tooltip>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'

export default defineComponent({
    name: 'TemperaturePanelListItemNevermoreValue',
    mixins: [BaseMixin],
    props: {
        printerObject: { type: Object, required: true },
        objectName: { type: String, required: true },
        keyName: { type: String, required: true },
        small: { type: Boolean, required: false, default: true },
    },
    computed: {
        cssStyle() {
            const style = { cursor: 'default', fontSize: '1em' }
            if (this.small) style.fontSize = '0.8em'

            return style
        },
        value() {
            const value = this.printerObject[this.keyName] ?? null
            if (isNaN(value)) return null

            return value
        },
        intake_value(): number | null {
            const name = `intake_${this.keyName}`

            return this.printerObject[name] ?? null
        },
        intake_value_min(): number | null {
            const name = `intake_${this.keyName}_min`

            return this.printerObject[name] ?? null
        },
        intake_value_max(): number | null {
            const name = `intake_${this.keyName}_max`

            return this.printerObject[name] ?? null
        },
        exhaust_value(): number | null {
            const name = `exhaust_${this.keyName}`

            return this.printerObject[name] ?? null
        },
        exhaust_value_min(): number | null {
            const name = `exhaust_${this.keyName}_min`

            return this.printerObject[name] ?? null
        },
        exhaust_value_max(): number | null {
            const name = `exhaust_${this.keyName}_max`

            return this.printerObject[name] ?? null
        },
        unit(): string | null {
            switch (this.keyName) {
                case 'temperature':
                    return '°C'
                case 'pressure':
                    return 'hPa'
                case 'humidity':
                    return '%'
            }

            return null
        },
        digits() {
            return ['gas', 'pressure'].includes(this.keyName) ? 0 : 1
        },
        formatValue() {
            return this.getFormatedValue(this.intake_value, this.exhaust_value)
        },
        formatValue_min() {
            return this.getFormatedValue(this.intake_value_min, this.exhaust_value_min)
        },
        formatValue_max() {
            return this.getFormatedValue(this.intake_value_max, this.exhaust_value_max)
        },
        disableTooltip() {
            return (
                this.intake_value_min === null ||
                this.exhaust_value_min === null ||
                this.intake_value_max === null ||
                this.exhaust_value_max === null
            )
        },
        guiSetting() {
            return this.$store.getters['gui/getDatasetAdditionalSensorValue']({
                name: this.objectName,
                sensor: this.keyName,
            })
        },
        isVisible() {
            if (this.intake_value === null && this.exhaust_value === null) return false

            return this.guiSetting
        },
    },
    methods: {
        getFormatedValue(intake: number | null, exhaust: number | null): string {
            let intake_value = intake?.toFixed(this.digits)
            let exhaust_value = exhaust?.toFixed(this.digits)
            if (this.intake_value === null) intake_value = '--'
            if (this.exhaust_value === null) exhaust_value = '--'

            // return only the value, if unit is null
            if (this.unit === null) return `${intake_value} > ${exhaust_value}`

            return `${intake_value} ${this.unit} > ${exhaust_value} ${this.unit}`
        },
    },
})
</script>
