<template>
    <div class="mmu-unit d-inline-flex flex-column mx-1 rounded-lg mb-3">
        <div class="d-flex flex-wrap pt-3 px-4 position-relative">
            <mmu-unit-gate
                v-for="gateIndex in numGates"
                :key="gateIndex"
                :gate-index="gateIndex - 1 + firstGateNumber"
                :mmu-machine-unit="mmuMachineUnit"
                :show-details="showDetails"
                :show-context-menu="showContextMenu"
                :unhighlight-spools="unhighlightSpools"
                :selected-gate="selectedGate"
                :has-bypass="hasBypass"
                @select-gate="selectGate" />
            <mmu-unit-gate
                v-if="hasBypass"
                :gate-index="TOOL_GATE_BYPASS"
                :mmu-machine-unit="mmuMachineUnit"
                :show-context-menu="false"
                :selected-gate="selectedGate"
                @select-gate="selectGate" />
        </div>
        <mmu-unit-footer class="pt-0 position-relative" :mmu-machine-unit="mmuMachineUnit" :unit-index="unitIndex" />
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, { TOOL_GATE_BYPASS } from '@/components/mixins/mmu'

export default defineComponent({
    name: 'MmuUnit',
    mixins: [BaseMixin, MmuMixin],
    props: {
        selectedGate: { type: Number, required: true },
        unitIndex: { type: Number, required: true },
        showDetails: { type: Boolean, default: false },
        showContextMenu: { type: Boolean, default: false },
        hideBypass: { type: Boolean, default: false },
        unhighlightSpools: { type: Boolean, default: false },
    },
    emits: ['select-gate'],
    data() {
        return {
            TOOL_GATE_BYPASS: TOOL_GATE_BYPASS,
        }
    },
    computed: {
        mmuMachineUnit() {
            return this.getMmuMachineUnit(this.unitIndex)
        },

        numGates() {
            return this.mmuMachineUnit?.num_gates ?? 0
        },

        firstGateNumber() {
            return this.mmuMachineUnit?.first_gate ?? 0
        },

        hasBypass() {
            if (this.hideBypass) return false

            return this.mmuMachineUnit?.has_bypass ?? true
        },
    },
    methods: {
        selectGate(gateIndex: number) {
            this.$emit('select-gate', gateIndex)
        },
    },
})
</script>

<style scoped>
.mmu-unit {
    background: #2c2c2c;
    overflow: hidden;
}

html.theme--light .mmu-unit {
    background: #f0f0f0;
}
</style>
