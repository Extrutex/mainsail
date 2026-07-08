<template>
    <div class="webcamBackground" :style="wrapperStyle">
        <video
            ref="video"
            :src="url"
            autoplay
            :style="webcamStyle"
            class="webcamImage"
            @loadedmetadata="onLoadedMetadata" />
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import WebcamMixin from '@/components/mixins/webcam'

export default defineComponent({
    name: 'HtmlVideo',
    mixins: [BaseMixin, WebcamMixin],
    props: {
        camSettings: { type: Object as PropType<GuiWebcamStateWebcam>, required: true },
        printerUrl: { type: String, default: null },
    },
    data() {
        return {
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
    methods: {
        onLoadedMetadata() {
            this.aspectRatio = this.updateAspectRatioFromVideo(this.video)
        },
    },
})
</script>
