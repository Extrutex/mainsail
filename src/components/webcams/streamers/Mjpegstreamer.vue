<template>
    <div class="webcamBackground" :style="wrapperStyle">
        <img
            v-show="status === 'connected'"
            ref="image"
            class="webcamImage"
            draggable="false"
            :style="webcamStyle"
            :alt="camSettings.name"
            src="#"
            @load="onload" />
        <span v-if="showFpsCounter && status === 'connected'" class="webcamFpsOutput">
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

const CONTENT_LENGTH = 'content-length'

const SOI = new Uint8Array(2)
SOI[0] = 0xff
SOI[1] = 0xd8

export default defineComponent({
    name: 'MjpegStreamer',
    mixins: [BaseMixin, WebcamMixin],
    props: {
        camSettings: { type: Object as PropType<GuiWebcamStateWebcam>, required: true },
        printerUrl: { type: String, default: null },
        showFps: { type: Boolean, default: true },
        page: { type: String, default: null },
    },
    data() {
        return {
            // current read stream frames counter
            frames: 0,
            // current displayed fps
            currentFPS: 0,
            status: 'connecting',
            statusMessage: '',
            streamState: false,
            aspectRatio: null as null | number,
            timerFPS: null as number | null,
            timerRestart: null as number | null,
            reader: null as ReadableStreamDefaultReader<Uint8Array> | null | undefined,
        }
    },
    computed: {
        image(): HTMLImageElement {
            return this.$refs.image as HTMLImageElement
        },
        url() {
            return this.convertUrl(this.camSettings?.stream_url, this.printerUrl)
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
            return this.currentFPS.toString().padStart(2, '0')
        },
        showFpsCounter() {
            if (!this.showFps) return false

            return !(this.camSettings.extra_data?.hideFps ?? false)
        },
        expanded(): boolean {
            if (this.page !== 'dashboard') return true

            return this.$store.getters['gui/getPanelExpand']('webcam-panel', this.viewport) ?? false
        },
        showNozzleCrosshair() {
            const nozzleCrosshair = this.camSettings.extra_data?.nozzleCrosshair ?? false

            return nozzleCrosshair && this.status === 'connected'
        },
    },
    watch: {
        // start or stop the video when the expanded state changes
        expanded: {
            immediate: true,
            handler(newExpanded: boolean): void {
                if (!newExpanded) {
                    this.stopStream()
                    return
                }

                this.startStream()
            },
        },
        camSettings: {
            deep: true,
            handler() {
                this.aspectRatio = null
                this.restartStream()
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
        log(msg: string, obj?: unknown) {
            if (obj) {
                window.console.log(`[MJPEG streamer] ${msg}`, obj)
                return
            }

            window.console.log(`[MJPEG streamer] ${msg}`)
        },
        getLength(headers: string) {
            let contentLength = -1
            headers.split('\n').forEach((header: string) => {
                const pair = header.split(':')
                if (pair[0].toLowerCase() === CONTENT_LENGTH) {
                    // Fix for issue https://github.com/aruntj/mjpeg-readable-stream/issues/3 suggested by martapanc
                    contentLength = Number(pair[1])
                }
            })
            return contentLength
        },
        async startStream(skipStatus: boolean = false) {
            if (this.streamState) {
                return
            }
            this.streamState = true

            if (!skipStatus) {
                this.status = 'connecting'
                this.statusMessage = this.$t('Panels.WebcamPanel.ConnectingTo', { url: this.url }).toString()
            }

            // reset counter and timeout/interval
            this.clearTimeouts()

            try {
                //readable stream credit to from https://github.com/aruntj/mjpeg-readable-stream

                const url = new URL(this.url)
                url.searchParams.append('timestamp', new Date().getTime().toString())

                let response: Response | null = await fetch(url.toString(), { mode: 'cors' })

                if (!response.ok) {
                    this.log(`${response.status}: ${response.statusText}`)
                    await this.stopStream()
                    return
                }

                if (!response.body) {
                    this.log('ReadableStream not yet supported in this browser.')
                    await this.stopStream()
                    return
                }

                this.timerFPS = window.setInterval(() => {
                    this.currentFPS = this.frames
                    this.frames = 0
                }, 1000)

                this.timerRestart = window.setTimeout(() => {
                    this.restartStream(true)
                }, 10000)

                this.reader = response.body?.getReader()

                await this.readStream()

                // cleanup
                this.reader = null
                response = null
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : String(error)
                this.log(message)
                this.status = 'error'
                this.statusMessage = this.$t('Panels.WebcamPanel.ErrorWhileConnecting', { url: this.url }).toString()

                this.timerRestart = window.setTimeout(() => {
                    this.restartStream()
                }, 5000)
            }
        },
        async readStream() {
            // stop if the stream is not ready
            if (!this.reader) return

            try {
                // variables to read the stream
                let headers = ''
                let contentLength = -1
                let imageBuffer: Uint8Array = new Uint8Array(0)
                let bytesRead = 0
                let skipFrame = false

                let done: boolean | null = null
                let value

                do {
                    ;({ done, value } = await this.reader.read())

                    if (done || !value) continue

                    for (let index = 0; index < value.length; index++) {
                        // we've found the start of the frame. Everything we've read till now is the header.
                        if (value[index] === SOI[0] && value[index + 1] === SOI[1]) {
                            contentLength = this.getLength(headers)
                            imageBuffer = new Uint8Array(new ArrayBuffer(contentLength))
                        }

                        // we're still reading the header.
                        if (contentLength <= 0) {
                            headers += String.fromCharCode(value[index])
                            continue
                        }

                        // we're now reading the jpeg.
                        if (bytesRead < contentLength) {
                            imageBuffer[bytesRead++] = value[index]
                            continue
                        }

                        // we're done reading the jpeg. Time to render it.
                        if (this.image && !skipFrame) {
                            const objectURL = URL.createObjectURL(new Blob([imageBuffer], { type: 'image/jpeg' }))
                            this.image.src = objectURL
                            skipFrame = true

                            // update status to 'connected' if the first frame is received
                            if (this.status !== 'connected') {
                                this.status = 'connected'
                                this.statusMessage = ''
                            }

                            this.image.onload = () => {
                                URL.revokeObjectURL(objectURL)
                                skipFrame = false
                            }
                        }
                        this.frames++
                        contentLength = 0
                        bytesRead = 0
                        headers = ''
                    }
                } while (!done)
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : String(error)
                this.log(`readStream error: ${message}`, error)
            } finally {
                this.reader?.releaseLock()
            }
        },
        clearTimeouts() {
            this.frames = 0
            if (this.timerFPS) {
                window.clearInterval(this.timerFPS)
                this.timerFPS = null
            }
            if (this.timerRestart) {
                window.clearTimeout(this.timerRestart)
                this.timerRestart = null
            }
        },
        async stopStream(skipStatus: boolean = false) {
            this.streamState = false

            if (!skipStatus) {
                this.status = 'disconnected'
                this.statusMessage = this.$t('Panels.WebcamPanel.Disconnected').toString()
            }
            this.clearTimeouts()

            try {
                await this.reader?.cancel()
                this.reader?.releaseLock()
                this.reader = null
            } catch (error) {
                this.log('Error cancelling reader:', error)
            }
        },
        async restartStream(skipStatus: boolean = false) {
            await this.stopStream(skipStatus)
            await this.startStream(skipStatus)
        },
        // this function check if you changed the browser tab
        documentVisibilityChanged() {
            const visibility = document.visibilityState
            let bool = visibility === 'visible'

            if (this.page === 'dashboard' && !this.expanded) {
                bool = false
            }

            if (!bool) {
                this.stopStream()
                return
            }

            this.startStream()
        },
        onload() {
            if (this.aspectRatio !== null) return

            this.aspectRatio = this.updateAspectRatioFromImage(this.image)
        },
    },
})
</script>

<style scoped>
.webcamFpsOutput {
    display: inline-block;
    position: absolute;
    bottom: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.8);
    padding: 3px 10px;
    border-top-left-radius: 5px;
}

html.theme--light .webcamFpsOutput {
    background: rgba(255, 255, 255, 0.7);
}

._webcam_mjpegstreamer_output {
    aspect-ratio: calc(3 / 2);
}
</style>
