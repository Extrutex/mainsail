<template>
    <div class="webcamBackground" :style="wrapperStyle">
        <iframe class="webcamImage" :src="url" :style="iframeStyle" :title="camSettings.name" />
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import WebcamMixin from '@/components/mixins/webcam'

const DEFAULT_ASPECT_RATIO = 16 / 9

export default defineComponent({
    name: 'HtmlIframe',
    mixins: [BaseMixin, WebcamMixin],
    props: {
        camSettings: { type: Object as PropType<GuiWebcamStateWebcam>, required: true },
        printerUrl: { type: String, default: null },
    },
    computed: {
        url() {
            return this.convertUrl(this.camSettings?.stream_url, this.printerUrl)
        },
        wrapperStyle() {
            return this.getWrapperStyle(this.aspectRatio, this.camSettings.rotation)
        },
        aspectRatio() {
            const value = this.camSettings.aspect_ratio?.trim()
            if (!value) return DEFAULT_ASPECT_RATIO

            const match = value.match(/^(\d+)\s*[:/]\s*(\d+)$/)
            if (!match) return DEFAULT_ASPECT_RATIO

            const width = parseInt(match[1]) || 1
            const height = parseInt(match[2]) || 1

            return width / height
        },
        iframeStyle() {
            return {
                border: 'none',
                transform: this.generateTransform(
                    this.camSettings.flip_horizontal ?? false,
                    this.camSettings.flip_vertical ?? false,
                    this.camSettings.rotation ?? 0,
                    this.aspectRatio
                ),
                'aspect-ratio': this.aspectRatio,
            }
        },
    },
})
</script>
