<template>
    <div>
        <template v-if="webcam.service === 'grid'">
            <v-container v-if="webcams" fluid class="pb-4">
                <v-row density="compact">
                    <v-col v-for="gridWebcam in webcams" :key="gridWebcam.name" cols="6">
                        <webcam-wrapper-item
                            :webcam="gridWebcam"
                            :printer-url="printerUrl"
                            :show-fps="showFps"
                            :page="page" />
                    </v-col>
                </v-row>
            </v-container>
        </template>
        <template v-else>
            <webcam-wrapper-item :webcam="webcam" :printer-url="printerUrl" :show-fps="showFps" :page="page" />
        </template>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import WebcamWrapperItem from '@/components/webcams/WebcamWrapperItem.vue'

export default defineComponent({
    name: 'WebcamWrapper',
    components: {
        WebcamWrapperItem,
    },
    mixins: [BaseMixin],
    props: {
        webcam: { type: Object, required: true },
        showFps: { type: Boolean, default: true },
        printerUrl: { type: String, default: null },
        page: { type: String, default: null },
    },
    computed: {
        webcams(): GuiWebcamStateWebcam[] {
            return this.$store.getters['gui/webcams/getWebcams']
        },
    },
})
</script>

<style scoped></style>
