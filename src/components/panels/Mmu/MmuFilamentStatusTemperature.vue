<template>
    <text x="228" y="412" font-size="11px" font-weight="bold" text-anchor="end" :class="temperatureClass">
        {{ temperatureText }}
    </text>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import MmuMixin from '@/components/mixins/mmu'

export default defineComponent({
    name: 'MmuFilamentStatusTemperature',
    mixins: [BaseMixin, MmuMixin],
    computed: {
        temperatureClass() {
            const canExtrude = this.$store.state.printer.extruder?.can_extrude ?? false

            return {
                'text-disabled': !canExtrude,
            }
        },

        temperatureText() {
            const extTemp = this.$store.state.printer.extruder?.temperature ?? null

            return extTemp ? `${extTemp.toFixed(0)}°C` : ''
        },
    },
})
</script>
