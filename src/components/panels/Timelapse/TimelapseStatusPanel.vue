<template>
    <panel :title="$t('Timelapse.Status')" :icon="mdiInformation" card-class="timelapse-status-panel">
        <v-card-text v-if="framesCount">
            <v-row v-if="frameUrl">
                <v-col class="pb-0">
                    <vue-load-image class="d-flex align-center justify-center">
                        <template #image>
                            <img
                                ref="timelapsePreview"
                                :src="frameUrl"
                                :alt="$t('Timelapse.Preview').toString()"
                                class="w-100"
                                :style="webcamStyle"
                                @load="calcRatio" />
                        </template>
                        <template #preloader>
                            <div>
                                <v-progress-circular indeterminate color="primary" />
                            </div>
                        </template>
                        <template #error>
                            <div>
                                <v-icon>{{ mdiFile }}</v-icon>
                            </div>
                        </template>
                    </vue-load-image>
                </v-col>
            </v-row>
            <v-row>
                <v-col class="text--secondary">
                    <settings-row :title="$t('Timelapse.Frames')" :dynamic-slot-width="true">
                        {{ framesCount }}
                    </settings-row>
                    <v-divider class="my-2" />
                    <settings-row :title="$t('Timelapse.EstimatedLength')" :dynamic-slot-width="true">
                        {{ estimatedVideoLength }}
                    </settings-row>
                    <template v-if="!['printing', 'paused'].includes(printer_state)">
                        <v-divider class="mt-2 mb-4" />
                        <v-row>
                            <v-col class="text-center py-1">
                                <v-btn
                                    variant="text"
                                    color="primary"
                                    :disabled="disableRenderButton"
                                    @click="boolDialogRendersettings = true">
                                    {{ $t('Timelapse.Render') }}
                                </v-btn>
                                <v-btn
                                    variant="text"
                                    color="primary"
                                    :loading="loadings.includes('timelapse_saveframes')"
                                    @click="saveFrames">
                                    {{ $t('Timelapse.SaveFrames') }}
                                </v-btn>
                            </v-col>
                        </v-row>
                    </template>
                </v-col>
            </v-row>
        </v-card-text>
        <v-card-text v-else class="">
            <p class="text-center my-0 font-italic">{{ $t('Timelapse.NoActiveTimelapse') }}</p>
        </v-card-text>
        <v-card-text v-if="['printing', 'paused'].includes(printer_state)" class="pt-0">
            <v-divider class="mt-0 mb-2" />
            <settings-row :title="$t('Timelapse.Enabled')" :dynamic-slot-width="true">
                <v-switch v-model="enabled" hide-details class="mt-0" />
            </settings-row>
            <template v-if="enabled">
                <v-divider class="my-2" />
                <settings-row :title="$t('Timelapse.Autorender')" :dynamic-slot-width="true">
                    <v-switch v-model="autorender" hide-details class="mt-0" />
                </settings-row>
            </template>
        </v-card-text>
        <timelapse-renderingsettings-dialog v-model="boolDialogRendersettings" />
    </panel>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import Panel from '@/components/ui/Panel.vue'
import { mdiFile, mdiInformation, mdiCloseThick } from '@mdi/js'
import WebcamMixin from '@/components/mixins/webcam'
import TimelapseRenderingsettingsDialog from '@/components/dialogs/TimelapseRenderingsettingsDialog.vue'
import TimelapseMixin from '@/components/mixins/timelapse'

export default defineComponent({
    name: 'TimelapseStatusPanel',
    components: { TimelapseRenderingsettingsDialog, Panel, SettingsRow },
    mixins: [BaseMixin, TimelapseMixin, WebcamMixin],
    data() {
        return {
            mdiInformation: mdiInformation,
            mdiFile: mdiFile,
            mdiCloseThick: mdiCloseThick,

            boolDialogRendersettings: false,
            scale: 1,
        }
    },
    computed: {
        frameUrl() {
            const frame = this.$store.state.server.timelapse?.lastFrame?.file ?? null

            if (frame) {
                return this.apiUrl + '/server/files/timelapse_frames/' + frame
            }

            return null
        },

        enabled: {
            get(): boolean {
                return this.$store.state.server.timelapse?.settings?.enabled ?? false
            },
            set(newVal: boolean) {
                this.$socket.emit(
                    'machine.timelapse.post_settings',
                    { enabled: newVal },
                    { action: 'server/timelapse/initSettings' }
                )
            },
        },

        autorender: {
            get(): boolean {
                return this.$store.state.server.timelapse?.settings?.autorender ?? false
            },
            set(newVal: boolean) {
                this.$socket.emit(
                    'machine.timelapse.post_settings',
                    { autorender: newVal },
                    { action: 'server/timelapse/initSettings' }
                )
            },
        },

        disableRenderButton() {
            return (this.$store.state.server.timelapse?.rendering.status ?? '') === 'running'
        },

        existsSnapshoturlInMoonrakerConfig() {
            return 'snapshoturl' in this.$store.state.server.config.orig.timelapse
        },

        moonrakerTimelapseConfig() {
            return this.$store.state.server.config.config.timelapse ?? {}
        },

        camId() {
            return this.$store.state.server.timelapse.settings.camera ?? ''
        },

        camSettings() {
            return this.$store.getters['gui/webcams/getWebcam'](this.camId)
        },

        webcamStyle() {
            // if the snapshoturl is set in moonraker config,
            // we also use the flip_x and flip_y values from the moonraker config
            if (this.existsSnapshoturlInMoonrakerConfig) {
                return {
                    transform: this.generateTransform(
                        this.moonrakerTimelapseConfig.flip_x ?? false,
                        this.moonrakerTimelapseConfig.flip_y ?? false,
                        0
                    ),
                }
            }

            if (!this.camSettings) return {}

            return {
                transform: this.generateTransform(
                    this.camSettings.flip_horizontal ?? false,
                    this.camSettings.flip_vertical ?? false,
                    this.camSettings.rotation ?? 0
                ),
            }
        },
    },
    methods: {
        saveFrames() {
            this.$socket.emit('machine.timelapse.saveframes', {}, { loading: 'timelapse_saveframes' })
        },

        calcRatio() {
            const timelapsePreview = this.$refs.timelapsePreview as HTMLImageElement

            this.scale = timelapsePreview.naturalHeight / timelapsePreview.naturalWidth

            if (this.scale > 1) {
                this.scale = timelapsePreview.naturalWidth / timelapsePreview.naturalHeight
            }
        },
    },
})
</script>
