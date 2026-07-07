<template>
    <div>
        <v-row>
            <v-col cols="12">
                <webcam-panel current-page="page" />
            </v-col>
        </v-row>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import WebcamPanel from '@/components/panels/WebcamPanel.vue'

export default defineComponent({
    name: 'PageWebcam',
    components: { WebcamPanel },
    mixins: [BaseMixin],
})
</script>
<style></style>
