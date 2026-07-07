<template>
    <g>
        <circle cx="258" cy="140" r="8" stroke-width="1" :class="encoderClass" />
        <path d="M257 135 L261 140 L257 145" stroke-width="2" fill="none" />
        <text x="278" y="145" :class="textClass">{{ $t('Panels.MmuPanel.Encoder') }}</text>
        <text x="345" y="145" :class="textClass" font-size="11px">{{ encoderPosText }}</text>
        <transition name="fade">
            <text v-if="homedToEncoder" x="219.5" y="145" font-weight="bold">H</text>
        </transition>
    </g>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, { DIRECTION_UNKNOWN, FILAMENT_POS_START_BOWDEN } from '@/components/mixins/mmu'

export default defineComponent({
    name: 'MmuFilamentStatusEncoder',
    mixins: [BaseMixin, MmuMixin],
    computed: {
        encoderClass() {
            return this.mmuEncoder?.enabled ? 'sensor-normal' : 'sensor-disabled'
        },

        textClass() {
            return {
                'text-disabled': !this.mmuEncoder?.enabled,
            }
        },

        encoderPosText() {
            return this.encoderPos < 10000 ? `${this.encoderPos} mm` : `${this.encoderPos}`
        },

        filamentDirection() {
            return this.mmu?.filament_direction ?? DIRECTION_UNKNOWN
        },

        homedToEncoder(): boolean {
            return this.configGateHomingEndstop === 'encoder' && this.mmuFilamentPos === FILAMENT_POS_START_BOWDEN
        },

        encoderPos() {
            return Math.round(this.mmuEncoder?.encoder_pos ?? 0)
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

.sensor-disabled {
    stroke: var(--disabled-stroke);
    stroke-dasharray: 2, 1;
    fill: var(--zone-background-dark-theme);
}

html.theme--light .sensor-disabled {
    fill: var(--zone-background-light-theme);
}

.sensor-normal {
    fill: var(--zone-background-dark-theme);
}

html.theme--light .sensor-normal {
    fill: var(--zone-background-light-theme);
}
</style>
