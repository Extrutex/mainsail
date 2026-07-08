<template>
    <text :x="positionX" :y="positionY" text-anchor="end" :fill="fill" font-size="10px" :font-weight="fontWeight">
        {{ name }}
    </text>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, {
    MmuTtgMap_START_X,
    MmuTtgMap_START_Y,
    MmuTtgMap_VERTICAL_SPACING,
    TOOL_GATE_UNKNOWN,
} from '@/components/mixins/mmu'

export default defineComponent({
    name: 'MmuTtgMapTool',
    mixins: [BaseMixin, MmuMixin],
    props: {
        tool: { type: Number, required: true },
        selectedTool: { type: Number, default: TOOL_GATE_UNKNOWN },
    },
    computed: {
        name() {
            return `T${this.tool}`
        },

        positionX() {
            return MmuTtgMap_START_X + 14
        },

        positionY() {
            return this.tool * MmuTtgMap_VERTICAL_SPACING + MmuTtgMap_START_Y + 8
        },

        fill() {
            return this.tool === this.selectedTool ? 'var(--v-primary-lighten1, #2CA9BC)' : 'currentColor'
        },

        fontWeight() {
            return this.tool === this.selectedTool ? 'bold' : 'inherit'
        },
    },
})
</script>
