<template>
    <g>
        <path :d="path" stroke-width="2" stroke-linecap="round" :class="elementClass" fill="none" />
        <text :x="textPositionX" :y="textPositionY" :class="elementClass" stroke-width="0" font-size="8px">
            {{ groupChar }}
        </text>
    </g>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, {
    MmuTtgMap_GROUP_SPACING,
    MmuTtgMap_START_Y,
    MmuTtgMap_VERTICAL_SPACING,
} from '@/components/mixins/mmu'

export default defineComponent({
    name: 'MmuTtgMapGroup',
    mixins: [BaseMixin, MmuMixin],
    props: {
        groupNumber: { type: Number, required: true },
        group: { type: Array as PropType<number[]>, required: true },
        index: { type: Number, required: true },
        gateX: { type: Number, required: true },
        groupX: { type: Number, required: true },
        currentGroup: { type: Number, default: -1 },
    },
    computed: {
        textPositionX() {
            return this.groupX + this.index * MmuTtgMap_GROUP_SPACING
        },

        textPositionY() {
            return MmuTtgMap_START_Y + this.mmuNumGates * MmuTtgMap_VERTICAL_SPACING + 2
        },

        path() {
            const tick = 5 // length of the horizontal tick
            const y1 = MmuTtgMap_START_Y + 4 // small offset to align with gate lines

            const paths: string[] = []
            let y0: number | null = null

            this.group.forEach((gate) => {
                const y = y1 + gate * MmuTtgMap_VERTICAL_SPACING
                paths.push(`M ${this.textPositionX + tick} ${y} L ${this.textPositionX} ${y}`)
                if (y0 !== null) {
                    paths.push(`M ${this.textPositionX + tick} ${y0} L ${this.textPositionX + tick} ${y}`)
                }
                y0 = y
            })

            return paths.join(' ')
        },

        groupChar() {
            return String.fromCharCode(this.groupNumber + 65)
        },

        elementClass() {
            return this.groupNumber === this.currentGroup ? 'selected' : 'regular'
        },
    },
})
</script>

<style scoped>
.regular {
    stroke: var(--v-secondary-lighten2, #808080);
    fill: var(--v-secondary-lighten2, #808080);
    font-weight: normal;
}
.selected {
    stroke: var(--v-primary-lighten1, #2ca9bc);
    fill: var(--v-primary-lighten1, #2ca9bc);
    font-weight: bold;
}
</style>
