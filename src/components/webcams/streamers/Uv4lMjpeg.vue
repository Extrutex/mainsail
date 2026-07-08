<template>
    <div class="webcamBackground" :style="wrapperStyle">
        <img
            ref="image"
            v-observe-visibility="viewportVisibilityChanged"
            :style="webcamStyle"
            class="webcamImage"
            draggable="false"
            :alt="camSettings.name"
            @load="onload" />
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import WebcamMixin from '@/components/mixins/webcam'

export default defineComponent({
    name: 'Uv4lMjpeg',
    mixins: [BaseMixin, WebcamMixin],
    props: {
        camSettings: { type: Object as PropType<GuiWebcamStateWebcam>, required: true },
        printerUrl: { type: String, default: null },
    },
    data() {
        return {
            aspectRatio: null as null | number,
            isVisible: false,
            isVisibleViewport: false,
            isVisibleDocument: true,
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
    },
    watch: {
        async url() {
            this.stopStream()
            this.startStream()
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
        startStream() {
            if (this.isVisible) return

            this.image?.setAttribute('src', this.url)
        },
        stopStream() {
            if (!this.image) return

            this.image.removeAttribute('src')
            URL.revokeObjectURL(this.url)
        },
        // this function checks if the browser tab was changed
        documentVisibilityChanged() {
            const visibility = document.visibilityState
            this.isVisibleDocument = visibility === 'visible'
            if (!this.isVisibleDocument) this.stopStream()
            this.visibilityChanged()
        },
        // this function checks if the webcam is in the viewport
        viewportVisibilityChanged(newVal: boolean) {
            this.isVisibleViewport = newVal
            this.visibilityChanged()
        },
        visibilityChanged() {
            if (this.isVisibleViewport && this.isVisibleDocument) {
                this.startStream()
                return
            }

            this.stopStream()
        },
        onload() {
            if (this.aspectRatio !== null) return

            this.aspectRatio = this.updateAspectRatioFromImage(this.image)
        },
    },
})
</script>
