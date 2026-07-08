<template>
    <div class="d-flex align-center">
        <form @submit.prevent="setTemps">
            <v-text-field
                v-model.number="value"
                suffix="°C"
                type="number"
                density="compact"
                variant="outlined"
                hide-details
                hide-spin-buttons
                class="_temp-input"
                :style="inputStyle"
                @blur="value = target"
                @focus="$event.target.select()" />
        </form>
        <v-menu v-if="presets" location="bottom end" title="Preheat">
            <template #activator="{ props }">
                <v-btn
                    :disabled="['printing', 'paused'].includes(printer_state)"
                    tabindex="-1"
                    size="x-small"
                    variant="plain"
                    v-bind="props"
                    class="pa-0"
                    style="min-width: 24px">
                    <v-icon>{{ mdiMenuDown }}</v-icon>
                </v-btn>
            </template>
            <v-list density="compact" class="py-0">
                <v-list-item
                    v-for="preset of presets"
                    :key="preset.index"
                    link
                    style="min-height: 32px"
                    @click="doSend(`${command} ${attributeName}=${name} TARGET=${preset.value}`)">
                    <div class="_preset">
                        <v-icon v-if="preset.value === 0" else color="primary" size="small" class="_preset-icon">
                            {{ mdiSnowflake }}
                        </v-icon>
                        <v-icon v-else size="small" class="_preset-icon">{{ mdiFire }}</v-icon>
                        <span style="padding-top: 2px">{{ preset.value }}°C</span>
                    </div>
                </v-list-item>
            </v-list>
        </v-menu>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import BaseMixin from '@/components/mixins/base'
import ControlMixin from '@/components/mixins/control'
import { mdiSnowflake, mdiFire, mdiMenuDown } from '@mdi/js'

export default defineComponent({
    name: 'TemperatureInput',
    mixins: [BaseMixin, ControlMixin],
    props: {
        name: { type: String, required: true },
        target: { type: Number, required: true, default: 0 },
        min_temp: { type: Number, required: true },
        max_temp: { type: Number, required: true },
        command: { type: String, required: true },
        attributeName: { type: String, required: true },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        presets: { type: Array as PropType<any[]>, default: () => [] },
        inputDigits: { type: Number, default: 3 },
    },
    data() {
        return {
            mdiSnowflake: mdiSnowflake,
            mdiFire: mdiFire,
            mdiMenuDown: mdiMenuDown,

            value: 0 as number | string,
        }
    },
    computed: {
        inputStyle() {
            const PER_DIGIT = 10
            const WIDTH_C_GRAD = 21
            const PADDING = 20
            const SPACE_FOR_DECIMAL = 10

            const width = this.inputDigits * PER_DIGIT + WIDTH_C_GRAD + PADDING + SPACE_FOR_DECIMAL

            return {
                width: `${width}px`,
            }
        },
    },
    watch: {
        target(newVal: number): void {
            this.value = newVal
        },
    },
    mounted() {
        this.value = this.target
    },
    methods: {
        normalizeValue(raw: number | string | null): number {
            if (typeof raw === 'string') raw = parseFloat(raw)
            if (raw === null || isNaN(raw)) return 0
            return raw
        },

        setTemps(): void {
            const temp = this.normalizeValue(this.value)

            if (temp > this.max_temp) {
                this.value = this.target
                const key = 'Panels.TemperaturePanel.TempTooHigh'
                const msg = this.$t(key, { name: this.name, max: this.max_temp }).toString()
                this.$toast.error(msg)
                return
            }

            if (temp < this.min_temp && temp !== 0) {
                this.value = this.target
                const key = 'Panels.TemperaturePanel.TempTooLow'
                const msg = this.$t(key, { name: this.name, min: this.min_temp }).toString()
                this.$toast.error(msg)
                return
            }

            // don't send a command if the temperature is unchanged
            if (this.target === temp) return

            this.doSend(`${this.command} ${this.attributeName}=${this.name} TARGET=${temp}`)
        },
    },
})
</script>

<style scoped>
._temp-input :deep(.v-input__slot) {
    min-height: 1rem !important;
    padding-left: 8px !important;
    padding-right: 8px !important;
}

._temp-input :deep(.v-text-field__slot input) {
    padding-top: 4px;
    padding-bottom: 4px;
}

._preset {
    font-size: 0.875rem;
}

._preset-icon {
    margin-top: -1px;
    margin-right: 4px;
}
</style>
