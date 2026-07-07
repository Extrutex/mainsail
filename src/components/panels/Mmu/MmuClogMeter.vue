<template>
    <svg ref="clogMeter" viewBox="0 0 140 140" preserveAspectRatio="xMidYMid meet" :class="svgClasses">
        <g transform="rotate(120 70 70)">
            <circle
                cx="70"
                cy="70"
                r="50"
                class="v-progress-circular__underlay"
                fill="transparent"
                stroke-width="18"
                :stroke-dasharray="CIRCUMFERENCE"
                :stroke-dashoffset="DIAL_ARC" />
            <circle
                ref="dialCircle"
                cx="70"
                cy="70"
                r="50"
                class="primary-color"
                fill="transparent"
                stroke-width="18"
                :stroke-dasharray="CIRCUMFERENCE"
                :stroke-dashoffset="dashOffset" />
        </g>
        <g :transform="headroomTransform">
            <circle
                cx="70"
                cy="70"
                r="50"
                class="warning-color"
                fill="transparent"
                stroke-width="18"
                opacity="0.3"
                :stroke-dasharray="CIRCUMFERENCE"
                :stroke-dashoffset="headroomArc" />
        </g>

        <line
            ref="minHeadroomLine"
            :x1="x1MinHeadroom"
            :y1="y1MinHeadroom"
            x2="70"
            y2="70"
            :class="minHeadroomLineClasses"
            stroke-width="4"
            stroke-dashoffset="0"
            stroke-dasharray="23,63" />
        <line
            :x1="X1_START"
            :y1="Y1_START"
            x2="70"
            y2="70"
            stroke="white"
            stroke-width="2"
            stroke-dashoffset="0"
            stroke-dasharray="22,63" />
        <line
            :x1="X1_END"
            :y1="Y1_END"
            x2="70"
            y2="70"
            class="warning-color"
            stroke-width="2"
            stroke-dashoffset="0"
            stroke-dasharray="22,63" />

        <text x="70" y="68" text-anchor="middle" class="small-text-color" font-size="12px">
            {{ $t('Panels.MmuPanel.Flowrate').toUpperCase() }}
        </text>
        <text x="70" y="90" text-anchor="middle" class="small-text-color" font-size="20px">{{ encoderFlowRate }}%</text>
        <text
            v-if="encoderDetectionMode === 2"
            x="70"
            y="122"
            text-anchor="middle"
            class="small-text-color"
            font-size="12px">
            Auto
        </text>
        <text x="32" y="139" text-anchor="end" class="small-text-color" font-size="12px">
            {{ encoderDetectionLength }}
        </text>
        <text x="106" y="139" class="small-text-color" font-size="12px">0</text>
    </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, { DIRECTION_UNKNOWN } from '@/components/mixins/mmu'

const CIRCUMFERENCE = 2 * Math.PI * 50

export default defineComponent({
    name: 'MmuClogMeter',
    mixins: [BaseMixin, MmuMixin],
    data() {
        return {
            ROTATION_TIME: 1,
            CIRCUMFERENCE: CIRCUMFERENCE,
            DIAL_ARC: CIRCUMFERENCE * (60 / 360),
            X1_START: 70 + 63 * Math.cos((120 * Math.PI) / 180),
            Y1_START: 70 + 63 * Math.sin((120 * Math.PI) / 180),
            X1_END: 70 + 63 * Math.cos((60 * Math.PI) / 180),
            Y1_END: 70 + 63 * Math.sin((60 * Math.PI) / 180),
        }
    },
    computed: {
        encoderDesiredHeadroom() {
            return this.mmuEncoder?.desired_headroom ?? 0
        },

        encoderDetectionLength() {
            return this.mmuEncoder?.detection_length ?? 0
        },

        encoderDetectionMode() {
            return this.mmuEncoder?.detection_mode ?? DIRECTION_UNKNOWN
        },

        encoderEnabled() {
            return this.mmuEncoder?.enabled ?? false
        },

        encoderFlowRate() {
            return this.mmuEncoder?.flow_rate ?? 0
        },

        svgClasses() {
            return { 'disabled-clog': this.encoderDetectionMode === 0 || !this.encoderEnabled }
        },

        headroom() {
            return this.mmuEncoder?.headroom ?? 0
        },

        headroomMin() {
            return this.mmuEncoder?.min_headroom ?? 0
        },

        headroomWarning() {
            return this.headroomMin < this.encoderDesiredHeadroom
        },

        minHeadroomLineClasses() {
            return {
                'warning-color': this.headroomWarning,
                'primary-color': !this.headroomWarning,
            }
        },

        headroomArc() {
            return this.CIRCUMFERENCE * (1 - (this.encoderDesiredHeadroom / this.encoderDetectionLength) * (300 / 360))
        },

        headroomRotate() {
            if (this.encoderDetectionLength === 0) return 120

            return 420 - (this.encoderDesiredHeadroom / this.encoderDetectionLength) * 300
        },

        headroomTransform() {
            return `rotate(${this.headroomRotate} 70 70)`
        },

        clogPercent() {
            if (this.encoderDetectionLength === 0) return 100

            return this.calcClogPercent(this.headroom, this.encoderDetectionLength)
        },

        minHeadroomPercent() {
            if (this.encoderDetectionLength === 0) return 100

            return this.calcClogPercent(this.headroomMin, this.encoderDetectionLength)
        },

        minHeadroomAngle() {
            return this.minHeadroomPercent * 3 // 300 degree range
        },

        x1MinHeadroom() {
            return 70 + 64 * Math.cos(((120 + this.minHeadroomAngle) * Math.PI) / 180)
        },

        y1MinHeadroom() {
            return 70 + 64 * Math.sin(((120 + this.minHeadroomAngle) * Math.PI) / 180)
        },

        dashOffset() {
            return this.CIRCUMFERENCE * ((100 - (this.clogPercent * 300) / 360) / 100)
        },
    },
    methods: {
        calcClogPercent(value: number, encoderDetectionLength: number) {
            return (
                (Math.min(Math.max(0, encoderDetectionLength - value), encoderDetectionLength) /
                    encoderDetectionLength) *
                100
            )
        },
    },
    watch: {
        dashOffset: {
            handler(newValue: number) {
                const dialCircle = this.$refs.dialCircle as SVGCircleElement | undefined
                if (!dialCircle) return

                const currentOffset = parseFloat(dialCircle?.style?.strokeDashoffset) || this.CIRCUMFERENCE
                const difference = Math.abs(currentOffset - newValue)
                const duration = (difference / this.CIRCUMFERENCE) * this.ROTATION_TIME
                dialCircle.style.transition = `stroke-dashoffset ${duration}s ease-out`
            },
            immediate: true,
        },
    },
})
</script>

<style scoped>
.disabled-clog {
    opacity: 0.5;
    cursor: not-allowed;
}
.primary-color {
    stroke: var(--v-primary-lighten1, #2ca9bc);
}
.warning-color {
    stroke: var(--v-error-base, #ff0000);
}
.small-text-color {
    fill: var(--v-primary-lighten1, #2ca9bc);
}
</style>
