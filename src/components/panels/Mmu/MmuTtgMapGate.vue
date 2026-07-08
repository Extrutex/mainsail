<template>
    <text :x="gateX" :y="positionY" text-anchor="end" :fill="fill" font-size="10px" :font-weight="fontWeight">
        {{ name }}
    </text>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, { GATE_UNKNOWN, MmuTtgMap_START_Y, MmuTtgMap_VERTICAL_SPACING } from '@/components/mixins/mmu'

export default defineComponent({
    name: 'MmuTtgMapGate',
    mixins: [BaseMixin, MmuMixin],
    props: {
        gate: { type: Number, required: true },
        gateX: { type: Number, required: true },
        selectedGate: { type: Number, default: GATE_UNKNOWN },
    },
    computed: {
        name() {
            return `#${this.gate}`
        },

        positionY() {
            return this.gate * MmuTtgMap_VERTICAL_SPACING + MmuTtgMap_START_Y + 8
        },

        fill() {
            return this.gate === this.selectedGate ? 'var(--v-primary-lighten1, #2CA9BC)' : 'currentColor'
        },

        fontWeight() {
            return this.gate === this.selectedGate ? 'bold' : 'inherit'
        },
    },
})
</script>
