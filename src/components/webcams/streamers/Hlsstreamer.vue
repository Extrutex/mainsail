<template>
    <div class="webcamBackground" :style="wrapperStyle">
        <video
            ref="video"
            v-observe-visibility="visibilityChanged"
            autoplay
            muted
            :style="webcamStyle"
            class="webcamImage"
            @loadedmetadata="onLoadedMetadata" />
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import BaseMixin from '@/components/mixins/base'
import Hls from 'hls.js'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import WebcamMixin from '@/components/mixins/webcam'

export default defineComponent({
    name: 'Hlsstreamer',
    mixins: [BaseMixin, WebcamMixin],
    props: {
        camSettings: { type: Object as PropType<GuiWebcamStateWebcam>, required: true },
        printerUrl: { type: String, default: null },
    },
    data() {
        return {
            aspectRatio: null as null | number,
            isVisible: true,
            hls: null as Hls | null,
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
    mounted() {
        this.play()
    },
    updated() {
        this.play()
    },
    methods: {
        visibilityChanged(isVisible: boolean) {
            this.isVisible = isVisible
        },
        onLoadedMetadata() {
            this.aspectRatio = this.updateAspectRatioFromVideo(this.video)
        },
        play() {
            if (Hls.isSupported()) {
                this.hls?.destroy()

                this.hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    maxLiveSyncPlaybackRate: 2,
                    liveSyncDuration: 0.5,
                    liveMaxLatencyDuration: 2,
                    backBufferLength: 5,
                })
                this.hls.loadSource(this.url)
                this.hls.attachMedia(this.video)
                this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    this.video.play()
                })
            } else if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
                fetch(this.url).then(() => {
                    this.video.src = this.url
                    this.video.play()
                })
            }
        },
        beforeUnmount() {
            this.hls?.destroy()
        },
    },
})
</script>
