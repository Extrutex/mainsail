<template>
    <div v-observe-visibility="viewportVisibilityChanged" class="webcamBackground" :style="wrapperStyle">
        <img
            v-show="status === 'connected'"
            ref="image"
            class="webcamImage"
            draggable="false"
            :style="webcamStyle"
            :alt="camSettings.name"
            src="#"
            @error="onError"
            @load="onLoad" />
        <span v-if="status === 'connected' && showFpsCounter" class="webcamFpsOutput">
            {{ $t('Panels.WebcamPanel.FPS') }}: {{ fpsOutput }}
        </span>
        <webcam-nozzle-crosshair v-if="showNozzleCrosshair" :webcam="camSettings" />
        <v-row v-if="status !== 'connected'">
            <v-col class="_webcam_mjpegstreamer_output text-center d-flex flex-column justify-center align-center">
                <v-progress-circular v-if="status === 'connecting'" indeterminate color="primary" class="mb-3" />
                <span class="mt-3">{{ statusMessage }}</span>
            </v-col>
        </v-row>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import WebcamMixin from '@/components/mixins/webcam'

export default defineComponent({
    name: 'MjpegstreamerAdaptive',
    mixins: [BaseMixin, WebcamMixin],
    props: {
        camSettings: { type: Object as PropType<GuiWebcamStateWebcam>, required: true },
        printerUrl: { type: String, default: null },
        showFps: { type: Boolean, default: true },
    },
    data() {
        return {
            isVisibleDocument: true,
            isVisibleViewport: false,
            status: 'connecting',
            statusMessage: '',
            timer: null as number | null,
            request_start_time: performance.now(),
            time: 0,
            request_time: 0,
            request_time_smoothing: 0.2,
            currentFPS: null as number | null,
            fpsTimer: null as number | null,
            frames: 0,
            aspectRatio: null as null | number,
        }
    },
    computed: {
        image(): HTMLImageElement {
            return this.$refs.image as HTMLImageElement
        },
        wrapperStyle() {
            return this.getWrapperStyle(this.aspectRatio, this.camSettings.rotation)
        },
        webcamStyle() {
            return {
                transform: this.generateTransform(
                    this.camSettings.flip_horizontal ?? false,
                    this.camSettings.flip_vertical ?? false,
                    this.camSettings.rotation ?? 0,
                    this.aspectRatio ?? 1
                ),
            }
        },
        fpsOutput() {
            if (this.currentFPS === null) return '--'

            return this.currentFPS < 10 ? '0' + this.currentFPS.toString() : this.currentFPS
        },
        showFpsCounter() {
            if (!this.showFps) return false

            return !(this.camSettings.extra_data?.hideFps ?? false)
        },
        url() {
            return this.convertUrl(this.camSettings?.snapshot_url, this.printerUrl)
        },
        isVisible() {
            return this.isVisibleDocument && this.isVisibleViewport
        },
        showNozzleCrosshair() {
            const nozzleCrosshair = this.camSettings.extra_data?.nozzleCrosshair ?? false

            return nozzleCrosshair && this.status === 'connected'
        },
    },
    watch: {
        isVisible: {
            immediate: true,
            handler(newVal: boolean) {
                if (newVal) {
                    this.startStream()
                    return
                }

                this.stopStream()
            },
        },
        camSettings: {
            deep: true,
            handler() {
                this.aspectRatio = null
                this.stopStream()

                this.status = 'connecting'

                this.startStream()
            },
        },
    },
    mounted() {
        document.addEventListener('visibilitychange', this.documentVisibilityChanged)
    },
    beforeUnmount() {
        document.removeEventListener('visibilitychange', this.documentVisibilityChanged)
        this.stopStream()
    },
    methods: {
        documentVisibilityChanged() {
            const visibility = document.visibilityState
            this.isVisibleDocument = visibility === 'visible'
        },
        viewportVisibilityChanged(newVal: boolean) {
            this.isVisibleViewport = newVal
        },
        refreshFrame() {
            if (!this.isVisible) return

            if (this.timer !== null) {
                window.clearTimeout(this.timer)
                this.timer = null
            }

            const url = new URL(this.url)
            url.searchParams.append('bypassCache', new Date().getTime().toString())
            this.image.src = url.toString()
            this.request_start_time = performance.now()
        },
        onLoad() {
            if (this.status !== 'connected') {
                this.status = 'connected'
                this.statusMessage = ''
            }
            this.frames++

            if (this.aspectRatio === null) {
                this.aspectRatio = this.updateAspectRatioFromImage(this.image)
            }

            const targetFps = this.camSettings.target_fps || 10
            const target_time = 1000 / targetFps

            const current_request_time = performance.now() - this.request_start_time
            this.request_time =
                this.request_time * this.request_time_smoothing +
                current_request_time * (1 - this.request_time_smoothing)
            const timeout = Math.max(0, target_time - this.request_time)

            this.timer = window.setTimeout(this.refreshFrame, timeout)
        },
        onError() {
            this.status = 'error'
            this.statusMessage = this.$t('Panels.WebcamPanel.ErrorWhileConnecting', { url: this.url }).toString()

            if (this.timer !== null) return

            this.timer = window.setTimeout(this.refreshFrame, 1000)
        },
        startStream() {
            // is not visible or already streaming
            if (!this.isVisible) return

            if (this.status !== 'connected') {
                this.status = 'connecting'
                this.statusMessage = this.$t('Panels.WebcamPanel.ConnectingTo', { url: this.url }).toString()
            }

            this.clearTimers()

            this.fpsTimer = window.setInterval(() => {
                this.currentFPS = this.frames
                this.frames = 0
            }, 1000)

            this.refreshFrame()
        },
        stopStream() {
            this.clearTimers()
        },
        clearTimers() {
            if (this.timer) {
                window.clearTimeout(this.timer)
                this.timer = null
            }

            if (this.fpsTimer) {
                window.clearTimeout(this.fpsTimer)
                this.fpsTimer = null
                this.frames = 0
            }
        },
    },
})
</script>

<style scoped>
._webcam_mjpegstreamer_output {
    aspect-ratio: calc(3 / 2);
}

.webcamFpsOutput {
    display: inline-block;
    position: absolute;
    bottom: 0;
    right: 0;
    padding: 3px 10px;
    border-top-left-radius: 5px;
    background: rgba(0, 0, 0, 0.8);
}

html.theme--light .webcamFpsOutput {
    background: rgba(255, 255, 255, 0.7);
}
</style>
