<template>
    <div>
        <h3 class="text-h5 mb-3 mt-5">{{ title }}</h3>

        <settings-row :title="$t('Panels.MmuPanel.MmuMaintenanceDialog.Enable')" dense>
            <v-switch v-model="ledsEnable" :label="$t('Panels.MmuPanel.MmuMaintenanceDialog.Enable')" hide-details />
            <v-switch
                v-model="ledsAnimation"
                :label="$t('Panels.MmuPanel.MmuMaintenanceDialog.Animation')"
                hide-details
                class="ml-5" />
        </settings-row>
        <settings-row
            v-if="existsEntryLed"
            :title="$t('Panels.MmuPanel.MmuMaintenanceDialog.EntryLeds')"
            :sub-title="$t('Panels.MmuPanel.MmuMaintenanceDialog.EntryLedsDescription')"
            dense>
            <v-select v-model="entryEffect" :items="options" hide-details variant="outlined" density="compact" />
        </settings-row>
        <settings-row
            v-if="existsExitLed"
            :title="$t('Panels.MmuPanel.MmuMaintenanceDialog.ExitLeds')"
            :sub-title="$t('Panels.MmuPanel.MmuMaintenanceDialog.ExitLedsDescription')"
            dense>
            <v-select v-model="exitEffect" :items="options" hide-details variant="outlined" density="compact" />
        </settings-row>
        <settings-row
            v-if="existsStatusLed"
            :title="$t('Panels.MmuPanel.MmuMaintenanceDialog.StatusLeds')"
            :sub-title="$t('Panels.MmuPanel.MmuMaintenanceDialog.StatusLedsDescription')"
            dense>
            <v-select v-model="statusEffect" :items="statusOptions" hide-details variant="outlined" density="compact" />
        </settings-row>

        <v-divider class="my-6" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import MmuMixin from '@/components/mixins/mmu'
import { convertName, toBoolean } from '@/plugins/helpers'

export default defineComponent({
    name: 'MmuMaintenanceStateDialogLeds',
    mixins: [BaseMixin, MmuMixin],
    props: {
        unitName: { type: String, required: true },
    },
    computed: {
        title() {
            return `MMU Leds - ${convertName(this.unitName)}`
        },
        mmuLeds() {
            const key = `mmu_leds ${this.unitName}`

            return this.$store.state.printer[key] ?? {}
        },
        mmuLedsSettings() {
            const key = `mmu_leds ${this.unitName}`

            return this.$store.state.printer.configfile?.settings?.[key] ?? {}
        },
        ledsEnable: {
            get(): boolean {
                return toBoolean(this.mmuLeds.enabled ?? 'False')
            },
            set(newVal: boolean) {
                this.updateLedSettings('ENABLE', newVal ? '1' : '0')
            },
        },
        ledsAnimation: {
            get(): boolean {
                return toBoolean(this.mmuLeds.animation ?? 'False')
            },
            set(newVal: boolean) {
                this.updateLedSettings('ANIMATION', newVal ? '1' : '0')
            },
        },
        existsEntryLed() {
            const pins = this.mmuLedsSettings?.entry_leds ?? ''

            return pins !== ''
        },
        entryEffect: {
            get(): string {
                return this.mmuLeds.entry_effect ?? 'off'
            },
            set(newVal: string) {
                this.updateLedSettings('ENTRY_EFFECT', newVal)
            },
        },
        existsExitLed() {
            const pins = this.mmuLedsSettings?.exit_leds ?? ''

            return pins !== ''
        },
        exitEffect: {
            get(): string {
                return this.mmuLedsSettings.exit_effect ?? 'off'
            },
            set(newVal: string) {
                this.updateLedSettings('EXIT_EFFECT', newVal)
            },
        },
        existsStatusLed() {
            const pins = this.mmuSettings?.status_leds ?? ''

            return pins !== ''
        },
        statusEffect: {
            get(): string {
                return this.mmuLedsSettings.status_effect ?? 'off'
            },
            set(newVal: string) {
                this.updateLedSettings('STATUS_EFFECT', newVal)
            },
        },
        options() {
            return [
                { value: 'off', title: this.$t('Panels.MmuPanel.MmuMaintenanceDialog.LedOptions.Off') },
                { value: 'gate_status', title: this.$t('Panels.MmuPanel.MmuMaintenanceDialog.LedOptions.GateStatus') },
                {
                    value: 'filament_color',
                    title: this.$t('Panels.MmuPanel.MmuMaintenanceDialog.LedOptions.FilamentColor'),
                },
                {
                    value: 'slicer_color',
                    title: this.$t('Panels.MmuPanel.MmuMaintenanceDialog.LedOptions.SlicerColor'),
                },
            ]
        },
        statusOptions() {
            const options = [...this.options]
            options.push({ value: 'on', title: this.$t('Panels.MmuPanel.MmuMaintenanceDialog.LedOptions.On') })

            return options
        },
    },
    methods: {
        updateLedSettings(attribute: string, value: string) {
            this.doSend(`MMU_LED QUIET=1 ${attribute}=${value}`)
        },
    },
})
</script>
