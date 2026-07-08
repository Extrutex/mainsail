<template>
    <v-card flat>
        <v-card-text>
            <v-form ref="formControlExtruder">
                <!-- TOOLHEAD CONTROL SETTINGS -->
                <div class="d-flex align-center">
                    <v-icon style="opacity: 0.7">{{ mdiGamepad }}</v-icon>
                    <v-card-title class="mx-n2">
                        {{ $t('Panels.ToolheadControlPanel.Headline') }}
                    </v-card-title>
                    <v-divider class="ml-3" />
                </div>
                <settings-row :title="$t('Settings.ControlTab.Style')">
                    <v-select
                        v-model="controlStyle"
                        :items="controlStyles"
                        variant="outlined"
                        density="compact"
                        hide-details
                        attach />
                </settings-row>
                <v-divider class="my-2" />
                <template v-if="['circle', 'cross'].includes(controlStyle) && actionOptions.length > 1">
                    <settings-row :title="$t('Settings.ControlTab.OverwriteActionButton')">
                        <v-select
                            v-model="actionButton"
                            :items="actionOptions"
                            variant="outlined"
                            density="compact"
                            hide-details
                            attach />
                    </settings-row>
                    <v-divider class="my-2" />
                </template>
                <settings-row :title="$t('Settings.ControlTab.HideDuringPrint')" :dynamic-slot-width="true">
                    <v-switch v-model="hideDuringPrint" hide-details class="mt-0" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row :title="$t('Settings.ControlTab.EnableXYHoming')" :dynamic-slot-width="true">
                    <v-switch v-model="enableXYHoming" hide-details class="mt-0" />
                </settings-row>
                <v-divider class="my-2" />
                <template v-if="['circle', 'cross'].includes(controlStyle)">
                    <settings-row :title="$t('Settings.ControlTab.InvertXMovement')" :dynamic-slot-width="true">
                        <v-switch v-model="reverseX" hide-details class="mt-0" />
                    </settings-row>
                    <v-divider class="my-2" />
                    <settings-row :title="$t('Settings.ControlTab.InvertYMovement')" :dynamic-slot-width="true">
                        <v-switch v-model="reverseY" hide-details class="mt-0" />
                    </settings-row>
                    <v-divider class="my-2" />
                    <settings-row :title="$t('Settings.ControlTab.InvertZMovement')" :dynamic-slot-width="true">
                        <v-switch v-model="reverseZ" hide-details class="mt-0" />
                    </settings-row>
                    <v-divider class="my-2" />
                </template>
                <settings-row :title="$t('Settings.ControlTab.SpeedXY')">
                    <v-text-field
                        v-model="feedrateXY"
                        type="number"
                        suffix="mm/s"
                        hide-details="auto"
                        :rules="[(v) => v > 0 || $t('Settings.ControlTab.ValueGreaterThan', { value: '0' })]"
                        variant="outlined"
                        density="compact"
                        hide-spin-buttons
                        @blur="blurFeedrateXY" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row :title="$t('Settings.ControlTab.SpeedZ')">
                    <v-text-field
                        v-model="feedrateZ"
                        type="number"
                        suffix="mm/s"
                        hide-details="auto"
                        :rules="[(v) => v > 0 || $t('Settings.ControlTab.ValueGreaterThan', { value: '0' })]"
                        variant="outlined"
                        density="compact"
                        hide-spin-buttons
                        @blur="blurFeedrateZ" />
                </settings-row>
                <v-divider class="my-2" />
                <!-- CONTROL STYLE CROSS SPECIFICS -->
                <template v-if="controlStyle === 'cross'">
                    <settings-row :title="$t('Settings.ControlTab.MoveDistancesInMm')" :mobile-second-row="true">
                        <v-combobox
                            v-model="stepsAll"
                            hide-selected
                            hide-details="auto"
                            multiple
                            small-chips
                            :deletable-chips="true"
                            append-icon=""
                            type="number"
                            :rules="[
                                (v) => v.length > 0 || $t('Settings.ControlTab.MinimumValues', { minimum: '1' }),
                                (v) =>
                                    v.length <= 9 ||
                                    $t('Settings.ControlTab.MaximumValuesVisibility', { maximum: '9' }),
                            ]"
                            density="compact"
                            variant="outlined"
                            hide-spin-buttons />
                    </settings-row>
                    <v-divider class="my-2" />
                </template>
                <!-- CONTROL STYLE CIRCLE SPECIFICS -->
                <template v-else-if="controlStyle === 'circle'">
                    <settings-row :title="$t('Settings.ControlTab.MoveDistancesXYInMm')" :mobile-second-row="true">
                        <v-combobox
                            v-model="stepsCircleXY"
                            hide-selected
                            hide-details="auto"
                            multiple
                            small-chips
                            :deletable-chips="true"
                            append-icon=""
                            type="number"
                            :rules="[
                                (v) => v.length > 0 || $t('Settings.ControlTab.MinimumValues', { minimum: '1' }),
                                (v) => v.length <= 4 || $t('Settings.ControlTab.MaximumValues', { maximum: '4' }),
                            ]"
                            density="compact"
                            variant="outlined"
                            hide-spin-buttons />
                    </settings-row>
                    <v-divider class="my-2" />
                    <settings-row :title="$t('Settings.ControlTab.MoveDistancesZInMm')" :mobile-second-row="true">
                        <v-combobox
                            v-model="stepsCircleZ"
                            hide-selected
                            hide-details="auto"
                            multiple
                            small-chips
                            :deletable-chips="true"
                            append-icon=""
                            type="number"
                            :rules="[
                                (v) => v.length > 0 || $t('Settings.ControlTab.MinimumValues', { minimum: '1' }),
                                (v) => v.length <= 4 || $t('Settings.ControlTab.MaximumValues', { maximum: '4' }),
                            ]"
                            density="compact"
                            variant="outlined"
                            hide-spin-buttons />
                    </settings-row>
                    <v-divider class="my-2" />
                </template>
                <!-- CONTROL STYLE BARS SPECIFICS -->
                <template v-else>
                    <settings-row :title="$t('Settings.ControlTab.MoveDistancesXYInMm')" :mobile-second-row="true">
                        <v-combobox
                            v-model="stepsXY"
                            hide-selected
                            hide-details="auto"
                            multiple
                            small-chips
                            :deletable-chips="true"
                            append-icon=""
                            type="number"
                            :rules="[
                                (v) => v.length > 0 || $t('Settings.ControlTab.MinimumValues', { minimum: '1' }),
                                (v) =>
                                    v.length <= 3 ||
                                    $t('Settings.ControlTab.MaximumValuesVisibility', { maximum: '3' }),
                            ]"
                            density="compact"
                            variant="outlined"
                            hide-spin-buttons />
                    </settings-row>
                    <v-divider class="my-2" />
                    <settings-row :title="$t('Settings.ControlTab.MoveDistancesZInMm')" :mobile-second-row="true">
                        <v-combobox
                            v-model="stepsZ"
                            hide-selected
                            hide-details="auto"
                            multiple
                            small-chips
                            :deletable-chips="true"
                            append-icon=""
                            type="number"
                            :rules="[
                                (v) => v.length > 0 || $t('Settings.ControlTab.MinimumValues', { minimum: '1' }),
                                (v) =>
                                    v.length <= 3 ||
                                    $t('Settings.ControlTab.MaximumValuesVisibility', { maximum: '3' }),
                            ]"
                            density="compact"
                            variant="outlined"
                            hide-spin-buttons />
                    </settings-row>
                    <v-divider class="my-2" />
                </template>
                <template v-if="klipperReadyForGui && endstop_pin !== null">
                    <settings-row
                        :title="$t('Settings.ControlTab.ZOffsetSaveOption')"
                        :sub-title="$t('Settings.ControlTab.ZOffsetSaveOptionDescription')">
                        <v-select
                            v-model="offsetZSaveOption"
                            :items="offsetZSaveOptions"
                            class="mt-0"
                            hide-details
                            variant="outlined"
                            density="compact" />
                    </settings-row>
                    <v-divider class="my-2" />
                </template>
                <settings-row :title="$t('Settings.ControlTab.ZOffsetIncrements')" :mobile-second-row="true">
                    <v-combobox
                        v-model="offsetsZ"
                        hide-selected
                        hide-details="auto"
                        multiple
                        small-chips
                        :deletable-chips="true"
                        append-icon=""
                        type="number"
                        :rules="[
                            (v) => v.length > 0 || $t('Settings.ControlTab.MinimumValues', { minimum: '1' }),
                            (v) => v.length <= 4 || $t('Settings.ControlTab.MaximumValuesVisibility', { maximum: '4' }),
                        ]"
                        density="compact"
                        variant="outlined"
                        hide-spin-buttons />
                </settings-row>
                <!-- EXTRUDER CONTROL SETTINGS -->
                <div class="d-flex align-center">
                    <v-icon style="opacity: 0.7">{{ mdiPrinter3dNozzle }}</v-icon>
                    <v-card-title class="mx-n2">
                        {{ $t('Panels.ExtruderControlPanel.Headline') }}
                    </v-card-title>
                    <v-divider class="ml-3" />
                </div>
                <settings-row :title="$t('Settings.ControlTab.MoveDistancesEInMm')" :mobile-second-row="true">
                    <v-combobox
                        v-model="feedamountsE"
                        hide-selected
                        hide-details="auto"
                        multiple
                        small-chips
                        :deletable-chips="true"
                        append-icon=""
                        type="number"
                        :rules="[
                            (v) => v.length > 0 || $t('Settings.ControlTab.MinimumValues', { minimum: '1' }),
                            (v) => v.length <= 5 || $t('Settings.ControlTab.MaximumValuesVisibility', { maximum: '5' }),
                        ]"
                        density="compact"
                        variant="outlined"
                        hide-spin-buttons />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row :title="$t('Settings.ControlTab.SpeedEInMms')" :mobile-second-row="true">
                    <v-combobox
                        v-model="feedratesE"
                        hide-selected
                        hide-details="auto"
                        multiple
                        small-chips
                        :deletable-chips="true"
                        append-icon=""
                        type="number"
                        :rules="[
                            (v) => v.length > 0 || $t('Settings.ControlTab.MinimumValues', { minimum: '1' }),
                            (v) => v.length <= 5 || $t('Settings.ControlTab.MaximumValuesVisibility', { maximum: '5' }),
                        ]"
                        density="compact"
                        variant="outlined"
                        hide-spin-buttons />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.ControlTab.EstimatedExtrusionInfo')"
                    :sub-title="$t('Settings.ControlTab.EstimatedExtrusionInfoDescription')"
                    :dynamic-slot-width="true">
                    <v-switch v-model="showEstimatedExtrusionInfo" hide-details class="mt-0" />
                </settings-row>
            </v-form>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import ControlMixin from '@/components/mixins/control'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { mdiPrinter3dNozzle, mdiGamepad } from '@mdi/js'
import ZoffsetMixin from '@/components/mixins/zoffset'

export default defineComponent({
    name: 'SettingsControlTab',
    components: { SettingsRow },
    mixins: [BaseMixin, ControlMixin, ZoffsetMixin],
    data() {
        return {
            mdiGamepad: mdiGamepad,
            mdiPrinter3dNozzle: mdiPrinter3dNozzle,
        }
    },
    computed: {
        formControlExtruder(): HTMLFormElement {
            return this.$refs.formControlExtruder as HTMLFormElement
        },
        controlStyles() {
            return [
                {
                    text: this.$t('Settings.ControlTab.Bars'),
                    value: 'bars',
                },
                {
                    text: this.$t('Settings.ControlTab.Circle'),
                    value: 'circle',
                },
                {
                    text: this.$t('Settings.ControlTab.Cross'),
                    value: 'cross',
                },
            ]
        },
        controlStyle: {
            get() {
                return this.$store.state.gui.control.style ?? 'bar'
            },
            setcontrolStyle(newVal) {
                this.$store.dispatch('gui/saveSetting', { name: 'control.style', value: newVal })
            },
        },
        hideDuringPrint: {
            get(): boolean {
                return this.$store.state.gui.control.hideDuringPrint ?? false
            },
            sethideDuringPrint(newVal) {
                this.$store.dispatch('gui/saveSetting', { name: 'control.hideDuringPrint', value: newVal })
            },
        },
        actionOptions() {
            const actions = [
                {
                    text: this.$t('Settings.ControlTab.MotorsOff', {
                        isDefault: this.defaultActionButton === 'm84' ? this.$t('Settings.ControlTab.IsDefault') : '',
                    }),
                    value: 'm84',
                },
            ]
            if (this.existsQGL) {
                actions.push({
                    text: this.$t('Settings.ControlTab.QuadGantryLevel', {
                        isDefault: this.defaultActionButton === 'qgl' ? this.$t('Settings.ControlTab.IsDefault') : '',
                    }),
                    value: 'qgl',
                })
            }
            if (this.existsZtilt) {
                actions.push({
                    text: this.$t('Settings.ControlTab.ZTiltAdjust', {
                        isDefault: this.defaultActionButton === 'ztilt' ? this.$t('Settings.ControlTab.IsDefault') : '',
                    }),
                    value: 'ztilt',
                })
            }
            return actions
        },
        actionButton: {
            get(): string {
                return this.$store.state.gui.control.actionButton ?? this.defaultActionButton
            },
            setactionButton(newVal) {
                this.$store.dispatch('gui/saveSetting', { name: 'control.actionButton', value: newVal })
            },
        },
        defaultActionButton() {
            return this.$store.getters['gui/getDefaultControlActionButton']
        },
        enableXYHoming: {
            get(): boolean {
                return this.$store.state.gui.control.enableXYHoming ?? false
            },
            setenableXYHoming(newVal) {
                this.$store.dispatch('gui/saveSetting', { name: 'control.enableXYHoming', value: newVal })
            },
        },
        reverseX: {
            get() {
                return this.$store.state.gui.control.reverseX
            },
            setreverseX(newVal) {
                this.$store.dispatch('gui/saveSetting', { name: 'control.reverseX', value: newVal })
            },
        },
        reverseY: {
            get() {
                return this.$store.state.gui.control.reverseY
            },
            setreverseY(newVal) {
                this.$store.dispatch('gui/saveSetting', { name: 'control.reverseY', value: newVal })
            },
        },
        reverseZ: {
            get() {
                return this.$store.state.gui.control.reverseZ
            },
            setreverseZ(newVal) {
                this.$store.dispatch('gui/saveSetting', { name: 'control.reverseZ', value: newVal })
            },
        },
        feedrateXY: {
            get() {
                return this.$store.state.gui.control.feedrateXY
            },
            setfeedrateXY(newVal) {
                this.$store.dispatch('gui/saveSetting', { name: 'control.feedrateXY', value: newVal })
            },
        },
        feedrateZ: {
            get() {
                return this.$store.state.gui.control.feedrateZ
            },
            setfeedrateZ(newVal) {
                this.$store.dispatch('gui/saveSetting', { name: 'control.feedrateZ', value: newVal })
            },
        },
        offsetsZ: {
            get() {
                const steps = this.$store.state.gui.control.offsetsZ
                return steps.sort(function (a: number, b: number) {
                    return a - b
                })
            },
            setoffsetsZ(steps) {
                // Use a set to prevent adding duplicate entries.
                const absSteps = new Set()
                for (const value of steps) absSteps.add(Math.abs(value))
                this.$store.dispatch('gui/saveSetting', { name: 'control.offsetsZ', value: Array.from(absSteps) })
            },
        },
        stepsAll: {
            get() {
                const steps = this.$store.state.gui.control.stepsAll
                return (steps ?? []).sort(function (a: number, b: number) {
                    return b - a
                })
            },
            setstepsAll(newVal) {
                const absSteps = []
                for (const value of newVal) absSteps.push(Math.abs(value))
                const steps = absSteps.filter(this.onlyUnique)

                this.$store.dispatch('gui/saveSetting', { name: 'control.stepsAll', value: steps })
            },
        },
        stepsXY: {
            get() {
                const steps = this.$store.state.gui.control.stepsXY
                return steps.sort(function (a: number, b: number) {
                    return b - a
                })
            },
            setstepsXY(newVal) {
                const absSteps = []
                for (const value of newVal) absSteps.push(Math.abs(value))
                const steps = absSteps.filter(this.onlyUnique)

                this.$store.dispatch('gui/saveSetting', { name: 'control.stepsXY', value: steps })
            },
        },
        stepsZ: {
            get() {
                const steps = this.$store.state.gui.control.stepsZ
                return steps.sort(function (a: number, b: number) {
                    return b - a
                })
            },
            setstepsZ(newVal) {
                const absSteps = []
                for (const value of newVal) absSteps.push(Math.abs(value))
                const steps = absSteps.filter(this.onlyUnique)

                this.$store.dispatch('gui/saveSetting', { name: 'control.stepsZ', value: steps })
            },
        },
        stepsCircleXY: {
            get() {
                const steps = this.$store.state.gui.control.stepsCircleXY
                return steps.sort(function (a: number, b: number) {
                    return b - a
                })
            },
            setstepsCircleXY(newVal) {
                const absSteps = []
                for (const value of newVal) absSteps.push(Math.abs(value))
                const steps = absSteps.filter(this.onlyUnique)

                this.$store.dispatch('gui/saveSetting', { name: 'control.stepsCircleXY', value: steps })
            },
        },
        stepsCircleZ: {
            get() {
                const steps = this.$store.state.gui.control.stepsCircleZ
                return steps.sort(function (a: number, b: number) {
                    return b - a
                })
            },
            setstepsCircleZ(newVal) {
                const absSteps = []
                for (const value of newVal) absSteps.push(Math.abs(value))
                const steps = absSteps.filter(this.onlyUnique)

                this.$store.dispatch('gui/saveSetting', { name: 'control.stepsCircleZ', value: steps })
            },
        },
        feedamountsE: {
            get() {
                const steps = this.$store.state.gui.control.extruder.feedamounts
                return steps.sort(function (a: number, b: number) {
                    return b - a
                })
            },
            setfeedamountsE(newVal) {
                const absAmounts = []
                for (const value of newVal) absAmounts.push(Math.abs(value))
                const amounts = absAmounts.filter(this.onlyUnique)

                this.$store.dispatch('gui/saveSetting', { name: 'control.extruder.feedamounts', value: amounts })
            },
        },
        feedratesE: {
            get() {
                const steps = this.$store.state.gui.control.extruder.feedrates
                return steps.sort(function (a: number, b: number) {
                    return b - a
                })
            },
            setfeedratesE(newVal) {
                const absRates = []
                for (const value of newVal) absRates.push(Math.abs(value))
                const rates = absRates.filter(this.onlyUnique)

                this.$store.dispatch('gui/saveSetting', { name: 'control.extruder.feedrates', value: rates })
            },
        },
        showEstimatedExtrusionInfo: {
            get() {
                return this.$store.state.gui.control.extruder.showEstimatedExtrusionInfo
            },
            setshowEstimatedExtrusionInfo(newVal) {
                this.$store.dispatch('gui/saveSetting', {
                    name: 'control.extruder.showEstimatedExtrusionInfo',
                    value: newVal,
                })
            },
        },
        offsetZSaveOption: {
            get() {
                return this.$store.state.gui.control.offsetZSaveOption ?? null
            },
            setoffsetZSaveOption(newVal) {
                this.$store.dispatch('gui/saveSetting', { name: 'control.offsetZSaveOption', value: newVal })
            },
        },
        offsetZSaveOptions() {
            const defaultValue = this.autoSaveZOffsetOption.replace(/Z_OFFSET_APPLY_/g, '')

            const output: { value: string | null; text: string }[] = [
                {
                    value: null,
                    text: `Auto (${defaultValue})`,
                },
            ]

            if (this.existZOffsetApplyEndstop) {
                output.push({
                    value: 'Z_OFFSET_APPLY_ENDSTOP',
                    text: 'ENDSTOP',
                })
            }

            if (this.existZOffsetApplyProbe) {
                output.push({
                    value: 'Z_OFFSET_APPLY_PROBE',
                    text: 'PROBE',
                })
            }

            return output
        },
    },
    mounted() {
        this.formControlExtruder?.validate()
    },
    methods: {
        blurFeedrateXY() {
            if (!(this.feedrateXY > 0)) this.feedrateXY = 100
        },
        blurFeedrateZ() {
            if (!(this.feedrateZ > 0)) this.feedrateZ = 25
        },
        onlyUnique(value: number, index: number, self: number[]) {
            return self.indexOf(value) === index
        },
    },
})
</script>
