<template>
    <v-list-item :lines="lines" :class="listItemClass">
        <div class="my-0">
            <div class="text-overline reduced-line-height" :class="toplineClass">{{ title }}</div>
            <v-list-item-title :class="titleClass">
                {{ name }}
            </v-list-item-title>
            <v-list-item-subtitle class="d-flex justify-space-between w-100" :class="subtitleClass">
                {{ subtitle }}
            </v-list-item-subtitle>
            <v-list-item-subtitle class="d-flex justify-space-between w-100 smaller-font">
                {{ extra }}
            </v-list-item-subtitle>
        </div>
    </v-list-item>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, { TOOL_GATE_BYPASS } from '@/components/mixins/mmu'
import { ServerSpoolmanStateSpool } from '@/store/server/spoolman/types'

export default defineComponent({
    name: 'MmuGateSummary',
    mixins: [BaseMixin, MmuMixin],
    props: {
        gateIndex: { type: Number, required: true },
        compact: { type: Boolean, default: false },
    },
    computed: {
        gateStatus() {
            const status = this.mmu?.gate_status ?? []

            return status[this.gateIndex] ?? 0
        },

        lines() {
            return this.compact ? 'three' : 'two'
        },

        title() {
            const output = []

            if (!this.compact && this.gateIndex === TOOL_GATE_BYPASS) output.push('Bypass')
            else if (!this.compact) output.push(`@${this.gateIndex}`)

            if (this.vendorText) output.push(this.vendorText)

            return output.join(' | ')
        },

        name() {
            const names = this.mmu?.gate_filament_name ?? []

            return names[this.gateIndex] || this.$t('Panels.MmuPanel.Unknown')
        },

        subtitle() {
            const output = [this.gateMaterial]
            if (this.gateTemperature > 0) output.push(`${this.gateTemperature}°C`)
            if (this.gateSpeedOverride !== 100) output.push(`Speed: ${this.gateSpeedOverride.toFixed(0)}%`)

            return output.join(' | ')
        },

        extra() {
            if (!this.spoolmanSpool) return 'No spool ID'

            const output = [`Spool ID: #${this.gateSpoolId}`]
            if (this.weightText) output.push(this.weightText)
            if (this.lengthText) output.push(this.lengthText)

            return output.join(' | ')
        },

        gateMaterial() {
            const materials = this.mmu?.gate_material ?? []

            return materials[this.gateIndex] || this.$t('Panels.MmuPanel.Unknown')
        },

        gateTemperature() {
            const temperatures = this.mmu?.gate_temperature ?? []

            return temperatures[this.gateIndex] || -1
        },

        gateSpeedOverride() {
            const speedOverrides = this.mmu?.gate_speed_override ?? []

            return speedOverrides[this.gateIndex] || 100
        },

        gateSpoolId() {
            const spoolIds = this.mmu?.gate_spool_id ?? []

            return spoolIds[this.gateIndex] || -1
        },

        // Only available with Spoolman...

        spoolmanSpool() {
            const spools = this.$store.state.server.spoolman.spools ?? []

            return spools.find((s: ServerSpoolmanStateSpool) => s.id === this.gateSpoolId) ?? null
        },

        vendorText() {
            return this.spoolmanSpool?.filament?.vendor?.name ?? this.$t('Panels.MmuPanel.Unknown')
        },

        weightText() {
            const remaining = this.spoolmanSpool?.remaining_weight ?? null
            const total = this.spoolmanSpool?.initial_weight ?? this.spoolmanSpool?.filament?.weight ?? null
            if (remaining === null || total === null) return null

            if (total >= 1000) {
                let totalRound = Math.floor(total / 1000)
                if (totalRound !== total / 1000) {
                    totalRound = Math.round(total / 100) / 10
                }

                return `${Math.round(remaining)}g / ${totalRound}kg`
            }

            return `${Math.round(remaining)} / ${Math.round(total)}g`
        },

        lengthText() {
            const remaining = this.spoolmanSpool?.remaining_length ?? null
            if (remaining === null) return null

            return `${Math.round(remaining / 1000)}m`
        },

        listItemClass() {
            return {
                'disabled-panel': !this.gateStatus,
                'px-0': this.compact,
            }
        },

        toplineClass() {
            return {
                'mb-2': !this.compact,
                'mb-1': this.compact,
                'small-overline-font': this.compact,
            }
        },

        titleClass() {
            return {
                'text-h7': this.compact,
                'text-h6': !this.compact,
                'mb-1': true,
            }
        },

        subtitleClass() {
            return {
                'smaller-font': this.compact,
            }
        },
    },
})
</script>

<style scoped>
.reduced-line-height {
    line-height: 1em;
}

.smaller-font {
    font-size: 0.8em;
}

.small-overline-font {
    line-height: 0.7em;
    font-size: 0.7em !important;
}

.disabled-panel {
    opacity: 0.5;
}
</style>
