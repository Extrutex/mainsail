<template>
    <div class="webcamBackground" :style="wrapperStyle">
        <video
            v-show="status === 'started'"
            ref="stream"
            class="webcamImage"
            :style="webcamStyle"
            autoplay
            muted
            playsinline
            @loadedmetadata="onLoadedMetadata" />
        <v-row v-if="status !== 'started'">
            <v-col class="_webcam_webrtc_output text-center d-flex flex-column justify-center align-center">
                <v-progress-circular v-if="status === 'connecting'" indeterminate color="primary" class="mb-3" />
                <span class="mt-3">{{ status }}</span>
            </v-col>
        </v-row>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { JanusJs, JanusSession, JanusStreamingPlugin } from 'typed_janus_js'
import BaseMixin from '@/components/mixins/base'
import type { ConstructorOptions } from 'typed_janus_js/dist/interfaces/janus'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import WebcamMixin from '@/components/mixins/webcam'

export default defineComponent({
    name: 'JanusStreamer',
    mixins: [BaseMixin, WebcamMixin],
    props: {
        camSettings: { type: Object as PropType<GuiWebcamStateWebcam>, required: true },
        printerUrl: { type: String, default: null },
    },
    data() {
        return {
            janusClient: null as JanusJs | null,
            session: null as JanusSession | null,
            handle: null as JanusStreamingPlugin | null,
            useStun: false,
            aspectRatio: null as null | number,
            status: 'connecting',
        }
    },
    computed: {
        stream(): HTMLVideoElement {
            return this.$refs.stream as HTMLVideoElement
        },
        url() {
            const baseUrl = this.camSettings.stream_url
            let url = new URL(baseUrl, this.printerUrl === null ? this.hostUrl.toString() : this.printerUrl)
            url.port = '8188'
            url.protocol = this.printerUrl?.startsWith('https') ? 'wss' : 'ws'

            if (baseUrl.startsWith('ws') || baseUrl.startsWith('http')) {
                url = new URL(baseUrl)
                const pathnameParts = url.pathname.split('/')
                url.pathname = pathnameParts.slice(0, pathnameParts.length - 1).join('/')
            }

            return url
        },
        wrapperStyle() {
            return this.getWrapperStyle(this.aspectRatio, this.camSettings.rotation)
        },
        streamId() {
            const pathnameParts = new URL(this.camSettings.stream_url).pathname.split('/')
            return pathnameParts[pathnameParts.length - 1]
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
        streamConfig() {
            const config: ConstructorOptions = {
                server: this.url.toString(),
            }

            if (this.useStun) {
                config.iceServers = [{ urls: ['stun:stun.l.google.com:19302'] }]
            }

            return config
        },
    },
    watch: {
        async url() {
            await this.session?.destroy({})
            await this.startStream()
        },
    },
    mounted() {
        this.startStream()
    },
    beforeUnmount() {
        this.session?.destroy({})
    },
    methods: {
        async startStream() {
            this.janusClient = new JanusJs(this.streamConfig)
            await this.janusClient.init({ debug: false })
            this.session = await this.janusClient.createSession()
            this.handle = await this.session.attach<JanusStreamingPlugin>(JanusStreamingPlugin, {})
            this.handle?.onMessage.subscribe(async ({ message, jsep }) => {
                if (message?.result?.status) {
                    this.status = message.result.status
                }
                if (jsep) {
                    const answer = await this.handle?.createAnswer({ jsep })
                    this.handle?.send({ message: { request: 'start' }, jsep: answer })
                }
            })
            const remoteStream = new MediaStream()
            JanusJs.attachMediaStream(this.stream as HTMLMediaElement, remoteStream)
            this.handle?.onRemoteTrack.subscribe(({ on, track }) => {
                if (on) remoteStream.addTrack(track)
                else remoteStream.removeTrack(track)
            })
            this.handle.onIceState.subscribe((value) => {
                console.log(`ICE state changed to ${value}`)
            })
            this.handle.onError.subscribe((value) => {
                this.status = `errored: ${JSON.stringify(value)}`
            })
            await this.handle.send({ message: { request: 'watch', id: parseInt(this.streamId!) } })
        },
        onLoadedMetadata() {
            this.aspectRatio = this.updateAspectRatioFromVideo(this.stream)
        },
    },
})
</script>

<style scoped>
._webcam_webrtc_output {
    aspect-ratio: calc(3 / 2);
}
</style>
