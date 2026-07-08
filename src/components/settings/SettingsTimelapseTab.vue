<template>
    <div>
        <v-card flat>
            <v-card-text>
                <h3 class="text-h5 mb-3">{{ $t('Settings.TimelapseTab.General') }}</h3>
                <settings-row
                    :title="$t('Settings.TimelapseTab.Enabled')"
                    :sub-title="$t('Settings.TimelapseTab.EnabledDescription')"
                    :dynamic-slot-width="true">
                    <v-switch
                        v-model="enabled"
                        hide-details
                        class="mt-0"
                        :disabled="blockedsettings.includes('enabled')" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.TimelapseTab.Autorender')"
                    :sub-title="$t('Settings.TimelapseTab.AutorenderDescription')"
                    :dynamic-slot-width="true">
                    <v-switch
                        v-model="autorender"
                        hide-details
                        class="mt-0"
                        :disabled="blockedsettings.includes('autorender')" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.TimelapseTab.Camera')"
                    :sub-title="$t('Settings.TimelapseTab.CameraDescriptionWithSnapshotUrl')">
                    <v-alert
                        v-if="blockedsettings.includes('snapshoturl')"
                        density="compact"
                        text
                        type="warning"
                        class="mb-0">
                        {{ $t('Settings.TimelapseTab.CameraWarningAlreadySet') }}
                        <small>({{ $t('Settings.TimelapseTab.CameraWarningAlreadySetSmall') }})</small>
                    </v-alert>
                    <v-select
                        v-else
                        v-model="camera"
                        :items="cameraOptions"
                        hide-details
                        variant="outlined"
                        density="compact"
                        :disabled="blockedsettings.includes('camera') || availableSnapshotWebcams.length === 0" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.TimelapseTab.Mode')"
                    :sub-title="$t('Settings.TimelapseTab.ModeDescription')">
                    <v-select
                        v-model="mode"
                        :items="modeOptions"
                        hide-details
                        variant="outlined"
                        density="compact"
                        :disabled="blockedsettings.includes('modeOptions')" />
                </settings-row>
                <template v-if="mode === 'hyperlapse'">
                    <v-divider class="my-2" />
                    <settings-row
                        :title="$t('Settings.TimelapseTab.HyperlapseCycle')"
                        :sub-title="$t('Settings.TimelapseTab.HyperlapseCycleDescription')">
                        <v-text-field
                            v-model="hyperlapseCycle"
                            type="number"
                            suffix="s"
                            hide-details="auto"
                            variant="outlined"
                            density="compact"
                            :disabled="blockedsettings.includes('hyperlapseCycle')"
                            hide-spin-buttons />
                    </settings-row>
                </template>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.TimelapseTab.PreviewImage')"
                    :sub-title="$t('Settings.TimelapseTab.PreviewImageDescription')"
                    :dynamic-slot-width="true">
                    <v-switch
                        v-model="previewimage"
                        hide-details
                        class="mt-0"
                        :disabled="blockedsettings.includes('previewimage')" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.TimelapseTab.SaveFrames')"
                    :sub-title="$t('Settings.TimelapseTab.SaveFramesDescription')"
                    :dynamic-slot-width="true">
                    <v-switch
                        v-model="saveframes"
                        hide-details
                        class="mt-0"
                        :disabled="blockedsettings.includes('saveframes')" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.TimelapseTab.StreamDelayCompensation')"
                    :sub-title="$t('Settings.TimelapseTab.StreamDelayCompensationDescription')">
                    <v-text-field
                        v-model="stream_delay_compensation"
                        type="number"
                        suffix="s"
                        step="0.01"
                        hide-details="auto"
                        variant="outlined"
                        density="compact"
                        :rules="[
                            (v) => !!v || $t('Settings.TimelapseTab.RulesRequired'),
                            (v) => v >= 0 || $t('Settings.TimelapseTab.RulesZeroAndPositive'),
                        ]"
                        :disabled="blockedsettings.includes('stream_delay_compensation')" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.TimelapseTab.GcodeVerbose')"
                    :sub-title="$t('Settings.TimelapseTab.GcodeVerboseDescription')"
                    :dynamic-slot-width="true">
                    <v-switch
                        v-model="gcode_verbose"
                        hide-details
                        class="mt-0"
                        :disabled="blockedsettings.includes('gcode_verbose')" />
                </settings-row>
                <v-divider class="my-2" />
                <h3 class="text-h5 mt-6 mb-3">{{ $t('Settings.TimelapseTab.Parkhead') }}</h3>
                <settings-row
                    :title="$t('Settings.TimelapseTab.Parkhead')"
                    :sub-title="$t('Settings.TimelapseTab.ParkheadDescription')"
                    :dynamic-slot-width="true">
                    <v-switch
                        v-model="parkhead"
                        hide-details
                        class="mt-0"
                        :disabled="blockedsettings.includes('parkhead')" />
                </settings-row>
                <template v-if="parkhead">
                    <v-divider class="my-2" />
                    <settings-row
                        :title="$t('Settings.TimelapseTab.Parkpos')"
                        :sub-title="$t('Settings.TimelapseTab.ParkposDescription')">
                        <v-select
                            v-model="parkpos"
                            :items="parkposOptions"
                            hide-details
                            variant="outlined"
                            density="compact"
                            :disabled="blockedsettings.includes('parkposOptions')" />
                    </settings-row>
                    <template v-if="['x_only', 'custom'].includes(parkpos)">
                        <v-divider class="my-2" />
                        <settings-row
                            :title="$t('Settings.TimelapseTab.PosX')"
                            :sub-title="$t('Settings.TimelapseTab.PosXDescription')">
                            <v-text-field
                                v-model="park_custom_pos_x"
                                type="number"
                                suffix="mm"
                                hide-details="auto"
                                variant="outlined"
                                density="compact"
                                :rules="[
                                    (v) => !!v || $t('Settings.TimelapseTab.RulesRequired'),
                                    (v) =>
                                        (v >= stepperXmin && v <= stepperXmax) ||
                                        $t('Settings.TimelapseTab.RulesBetweenMinMax', {
                                            min: stepperXmin,
                                            max: stepperXmax,
                                        }),
                                ]"
                                :disabled="blockedsettings.includes('park_custom_pos_x')"
                                hide-spin-buttons />
                        </settings-row>
                    </template>
                    <template v-if="['y_only', 'custom'].includes(parkpos)">
                        <v-divider class="my-2" />
                        <settings-row
                            :title="$t('Settings.TimelapseTab.PosY')"
                            :sub-title="$t('Settings.TimelapseTab.PosYDescription')">
                            <v-text-field
                                v-model="park_custom_pos_y"
                                type="number"
                                suffix="mm"
                                hide-details="auto"
                                variant="outlined"
                                density="compact"
                                :rules="[
                                    (v) => !!v || $t('Settings.TimelapseTab.RulesRequired'),
                                    (v) =>
                                        (v >= stepperYmin && v <= stepperYmax) ||
                                        $t('Settings.TimelapseTab.RulesBetweenMinMax', {
                                            min: stepperYmin,
                                            max: stepperYmax,
                                        }),
                                ]"
                                :disabled="blockedsettings.includes('park_custom_pos_y')"
                                hide-spin-buttons />
                        </settings-row>
                    </template>
                    <template v-if="['x_only', 'y_only', 'custom'].includes(parkpos)">
                        <v-divider class="my-2" />
                        <settings-row
                            :title="$t('Settings.TimelapseTab.PosDZ')"
                            :sub-title="$t('Settings.TimelapseTab.PosDZDescription')">
                            <v-text-field
                                v-model="park_custom_pos_dz"
                                type="number"
                                suffix="mm"
                                hide-details="auto"
                                variant="outlined"
                                density="compact"
                                :rules="[
                                    (v) => !!v || $t('Settings.TimelapseTab.RulesRequired'),
                                    (v) => v >= 0 || $t('Settings.TimelapseTab.RulesZeroAndPositive'),
                                ]"
                                :disabled="blockedsettings.includes('park_custom_pos_dz')"
                                hide-spin-buttons />
                        </settings-row>
                    </template>
                    <v-divider class="my-2" />
                    <settings-row
                        :title="$t('Settings.TimelapseTab.TravelSpeed')"
                        :sub-title="$t('Settings.TimelapseTab.TravelSpeedDescription')">
                        <v-text-field
                            v-model="park_travel_speed"
                            type="number"
                            suffix="mm/s"
                            hide-details="auto"
                            variant="outlined"
                            density="compact"
                            :rules="[
                                (v) => !!v || $t('Settings.TimelapseTab.RulesRequired'),
                                (v) => v >= 0 || $t('Settings.TimelapseTab.RulesZeroAndPositive'),
                            ]"
                            :disabled="blockedsettings.includes('park_travel_speed')"
                            hide-spin-buttons />
                    </settings-row>
                    <v-divider class="my-2" />
                    <settings-row
                        :title="$t('Settings.TimelapseTab.FwRetract')"
                        :sub-title="$t('Settings.TimelapseTab.FwRetractDescription')"
                        :dynamic-slot-width="true">
                        <v-switch
                            v-model="fw_retract"
                            hide-details
                            class="mt-0"
                            :disabled="blockedsettings.includes('fw_retract')" />
                    </settings-row>
                    <template v-if="!fw_retract">
                        <v-divider class="my-2" />
                        <settings-row
                            :title="$t('Settings.TimelapseTab.RetractSpeed')"
                            :sub-title="$t('Settings.TimelapseTab.RetractSpeedDescription')">
                            <v-text-field
                                v-model="park_retract_speed"
                                type="number"
                                suffix="mm/s"
                                hide-details="auto"
                                variant="outlined"
                                density="compact"
                                :rules="[
                                    (v) => !!v || $t('Settings.TimelapseTab.RulesRequired'),
                                    (v) => v > 0 || $t('Settings.TimelapseTab.RulesPositive'),
                                ]"
                                :disabled="blockedsettings.includes('park_retract_speed')"
                                hide-spin-buttons />
                        </settings-row>
                        <v-divider class="my-2" />
                        <settings-row
                            :title="$t('Settings.TimelapseTab.RetractDistance')"
                            :sub-title="$t('Settings.TimelapseTab.RetractDistanceDescription')">
                            <v-text-field
                                v-model="park_retract_distance"
                                type="number"
                                suffix="mm"
                                hide-details="auto"
                                variant="outlined"
                                density="compact"
                                :rules="[
                                    (v) => !!v || $t('Settings.TimelapseTab.RulesRequired'),
                                    (v) => v >= 0 || $t('Settings.TimelapseTab.RulesZeroAndPositive'),
                                ]"
                                :disabled="blockedsettings.includes('park_retract_distance')"
                                hide-spin-buttons />
                        </settings-row>
                        <v-divider class="my-2" />
                        <settings-row
                            :title="$t('Settings.TimelapseTab.UnretractSpeed')"
                            :sub-title="$t('Settings.TimelapseTab.UnretractSpeedDescription')">
                            <v-text-field
                                v-model="park_extrude_speed"
                                type="number"
                                suffix="mm/s"
                                hide-details="auto"
                                variant="outlined"
                                density="compact"
                                :rules="[
                                    (v) => !!v || $t('Settings.TimelapseTab.RulesRequired'),
                                    (v) => v > 0 || $t('Settings.TimelapseTab.RulesPositive'),
                                ]"
                                :disabled="blockedsettings.includes('park_extrude_speed')"
                                hide-spin-buttons />
                        </settings-row>
                        <v-divider class="my-2" />
                        <settings-row
                            :title="$t('Settings.TimelapseTab.UnretractDistance')"
                            :sub-title="$t('Settings.TimelapseTab.UnretractDistanceDescription')">
                            <v-text-field
                                v-model="park_extrude_distance"
                                type="number"
                                suffix="mm"
                                hide-details="auto"
                                variant="outlined"
                                density="compact"
                                :rules="[
                                    (v) => !!v || $t('Settings.TimelapseTab.RulesRequired'),
                                    (v) => v >= 0 || $t('Settings.TimelapseTab.RulesZeroAndPositive'),
                                ]"
                                :disabled="blockedsettings.includes('park_extrude_distance')"
                                hide-spin-buttons />
                        </settings-row>
                    </template>
                    <v-divider class="my-2" />
                    <settings-row
                        :title="$t('Settings.TimelapseTab.ParkTime')"
                        :sub-title="$t('Settings.TimelapseTab.ParkTimeDescription')">
                        <v-text-field
                            v-model="park_time"
                            type="number"
                            suffix="s"
                            hide-details="auto"
                            step="0.1"
                            variant="outlined"
                            density="compact"
                            :rules="[
                                (v) => !!v || $t('Settings.TimelapseTab.RulesRequired'),
                                (v) => v >= 0 || $t('Settings.TimelapseTab.RulesZeroAndPositive'),
                            ]"
                            :disabled="blockedsettings.includes('park_time')" />
                    </settings-row>
                </template>
                <v-divider class="my-2" />
                <h3 class="text-h5 mt-6 mb-3">{{ $t('Settings.TimelapseTab.RenderingOptions') }}</h3>
                <settings-row
                    :title="$t('Settings.TimelapseTab.VariableFps')"
                    :sub-title="$t('Settings.TimelapseTab.VariableFpsDescription')"
                    :dynamic-slot-width="true">
                    <v-switch
                        v-model="variable_fps"
                        hide-details
                        class="mt-0"
                        :disabled="blockedsettings.includes('variable_fps')" />
                </settings-row>
                <template v-if="variable_fps">
                    <v-divider class="my-2" />
                    <settings-row
                        :title="$t('Settings.TimelapseTab.Targetlength')"
                        :sub-title="$t('Settings.TimelapseTab.TargetlengthDescription')">
                        <v-text-field
                            v-model="targetlength"
                            type="number"
                            suffix="s"
                            hide-details="auto"
                            variant="outlined"
                            density="compact"
                            :rules="[
                                (v) => !!v || $t('Settings.TimelapseTab.RulesRequired'),
                                (v) => v > 0 || $t('Settings.TimelapseTab.RulesPositive'),
                            ]"
                            :disabled="blockedsettings.includes('targetlength')"
                            hide-spin-buttons />
                    </settings-row>
                    <v-divider class="my-2" />
                    <settings-row
                        :title="$t('Settings.TimelapseTab.VariableFpsMin')"
                        :sub-title="$t('Settings.TimelapseTab.VariableFpsMinDescription')">
                        <v-text-field
                            v-model="variable_fps_min"
                            type="number"
                            suffix="frames"
                            hide-details="auto"
                            variant="outlined"
                            density="compact"
                            :rules="[
                                (v) => !!v || $t('Settings.TimelapseTab.RulesRequired'),
                                (v) => v > 0 || $t('Settings.TimelapseTab.RulesPositive'),
                            ]"
                            :disabled="blockedsettings.includes('variable_fps_min')"
                            hide-spin-buttons />
                    </settings-row>
                    <v-divider class="my-2" />
                    <settings-row
                        :title="$t('Settings.TimelapseTab.VariableFpsMax')"
                        :sub-title="$t('Settings.TimelapseTab.VariableFpsMaxDescription')">
                        <v-text-field
                            v-model="variable_fps_max"
                            type="number"
                            suffix="frames"
                            hide-details="auto"
                            variant="outlined"
                            density="compact"
                            :rules="[
                                (v) => !!v || $t('Settings.TimelapseTab.RulesRequired'),
                                (v) => v > variable_fps_min || $t('Settings.TimelapseTab.RulesMin'),
                            ]"
                            :disabled="blockedsettings.includes('variable_fps_max')"
                            hide-spin-buttons />
                    </settings-row>
                </template>
                <template v-else>
                    <v-divider class="my-2" />
                    <settings-row
                        :title="$t('Settings.TimelapseTab.OutputFramerate')"
                        :sub-title="$t('Settings.TimelapseTab.OutputFramerateDescription')">
                        <v-text-field
                            v-model="output_framerate"
                            type="number"
                            suffix="frames"
                            hide-details="auto"
                            variant="outlined"
                            density="compact"
                            :rules="[
                                (v) => !!v || $t('Settings.TimelapseTab.RulesRequired'),
                                (v) => v > 0 || $t('Settings.TimelapseTab.RulesPositive'),
                            ]"
                            :disabled="blockedsettings.includes('output_framerate')"
                            hide-spin-buttons />
                    </settings-row>
                </template>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.TimelapseTab.duplicatelastframe')"
                    :sub-title="$t('Settings.TimelapseTab.duplicatelastframeDescription')">
                    <v-text-field
                        v-model="duplicatelastframe"
                        type="number"
                        hide-details="auto"
                        variant="outlined"
                        density="compact"
                        :rules="[
                            (v) => !!v || $t('Settings.TimelapseTab.RulesRequired'),
                            (v) => v >= 0 || $t('Settings.TimelapseTab.RulesZeroAndPositive'),
                        ]"
                        :disabled="blockedsettings.includes('duplicatelastframe')"
                        hide-spin-buttons />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.TimelapseTab.ConstantRateFactor')"
                    :sub-title="$t('Settings.TimelapseTab.ConstantRateFactorDescription')">
                    <v-text-field
                        v-model="constant_rate_factor"
                        type="number"
                        hide-details="auto"
                        variant="outlined"
                        density="compact"
                        :rules="[
                            (v) => !!v || $t('Settings.TimelapseTab.RulesRequired'),
                            (v) => v > 0 || $t('Settings.TimelapseTab.RulesPositive'),
                        ]"
                        :disabled="blockedsettings.includes('constant_rate_factor')"
                        hide-spin-buttons />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.TimelapseTab.Pixelformat')"
                    :sub-title="$t('Settings.TimelapseTab.PixelformatDescription')">
                    <v-text-field
                        v-model="pixelformat"
                        type="text"
                        hide-details="auto"
                        variant="outlined"
                        density="compact"
                        :disabled="blockedsettings.includes('pixelformat')" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.TimelapseTab.TimeFormatCode')"
                    :sub-title="$t('Settings.TimelapseTab.TimeFormatCodeDescription')">
                    <v-text-field
                        v-model="time_format_code"
                        type="text"
                        hide-details="auto"
                        variant="outlined"
                        density="compact"
                        :disabled="blockedsettings.includes('time_format_code')" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.TimelapseTab.Extraoutputparams')"
                    :sub-title="$t('Settings.TimelapseTab.ExtraoutputparamsDescription')">
                    <v-text-field
                        v-model="extraoutputparams"
                        type="text"
                        hide-details="auto"
                        variant="outlined"
                        density="compact"
                        :disabled="blockedsettings.includes('extraoutputparams')" />
                </settings-row>
            </v-card-text>
        </v-card>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { caseInsensitiveSort } from '@/plugins/helpers'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import { TranslateResult } from 'vue-i18n'

export default defineComponent({
    name: 'SettingsTimelapseTab',
    components: { SettingsRow },
    mixins: [BaseMixin],
    data() {
        return {
            modeOptions: [
                {
                    text: 'layermacro',
                    value: 'layermacro',
                },
                {
                    text: 'hyperlapse',
                    value: 'hyperlapse',
                },
            ],
            parkposOptions: [
                {
                    text: 'center',
                    value: 'center',
                },
                {
                    text: 'front_left',
                    value: 'front_left',
                },
                {
                    text: 'front_right',
                    value: 'front_right',
                },
                {
                    text: 'back_left',
                    value: 'back_left',
                },
                {
                    text: 'back_right',
                    value: 'back_right',
                },
                {
                    text: 'x_only',
                    value: 'x_only',
                },
                {
                    text: 'y_only',
                    value: 'y_only',
                },
                {
                    text: 'custom',
                    value: 'custom',
                },
            ],
        }
    },
    computed: {
        availableSnapshotWebcams(): GuiWebcamStateWebcam[] {
            return this.$store.getters['gui/webcams/getWebcams'].filter(
                (webcam: GuiWebcamStateWebcam) => webcam.snapshot_url !== ''
            )
        },
        cameraOptions() {
            let output: { text: string | TranslateResult; value: string | null }[] = []

            if (this.availableSnapshotWebcams.length === 0) {
                return [{ value: null, text: this.$t('Settings.TimelapseTab.NoWebcamFound') }]
            }

            this.availableSnapshotWebcams.forEach((webcam: GuiWebcamStateWebcam) => {
                output.push({
                    text: webcam.name,
                    value: webcam.name,
                })
            })

            output = caseInsensitiveSort(output, 'text')

            if (this.camera === null) {
                output.unshift({ value: null, text: this.$t('Settings.TimelapseTab.SelectWebcam') })
            }

            return output
        },
        blockedsettings() {
            return this.$store.state.server.timelapse.settings.blockedsettings ?? []
        },
        enabled: {
            get() {
                return this.$store.state.server.timelapse.settings.enabled
            },
            set(newVal) {
                this.$store.dispatch('server/timelapse/saveSetting', { enabled: newVal })
            },
        },
        mode: {
            get() {
                return this.$store.state.server.timelapse.settings.mode
            },
            set(newVal) {
                this.$store.dispatch('server/timelapse/saveSetting', { mode: newVal })
            },
        },
        hyperlapseCycle: {
            get() {
                return this.$store.state.server.timelapse.settings.hyperlapse_cycle
            },
            set(newVal) {
                this.$store.dispatch('server/timelapse/saveSetting', { hyperlapse_cycle: newVal })
            },
        },
        autorender: {
            get() {
                return this.$store.state.server.timelapse.settings.autorender
            },
            set(newVal) {
                this.$store.dispatch('server/timelapse/saveSetting', { autorender: newVal })
            },
        },
        saveframes: {
            get() {
                return this.$store.state.server.timelapse.settings.saveframes
            },
            set(newVal) {
                this.$store.dispatch('server/timelapse/saveSetting', { saveframes: newVal })
            },
        },
        stream_delay_compensation: {
            get() {
                return this.$store.state.server.timelapse.settings.stream_delay_compensation
            },
            set(newVal: number | string) {
                if (newVal === '') newVal = 0

                this.$store.dispatch('server/timelapse/saveSetting', { stream_delay_compensation: newVal })
            },
        },
        previewimage: {
            get() {
                return this.$store.state.server.timelapse.settings.previewimage
            },
            set(newVal) {
                this.$store.dispatch('server/timelapse/saveSetting', { previewimage: newVal })
            },
        },
        gcode_verbose: {
            get() {
                return this.$store.state.server.timelapse.settings.gcode_verbose
            },
            set(newVal) {
                this.$store.dispatch('server/timelapse/saveSetting', { gcode_verbose: newVal })
            },
        },
        parkhead: {
            get() {
                return this.$store.state.server.timelapse.settings.parkhead
            },
            set(newVal) {
                this.$store.dispatch('server/timelapse/saveSetting', { parkhead: newVal })
            },
        },
        parkpos: {
            get() {
                return this.$store.state.server.timelapse.settings.parkpos
            },
            set(newVal) {
                this.$store.dispatch('server/timelapse/saveSetting', { parkpos: newVal })
            },
        },
        park_custom_pos_x: {
            get() {
                return this.$store.state.server.timelapse.settings.park_custom_pos_x
            },
            set(newVal: number | string) {
                if (newVal === '' || newVal < this.stepperXmin || newVal > this.stepperXmax) return

                this.$store.dispatch('server/timelapse/saveSetting', { park_custom_pos_x: newVal })
            },
        },
        stepperXmin() {
            return this.$store.state.printer.configfile?.settings?.stepper_x?.position_min ?? 0
        },
        stepperXmax() {
            return this.$store.state.printer.configfile?.settings?.stepper_x?.position_max ?? 200
        },
        park_custom_pos_y: {
            get() {
                return this.$store.state.server.timelapse.settings.park_custom_pos_y
            },
            set(newVal: number | string) {
                if (newVal === '' || newVal < this.stepperYmin || newVal > this.stepperYmax) return

                this.$store.dispatch('server/timelapse/saveSetting', { park_custom_pos_y: newVal })
            },
        },
        stepperYmin() {
            return this.$store.state.printer.configfile?.settings?.stepper_y?.position_min ?? 0
        },
        stepperYmax() {
            return this.$store.state.printer.configfile?.settings?.stepper_y?.position_max ?? 200
        },
        park_custom_pos_dz: {
            get() {
                return this.$store.state.server.timelapse.settings.park_custom_pos_dz
            },
            set(newVal: number | string) {
                if (newVal === '' || newVal < 0) return

                this.$store.dispatch('server/timelapse/saveSetting', { park_custom_pos_dz: newVal })
            },
        },
        park_travel_speed: {
            get() {
                return this.$store.state.server.timelapse.settings.park_travel_speed
            },
            set(newVal: number | string) {
                if (newVal === '' || newVal < 0) return

                this.$store.dispatch('server/timelapse/saveSetting', { park_travel_speed: newVal })
            },
        },
        park_retract_speed: {
            get() {
                return this.$store.state.server.timelapse.settings.park_retract_speed
            },
            set(newVal: number | string) {
                if (newVal === '' || newVal <= 0) return

                this.$store.dispatch('server/timelapse/saveSetting', { park_retract_speed: newVal })
            },
        },
        park_extrude_speed: {
            get() {
                return this.$store.state.server.timelapse.settings.park_extrude_speed
            },
            set(newVal: number | string) {
                if (newVal === '' || newVal <= 0) return

                this.$store.dispatch('server/timelapse/saveSetting', { park_extrude_speed: newVal })
            },
        },
        park_retract_distance: {
            get() {
                return this.$store.state.server.timelapse.settings.park_retract_distance
            },
            set(newVal: number | string) {
                if (newVal === '' || newVal < 0) return

                this.$store.dispatch('server/timelapse/saveSetting', { park_retract_distance: newVal })
            },
        },
        park_extrude_distance: {
            get() {
                return this.$store.state.server.timelapse.settings.park_extrude_distance
            },
            set(newVal: number | string) {
                if (newVal === '' || newVal < 0) return

                this.$store.dispatch('server/timelapse/saveSetting', { park_extrude_distance: newVal })
            },
        },
        park_time: {
            get() {
                return this.$store.state.server.timelapse.settings.park_time
            },
            set(newVal: number | string) {
                if (newVal === '' || newVal < 0) return

                this.$store.dispatch('server/timelapse/saveSetting', { park_time: newVal })
            },
        },
        fw_retract: {
            get() {
                return this.$store.state.server.timelapse.settings.fw_retract
            },
            set(newVal) {
                this.$store.dispatch('server/timelapse/saveSetting', { fw_retract: newVal })
            },
        },
        constant_rate_factor: {
            get() {
                return this.$store.state.server.timelapse.settings.constant_rate_factor
            },
            set(newVal: number | string) {
                if (newVal === '' || newVal <= 0) return

                this.$store.dispatch('server/timelapse/saveSetting', { constant_rate_factor: newVal })
            },
        },
        output_framerate: {
            get() {
                return this.$store.state.server.timelapse.settings.output_framerate
            },
            set(newVal: number | string) {
                if (newVal === '' || newVal <= 0) return

                this.$store.dispatch('server/timelapse/saveSetting', { output_framerate: newVal })
            },
        },
        pixelformat: {
            get() {
                return this.$store.state.server.timelapse.settings.pixelformat
            },
            set(newVal) {
                this.$store.dispatch('server/timelapse/saveSetting', { pixelformat: newVal })
            },
        },
        extraoutputparams: {
            get() {
                return this.$store.state.server.timelapse.settings.extraoutputparams
            },
            set(newVal) {
                this.$store.dispatch('server/timelapse/saveSetting', { extraoutputparams: newVal })
            },
        },
        variable_fps: {
            get() {
                return this.$store.state.server.timelapse.settings.variable_fps
            },
            set(newVal) {
                this.$store.dispatch('server/timelapse/saveSetting', { variable_fps: newVal })
            },
        },
        targetlength: {
            get() {
                return this.$store.state.server.timelapse.settings.targetlength
            },
            set(newVal: number | string) {
                if (newVal === '' || newVal <= 0) return

                this.$store.dispatch('server/timelapse/saveSetting', { targetlength: newVal })
            },
        },
        variable_fps_min: {
            get() {
                return this.$store.state.server.timelapse.settings.variable_fps_min
            },
            set(newVal: number | string) {
                if (newVal === '' || newVal <= 0) return

                this.$store.dispatch('server/timelapse/saveSetting', { variable_fps_min: newVal })
            },
        },
        variable_fps_max: {
            get() {
                return this.$store.state.server.timelapse.settings.variable_fps_max
            },
            set(newVal: number | string) {
                if (newVal === '' || newVal <= this.variable_fps_min) return

                this.$store.dispatch('server/timelapse/saveSetting', { variable_fps_max: newVal })
            },
        },
        duplicatelastframe: {
            get() {
                return this.$store.state.server.timelapse.settings.duplicatelastframe
            },
            set(newVal: number | string) {
                if (newVal === '' || newVal < 0) return

                this.$store.dispatch('server/timelapse/saveSetting', { duplicatelastframe: newVal })
            },
        },
        camera: {
            get() {
                const value = this.$store.state.server.timelapse.settings.camera ?? null

                if (
                    value === null ||
                    this.blockedsettings.includes('snapshoturl') ||
                    this.availableSnapshotWebcams.length === 0 ||
                    this.availableSnapshotWebcams.find((webcam) => webcam.name === value) === undefined
                ) {
                    return null
                }

                return this.$store.state.server.timelapse.settings.camera
            },
            set(newVal) {
                this.$store.dispatch('server/timelapse/saveSetting', { camera: newVal })
            },
        },
        time_format_code: {
            get() {
                return this.$store.state.server.timelapse.settings.time_format_code
            },
            set(newVal) {
                this.$store.dispatch('server/timelapse/saveSetting', { time_format_code: newVal })
            },
        },
    },
})
</script>
