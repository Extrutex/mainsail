<template>
    <div class="webcamBackground" :style="wrapperStyle">
        <video ref="video" autoplay :style="webcamStyle" class="webcamImage" @loadedmetadata="onLoadedMetadata" />
        <v-row v-if="status !== 'connected'">
            <v-col class="_webcam_jmuxer_output text-center d-flex flex-column justify-center align-center">
                <v-progress-circular v-if="status === 'connecting'" indeterminate color="primary" class="mb-3" />
                <span class="mt-3">{{ status }}</span>
            </v-col>
        </v-row>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import JMuxer from 'jmuxer'
import BaseMixin from '@/components/mixins/base'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import WebcamMixin from '@/components/mixins/webcam'

export default defineComponent({
    name: 'JMuxerStreamer',
    mixins: [BaseMixin, WebcamMixin],
    props: {
        camSettings: { type: Object as PropType<GuiWebcamStateWebcam>, required: true },
        printerUrl: { type: String, default: null },
    },
    data() {
        return {
            jmuxer: null as JMuxer | null,
            status: 'connecting',
            aspectRatio: null as number | null,
        }
    },
    computed: {
        video(): HTMLVideoElement {
            return this.$refs.video as HTMLVideoElement
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
    },
    watch: {
        camSettings: {
            deep: true,
            handler() {
                // restart stream, when camSettings change
                this.play()
            },
        },
    },
    mounted() {
        this.play()
    },
    methods: {
        play() {
            this.status = 'connecting'
            this.jmuxer?.destroy()

            // Only websocket streams supported
            if (!this.url.startsWith('ws://') && !this.url.startsWith('wss://')) {
                console.error('jmuxer error: only websocket streams supported (ws://.. or wss://..)')
                this.status = 'error'
                return
            }

            const targetFps = this.camSettings.target_fps || 10

            this.jmuxer = new JMuxer({
                node: this.video,
                mode: 'video',
                flushingTime: 0,
                fps: targetFps,
                // debug: true,
                onReady: () => {
                    this.status = 'connected'
                    console.log('jmuxer ready')
                },
                onError: (data: unknown) => {
                    this.status = 'error'
                    console.log('jmuxer error:', data)
                },
            })

            const ws = new WebSocket(this.url)
            ws.binaryType = 'arraybuffer'
            ws.addEventListener('message', (event) => {
                this.jmuxer?.feed({
                    video: new Uint8Array(event.data),
                })
            })

            ws.addEventListener('error', (event) => {
                this.status = 'error'
                console.log('jmuxer ws error:', event)
            })
        },
        beforeUnmount() {
            this.jmuxer?.destroy()
        },
        onLoadedMetadata() {
            this.aspectRatio = this.updateAspectRatioFromVideo(this.video)
        },
    },
})
</script>

<style scoped>
._webcam_jmuxer_output {
    aspect-ratio: calc(3 / 2);
}
</style>
