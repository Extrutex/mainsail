<template>
    <div>
        <v-divider v-if="boolBorderTop" class="my-2" />
        <settings-row :title="webcam.name" :icon="icon" :sub-title="subtitle">
            <template v-if="webcam.source === 'database'">
                <v-btn
                    class="minwidth-0 px-2"
                    size="small"
                    variant="outlined"
                    :color="webcam.enabled ? '' : 'secondary'"
                    @click="toogleStatus">
                    <v-icon size="small">{{ mdiLightbulbOutline }}</v-icon>
                </v-btn>
                <v-btn class="ml-3" size="small" variant="outlined" @click="edit">
                    <v-icon size="small" start>{{ mdiPencil }}</v-icon>
                    {{ $t('Settings.Edit') }}
                </v-btn>
                <v-btn size="small" variant="outlined" class="ml-3 minwidth-0 px-2" color="error" @click="deleteWebcam">
                    <v-icon size="small">{{ mdiDelete }}</v-icon>
                </v-btn>
            </template>
        </settings-row>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import { mdiDelete, mdiPencil, mdiLightbulbOutline } from '@mdi/js'
import WebcamMixin from '@/components/mixins/webcam'

export default defineComponent({
    name: 'WebcamListEntry',
    components: {
        SettingsRow,
    },
    mixins: [BaseMixin, WebcamMixin],
    props: {
        webcam: { type: Object, default: () => {} },
        boolBorderTop: { type: Boolean, default: false },
    },
    emits: ['edit-webcam'],
    data() {
        return {
            mdiPencil: mdiPencil,
            mdiDelete: mdiDelete,
            mdiLightbulbOutline: mdiLightbulbOutline,
        }
    },
    computed: {
        icon() {
            return this.convertWebcamIcon(this.webcam.icon)
        },
        subtitle() {
            if (this.webcam.service === 'mjpegstreamer-adaptive') return `URL: ${this.webcam.snapshot_url}`

            return `URL: ${this.webcam.stream_url}`
        },
    },
    methods: {
        toogleStatus() {
            const webcam = { ...this.webcam }
            webcam.enabled = !webcam.enabled
            this.$store.dispatch('gui/webcams/update', { webcam: webcam, oldWebcamName: webcam.name })
        },
        edit() {
            this.$emit('edit-webcam', this.webcam)
        },
        deleteWebcam() {
            this.$store.dispatch('gui/webcams/delete', this.webcam.name)
        },
    },
})
</script>

<style scoped></style>
