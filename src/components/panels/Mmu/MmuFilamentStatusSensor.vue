<template>
    <g v-if="hasSensor">
        <circle cx="258" :cy="yPosition" r="8" stroke-width="1" :class="circleClass" />
        <text x="278" :y="yPosition + 5" :class="textClass">{{ sensorText }}</text>
        <transition name="fade">
            <text v-if="homedTo" x="219.5" :y="yPosition + 5" font-weight="bold">H</text>
        </transition>
    </g>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, {
    FILAMENT_POS_HOMED_ENTRY,
    FILAMENT_POS_HOMED_GATE,
    FILAMENT_POS_HOMED_TS,
    Mmu,
} from '@/components/mixins/mmu'

export default defineComponent({
    name: 'MmuFilamentStatusSensor',
    mixins: [BaseMixin, MmuMixin],
    props: {
        sensorName: { type: String as PropType<keyof Mmu['sensors']>, required: true },
        sensorText: { type: String, required: true },
        yPosition: { type: Number, required: true },
        outsideZone: { type: Boolean, default: false },
    },
    computed: {
        hasSensor() {
            return this.hasMmuSensor(this.sensorName)
        },

        sensorStatus() {
            return this.getMmuSensor(this.sensorName)
        },

        circleClass() {
            return {
                'sensor-disabled': this.sensorStatus === null,
                'sensor-triggered': this.sensorStatus === true,
                'sensor-open': this.sensorStatus === false,
                'outside-zone': this.outsideZone,
            }
        },

        textClass() {
            return {
                'text-disabled': this.sensorStatus === null,
            }
        },

        homedTo() {
            if (this.sensorName === 'extruder') return this.mmuFilamentPos === FILAMENT_POS_HOMED_ENTRY
            if (this.sensorName === 'toolhead') return this.mmuFilamentPos === FILAMENT_POS_HOMED_TS

            if (!['mmu_gear', 'mmu_gate'].includes(this.sensorName)) return false

            return this.configGateHomingEndstop === this.sensorName && this.mmuFilamentPos === FILAMENT_POS_HOMED_GATE
        },
    },
})
</script>

<style scoped>
text {
    fill: currentColor;
}

.text-disabled {
    opacity: 0.5;
}

.sensor-triggered {
    fill: limegreen;
}

.sensor-disabled {
    stroke: var(--disabled-stroke);
    stroke-dasharray: 2, 1;
    fill: var(--zone-background-dark-theme);
}

html.theme--light .sensor-disabled {
    fill: var(--zone-background-light-theme);
}

.sensor-open {
    fill: var(--zone-background-dark-theme);
}

html.theme--light .sensor-open {
    fill: var(--zone-background-light-theme);
}

.sensor-disabled.outside-zone {
    fill: var(--background-dark-theme);
}

html.theme--light .sensor-disabled.outside-zone {
    fill: var(--background-light-theme);
}

.sensor-open.outside-zone {
    fill: var(--background-dark-theme);
}

html.theme--light .sensor-open.outside-zone {
    fill: var(--background-light-theme);
}
</style>
