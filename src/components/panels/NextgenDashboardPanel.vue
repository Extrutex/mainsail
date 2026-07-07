<template>
    <panel
        :icon="mdiRocketLaunch"
        :title="$t('Panels.NextgenDashboardPanel.Headline')"
        card-class="nextgen-dashboard-panel"
        :collapsible="true">
        <v-card-text class="nextgen-panel-content pa-0">
            <!-- HERO: progress ring -->
            <div class="nextgen-hero" :class="{ 'is-printing': printerIsPrintingOnly }">
                <div class="nextgen-hero-bg" />
                <div class="nextgen-ring-wrapper">
                    <svg class="nextgen-ring" viewBox="0 0 200 200">
                        <defs>
                            <linearGradient id="nextgenRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="#00e5ff" />
                                <stop offset="50%" stop-color="#2979ff" />
                                <stop offset="100%" stop-color="#d500f9" />
                            </linearGradient>
                            <filter id="nextgenRingGlow" x="-30%" y="-30%" width="160%" height="160%">
                                <feGaussianBlur stdDeviation="6" result="blur" />
                                <feMerge>
                                    <feMergeNode in="blur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        <circle class="nextgen-ring-track" cx="100" cy="100" r="88" />
                        <circle
                            class="nextgen-ring-value"
                            cx="100"
                            cy="100"
                            r="88"
                            filter="url(#nextgenRingGlow)"
                            :stroke-dasharray="ringCircumference"
                            :stroke-dashoffset="ringOffset" />
                    </svg>
                    <div class="nextgen-ring-center">
                        <template v-if="printerIsPrintingOnly">
                            <span class="nextgen-percent">
                                {{ displayPercent }}
                                <small>%</small>
                            </span>
                            <span class="nextgen-eta">
                                <template v-if="eta">ETA {{ eta }}</template>
                                <template v-else>{{ formattedPrintTime }}</template>
                            </span>
                        </template>
                        <template v-else>
                            <span class="nextgen-idle-orb" />
                            <span class="nextgen-state-text">{{ printerStateOutput }}</span>
                        </template>
                    </div>
                </div>
                <div v-if="printerIsPrintingOnly" class="nextgen-filename text-truncate">
                    {{ filename }}
                </div>
            </div>

            <!-- STAT TILES -->
            <div class="nextgen-stats">
                <div class="nextgen-stat-tile">
                    <span class="nextgen-stat-label">
                        {{ $t('Panels.NextgenDashboardPanel.Speed') }}
                    </span>
                    <span class="nextgen-stat-value">
                        {{ liveVelocity !== null ? liveVelocity : '--' }}
                        <small>mm/s</small>
                    </span>
                    <svg class="nextgen-sparkline" viewBox="0 0 100 28" preserveAspectRatio="none">
                        <polyline class="nextgen-sparkline-line speed" :points="speedSparklinePoints" />
                    </svg>
                </div>
                <div class="nextgen-stat-tile">
                    <span class="nextgen-stat-label">
                        {{ $t('Panels.NextgenDashboardPanel.Flow') }}
                    </span>
                    <span class="nextgen-stat-value">
                        {{ liveFlow !== null ? liveFlow : '--' }}
                        <small>mm³/s</small>
                    </span>
                    <svg class="nextgen-sparkline" viewBox="0 0 100 28" preserveAspectRatio="none">
                        <polyline class="nextgen-sparkline-line flow" :points="flowSparklinePoints" />
                    </svg>
                </div>
                <div class="nextgen-stat-tile">
                    <span class="nextgen-stat-label">
                        {{ $t('Panels.NextgenDashboardPanel.Layer') }}
                    </span>
                    <span class="nextgen-stat-value">
                        <template v-if="maxLayers > 0">
                            {{ currentLayer }}
                            <small>/ {{ maxLayers }}</small>
                        </template>
                        <template v-else>--</template>
                    </span>
                    <div class="nextgen-stat-bar">
                        <div class="nextgen-stat-bar-value" :style="{ width: layerPercent + '%' }" />
                    </div>
                </div>
                <div class="nextgen-stat-tile">
                    <span class="nextgen-stat-label">
                        {{ $t('Panels.NextgenDashboardPanel.PrintTime') }}
                    </span>
                    <span class="nextgen-stat-value">{{ formattedPrintTime }}</span>
                </div>
                <div class="nextgen-stat-tile">
                    <span class="nextgen-stat-label">
                        {{ $t('Panels.NextgenDashboardPanel.Filament') }}
                    </span>
                    <span class="nextgen-stat-value">{{ formattedFilamentUsed }}</span>
                </div>
                <div class="nextgen-stat-tile">
                    <span class="nextgen-stat-label">
                        {{ $t('Panels.NextgenDashboardPanel.ZHeight') }}
                    </span>
                    <span class="nextgen-stat-value">
                        {{ positionZ }}
                        <small>mm</small>
                    </span>
                </div>
            </div>
        </v-card-text>
    </panel>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiRocketLaunch } from '@mdi/js'

const SPARKLINE_POINTS = 60
const RING_RADIUS = 88

@Component({
    components: { Panel },
})
export default class NextgenDashboardPanel extends Mixins(BaseMixin) {
    mdiRocketLaunch = mdiRocketLaunch

    private speedHistory: number[] = []
    private flowHistory: number[] = []
    private historyTimer: number | null = null

    get ringCircumference() {
        return 2 * Math.PI * RING_RADIUS
    }

    get printPercent() {
        return Math.round((this.$store.getters['printer/getPrintPercent'] ?? 0) * 100)
    }

    get displayPercent() {
        return this.printerIsPrintingOnly ? this.printPercent : 0
    }

    get ringOffset() {
        return this.ringCircumference * (1 - this.displayPercent / 100)
    }

    get printerStateOutput() {
        if (!this.klipperReadyForGui) return this.$t('Panels.NextgenDashboardPanel.Offline')

        return this.printer_state
    }

    get filename() {
        return this.$store.state.printer.print_stats?.filename ?? ''
    }

    get eta() {
        return this.$store.getters['printer/getEstimatedTimeETAFormat']
    }

    get liveVelocity() {
        const velocity = this.$store.state.printer.motion_report?.live_velocity ?? null
        if (velocity === null) return null

        return Math.abs(velocity).toFixed(0)
    }

    get filamentDiameter() {
        return this.$store.state.printer.configfile?.settings?.extruder?.filament_diameter ?? 1.75
    }

    get liveFlow() {
        const extruderVelocity = this.$store.state.printer.motion_report?.live_extruder_velocity ?? null
        if (extruderVelocity === null) return null

        const filamentCrossSection = Math.pow(this.filamentDiameter / 2, 2) * Math.PI

        return Math.max(0, filamentCrossSection * extruderVelocity).toFixed(1)
    }

    get maxLayers() {
        return this.$store.getters['printer/getPrintMaxLayers'] ?? 0
    }

    get currentLayer() {
        return this.$store.getters['printer/getPrintCurrentLayer'] ?? 0
    }

    get layerPercent() {
        if (this.maxLayers === 0) return 0

        return Math.min(100, (this.currentLayer / this.maxLayers) * 100)
    }

    get printTime() {
        return this.$store.state.printer.print_stats?.print_duration ?? 0
    }

    get formattedPrintTime() {
        return this.formatDuration(this.printTime)
    }

    get filamentUsed() {
        return this.$store.state.printer.print_stats?.filament_used ?? 0
    }

    get formattedFilamentUsed() {
        if (this.filamentUsed >= 1000) return (this.filamentUsed / 1000).toFixed(2) + ' m'

        return this.filamentUsed.toFixed(0) + ' mm'
    }

    get positionZ() {
        const gcodePosition = this.$store.state.printer.gcode_move?.gcode_position ?? null
        if (gcodePosition === null) return '--'

        return gcodePosition[2].toFixed(2)
    }

    get speedSparklinePoints() {
        return this.buildSparklinePoints(this.speedHistory)
    }

    get flowSparklinePoints() {
        return this.buildSparklinePoints(this.flowHistory)
    }

    formatDuration(seconds: number) {
        if (seconds <= 0) return '--'

        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = Math.floor(seconds % 60)

        if (hours > 0) return `${hours}h ${minutes}m`
        if (minutes > 0) return `${minutes}m ${secs}s`

        return `${secs}s`
    }

    buildSparklinePoints(history: number[]) {
        if (history.length < 2) return ''

        const max = Math.max(...history, 1)
        const stepX = 100 / (SPARKLINE_POINTS - 1)
        const offset = SPARKLINE_POINTS - history.length

        return history
            .map((value, index) => {
                const x = ((offset + index) * stepX).toFixed(1)
                const y = (26 - (value / max) * 24).toFixed(1)

                return `${x},${y}`
            })
            .join(' ')
    }

    pushHistoryPoint() {
        const speed = Math.abs(this.$store.state.printer.motion_report?.live_velocity ?? 0)
        const extruderVelocity = Math.max(0, this.$store.state.printer.motion_report?.live_extruder_velocity ?? 0)
        const filamentCrossSection = Math.pow(this.filamentDiameter / 2, 2) * Math.PI

        this.speedHistory.push(speed)
        this.flowHistory.push(filamentCrossSection * extruderVelocity)

        if (this.speedHistory.length > SPARKLINE_POINTS) this.speedHistory.shift()
        if (this.flowHistory.length > SPARKLINE_POINTS) this.flowHistory.shift()
    }

    mounted() {
        this.historyTimer = window.setInterval(() => this.pushHistoryPoint(), 1000)
    }

    beforeDestroy() {
        if (this.historyTimer !== null) window.clearInterval(this.historyTimer)
    }
}
</script>

<style scoped>
.nextgen-panel-content {
    overflow: hidden;
}

/* ---- hero ---- */
.nextgen-hero {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px 16px 16px;
}

.nextgen-hero-bg {
    position: absolute;
    inset: 0;
    background:
        radial-gradient(ellipse 80% 60% at 50% -10%, rgba(41, 121, 255, 0.18), transparent),
        radial-gradient(ellipse 60% 50% at 80% 110%, rgba(213, 0, 249, 0.1), transparent);
    pointer-events: none;
}

.nextgen-ring-wrapper {
    position: relative;
    width: 180px;
    height: 180px;
}

.nextgen-ring {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
}

.nextgen-ring-track {
    fill: none;
    stroke: rgba(128, 128, 128, 0.18);
    stroke-width: 10;
}

.nextgen-ring-value {
    fill: none;
    stroke: url(#nextgenRingGradient);
    stroke-width: 10;
    stroke-linecap: round;
    transition: stroke-dashoffset 900ms cubic-bezier(0.4, 0, 0.2, 1);
}

.nextgen-ring-center {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.nextgen-percent {
    font-size: 2.6rem;
    font-weight: 300;
    line-height: 1;
    background: linear-gradient(120deg, #00e5ff, #2979ff 60%, #d500f9);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}

.nextgen-percent small {
    font-size: 1.2rem;
}

.nextgen-eta {
    margin-top: 4px;
    font-size: 0.8rem;
    opacity: 0.7;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.nextgen-state-text {
    margin-top: 12px;
    font-size: 0.9rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    opacity: 0.75;
}

.nextgen-idle-orb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 35%, #00e5ff, #2979ff);
    animation: nextgen-pulse 2.4s ease-in-out infinite;
}

.is-printing .nextgen-ring-wrapper {
    animation: nextgen-breathe 4s ease-in-out infinite;
}

.nextgen-filename {
    max-width: 100%;
    margin-top: 12px;
    font-size: 0.85rem;
    opacity: 0.8;
}

/* ---- stat tiles ---- */
.nextgen-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    padding: 8px 12px 12px;
}

@media (max-width: 500px) {
    .nextgen-stats {
        grid-template-columns: repeat(2, 1fr);
    }
}

.nextgen-stat-tile {
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 76px;
    padding: 10px 12px;
    overflow: hidden;
    border: 1px solid rgba(128, 128, 128, 0.15);
    border-radius: 12px;
    background: rgba(128, 128, 128, 0.06);
    transition:
        border-color 300ms ease,
        transform 300ms ease;
}

.nextgen-stat-tile:hover {
    border-color: rgba(41, 121, 255, 0.5);
    transform: translateY(-2px);
}

.nextgen-stat-label {
    font-size: 0.68rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    opacity: 0.6;
}

.nextgen-stat-value {
    margin-top: 4px;
    font-size: 1.25rem;
    font-weight: 500;
    line-height: 1.2;
}

.nextgen-stat-value small {
    font-size: 0.75rem;
    font-weight: 400;
    opacity: 0.6;
}

.nextgen-sparkline {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 24px;
    opacity: 0.85;
}

.nextgen-sparkline-line {
    fill: none;
    stroke-width: 1.5;
    vector-effect: non-scaling-stroke;
}

.nextgen-sparkline-line.speed {
    stroke: #00e5ff;
}

.nextgen-sparkline-line.flow {
    stroke: #d500f9;
}

.nextgen-stat-bar {
    height: 4px;
    margin-top: auto;
    overflow: hidden;
    border-radius: 2px;
    background: rgba(128, 128, 128, 0.2);
}

.nextgen-stat-bar-value {
    height: 100%;
    border-radius: 2px;
    background: linear-gradient(90deg, #00e5ff, #2979ff);
    transition: width 900ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* ---- animations ---- */
@keyframes nextgen-pulse {
    0%,
    100% {
        box-shadow: 0 0 0 0 rgba(0, 229, 255, 0.5);
    }
    50% {
        box-shadow: 0 0 18px 6px rgba(0, 229, 255, 0.15);
    }
}

@keyframes nextgen-breathe {
    0%,
    100% {
        filter: drop-shadow(0 0 6px rgba(41, 121, 255, 0.25));
    }
    50% {
        filter: drop-shadow(0 0 16px rgba(41, 121, 255, 0.5));
    }
}
</style>
