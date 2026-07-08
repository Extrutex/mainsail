<template>
    <div>
        <mjpegstreamer-async
            v-if="service === 'mjpegstreamer'"
            :cam-settings="webcam"
            :show-fps="showFps"
            :printer-url="printerUrl"
            :page="page" />
        <mjpegstreamer-adaptive-async
            v-else-if="service === 'mjpegstreamer-adaptive'"
            :cam-settings="webcam"
            :show-fps="showFps"
            :printer-url="printerUrl" />
        <uv4l-mjpeg-async v-else-if="service === 'uv4l-mjpeg'" :cam-settings="webcam" :printer-url="printerUrl" />
        <html-iframe-async v-else-if="service === 'iframe'" :cam-settings="webcam" :printer-url="printerUrl" />
        <html-video-async v-else-if="service === 'html-video'" :cam-settings="webcam" :printer-url="printerUrl" />
        <hlsstreamer-async v-else-if="service === 'hlsstream'" :cam-settings="webcam" :printer-url="printerUrl" />
        <j-muxer-stream-async
            v-else-if="service === 'jmuxer-stream'"
            :cam-settings="webcam"
            :printer-url="printerUrl" />
        <webrtc-camera-streamer-async
            v-else-if="service === 'webrtc-camerastreamer'"
            :cam-settings="webcam"
            :printer-url="printerUrl"
            :page="page" />
        <janus-streamer-async v-else-if="service === 'webrtc-janus'" :cam-settings="webcam" :printer-url="printerUrl" />
        <webrtc-media-m-t-x-async
            v-else-if="service === 'webrtc-mediamtx'"
            :cam-settings="webcam"
            :printer-url="printerUrl"
            :page="page" />
        <webrtc-go2rtc-async v-else-if="service === 'webrtc-go2rtc'" :cam-settings="webcam" :printer-url="printerUrl" />
        <p v-else class="text-center py-3 font-italic">{{ $t('Panels.WebcamPanel.UnknownWebcamService') }}</p>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import { DynamicCamLoader } from '@/components/webcams/streamers/DynamicCamLoader'

export default defineComponent({
    name: 'WebcamWrapperItem',
    components: {
        HlsstreamerAsync: DynamicCamLoader('Hlsstreamer'),
        HtmlVideoAsync: DynamicCamLoader('HtmlVideo'),
        HtmlIframeAsync: DynamicCamLoader('HtmlIframe'),
        JanusStreamerAsync: DynamicCamLoader('JanusStreamer'),
        JMuxerStreamAsync: DynamicCamLoader('JMuxerStream'),
        MjpegstreamerAsync: DynamicCamLoader('Mjpegstreamer'),
        MjpegstreamerAdaptiveAsync: DynamicCamLoader('MjpegstreamerAdaptive'),
        Uv4lMjpegAsync: DynamicCamLoader('Uv4lMjpeg'),
        WebrtcCameraStreamerAsync: DynamicCamLoader('WebrtcCameraStreamer'),
        WebrtcMediaMTXAsync: DynamicCamLoader('WebrtcMediaMTX'),
        WebrtcGo2rtcAsync: DynamicCamLoader('WebrtcGo2rtc'),
    },
    mixins: [BaseMixin],
    props: {
        webcam: { type: Object, required: true },
        showFps: { type: Boolean, default: true },
        printerUrl: { type: String, default: null },
        page: { type: String, default: null },
    },
    computed: {
        service() {
            return this.webcam?.service ?? 'unknown'
        },
    },
})
</script>

<style scoped>
:deep(.webcamBackground) {
    display: flex;
    justify-content: center;
    overflow: hidden;
    position: relative;
    background: rgba(0, 0, 0, 0.8);
    margin: 0 auto;
    max-height: calc(100vh - 155px);
}

:deep(.webcamImage) {
    width: 100%;
    transform-origin: center center;
    object-fit: contain;
}

html.theme--light :deep(.webcamBackground) {
    background: rgba(255, 255, 255, 0.7);
}
</style>
