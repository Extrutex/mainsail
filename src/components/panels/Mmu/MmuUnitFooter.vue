<template>
    <div class="mmu-unit-footer zindex-4 d-flex flex-row align-center px-4 pb-1">
        <v-icon
            v-if="showLogos"
            class="mr-4 flex-grow-0 flex-shrink-0 opacity-70"
            :class="logoClasses"
            :size="logoHeight">
            {{ logo }}
        </v-icon>
        <div class="flex-grow-1 flex-shrink-1 min-width-0 text-caption">
            <div v-if="showName" class="text-truncate">{{ unitDisplayName }}</div>
            <div v-if="unitClimateInfo" class="text-truncate">{{ unitClimateInfo }}</div>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, { MmuMachineUnit } from '@/components/mixins/mmu'
import {
    mmuIcon3MS,
    mmuIconAngryBeaver,
    mmuIconBoxTurtle,
    mmuIconEmu,
    mmuIconErcf,
    mmuIconHappyHare,
    mmuIconKms,
    mmuIconMmx,
    mmuIconNightOwl,
    mmuIconQuattroBox,
    mmuIconTradrack,
    mmuIconVvd,
    mmuThemeIcons,
} from '@/plugins/mmuIcons'
import { additionalSensors } from '@/store/variables'

const squareLogoVendors = ['3MS', 'AngryBeaver', 'EMU', 'ERCF', 'KMS']

export default defineComponent({
    name: 'MmuUnitFooter',
    mixins: [BaseMixin, MmuMixin],
    props: {
        unitIndex: { type: Number, required: true },
        mmuMachineUnit: { type: Object as PropType<MmuMachineUnit>, required: true },
    },
    computed: {
        unitDisplayName(): string {
            const name = this.mmuMachineUnit?.name

            return `#${this.unitIndex + 1} ${name}`
        },

        showLogos(): boolean {
            return this.$store.state.gui.view.mmu.showLogos ?? true
        },

        showName(): boolean {
            return this.$store.state.gui.view.mmu.showName ?? true
        },

        unitClimateSensorName() {
            const name = this.mmuMachineUnit?.environment_sensor?.replace(/^"(.*)"$/, '$1') ?? undefined
            if (!name) return undefined

            const parts = name.split(' ')
            if (parts.length !== 2) return undefined

            return parts[1]
        },

        unitClimateSensor() {
            if (!this.unitClimateSensorName) return undefined

            for (const key of additionalSensors) {
                const objectName: string = `${key} ${this.unitClimateSensorName}`
                if (!(objectName in this.$store.state.printer)) continue

                return this.$store.state.printer[objectName]
            }

            return undefined
        },

        unitClimateInfo() {
            if (!this.unitClimateSensor) return undefined

            const values: string[] = []

            if ('temperature' in this.unitClimateSensor && this.unitClimateSensor.temperature !== null) {
                values.push(`${this.unitClimateSensor.temperature.toFixed(0)}°C`)
            }

            if ('humidity' in this.unitClimateSensor && this.unitClimateSensor.humidity !== null) {
                values.push(`${this.unitClimateSensor.humidity.toFixed(0)}%`)
            }

            return values.length > 0 ? values.join(' / ') : undefined
        },

        mmuVendor() {
            return this.mmuMachineUnit?.vendor ?? 'Unknown'
        },

        logoHeight() {
            if (squareLogoVendors.includes(this.mmuVendor)) return this.spoolWidth - 16

            return this.spoolWidth - 8
        },

        logoClasses() {
            if (squareLogoVendors.includes(this.mmuVendor)) return ['my-1']

            return []
        },

        logo() {
            const baseIcon = this.getBaseIcon(this.mmuVendor)
            const themeVariants = mmuThemeIcons[this.mmuVendor]

            if (!themeVariants) return baseIcon

            const isDark = this.$vuetify.theme.current.dark
            const themeIcon = isDark ? themeVariants.dark : themeVariants.light

            return themeIcon ?? baseIcon
        },
    },
    methods: {
        getBaseIcon(vendor: string) {
            switch (vendor) {
                case '3MS':
                    return mmuIcon3MS

                case 'AngryBeaver':
                    return mmuIconAngryBeaver

                case 'BoxTurtle':
                    return mmuIconBoxTurtle

                case 'EMU':
                    return mmuIconEmu

                case 'ERCF':
                    return mmuIconErcf

                case 'KMS':
                    return mmuIconKms

                case 'MMX':
                    return mmuIconMmx

                case 'NightOwl':
                    return mmuIconNightOwl

                case 'QuattroBox':
                    return mmuIconQuattroBox

                case 'Tradrack':
                    return mmuIconTradrack

                case 'VVD':
                    return mmuIconVvd

                default:
                    return mmuIconHappyHare
            }
        },
    },
})
</script>

<style scoped>
.mmu-unit-footer {
    background: #2c2c2c;
    border-radius: 0 0 8px 8px;
}

html.theme--light .mmu-unit-footer {
    background: #f0f0f0;
}

.opacity-70 {
    opacity: 0.7;
}

.zindex-4 {
    z-index: 4;
}
</style>
