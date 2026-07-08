<style scoped></style>

<template>
    <panel
        v-if="socketIsConnected"
        :icon="mdiWebcam"
        :title="$t('Panels.WebcamPanel.Headline')"
        :collapsible="$route.fullPath !== '/cam'"
        card-class="webcam-panel"
        :margin-bottom="currentPage !== 'page'">
        <template #buttons>
            <v-menu v-if="showSwitch" location="bottom">
                <template #activator="{ props }">
                    <v-btn variant="text" tile v-bind="props">
                        <v-icon v-if="'icon' in currentCam" size="small" class="mr-2">
                            {{ convertWebcamIcon(currentCam.icon) }}
                        </v-icon>
                        <span class="d-none d-md-block">{{ currentCam.name ?? 'unknown' }}</span>
                        <v-icon size="small">{{ mdiMenuDown }}</v-icon>
                    </v-btn>
                </template>
                <v-list density="compact" class="py-0">
                    <v-list-item link @click="currentCamId = 'all'">
                        <template #prepend>
                            <v-icon size="small" class="mt-1 mr-2">{{ mdiViewGrid }}</v-icon>
                        </template>
                        <v-list-item-title>{{ $t('Panels.WebcamPanel.All') }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item v-for="webcam of webcams" :key="webcam.name" link @click="currentCamId = webcam.name">
                        <template #prepend>
                            <v-icon size="small" class="mt-1 mr-2">{{ convertWebcamIcon(webcam.icon) }}</v-icon>
                        </template>
                        <v-list-item-title v-text="webcam.name" />
                    </v-list-item>
                </v-list>
            </v-menu>
        </template>
        <v-card-text v-if="webcams.length" class="px-0 py-0 content d-inline-block">
            <v-row>
                <v-col class="pb-0" style="position: relative">
                    <webcam-wrapper :webcam="currentCam" :page="currentPage" />
                </v-col>
            </v-row>
        </v-card-text>
        <v-card-text v-else>
            <p class="text-center mb-0 text--disabled">{{ $t('Panels.WebcamPanel.NoWebcam') }}</p>
        </v-card-text>
    </panel>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '../mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import { mdiMenuDown, mdiViewGrid, mdiWebcam } from '@mdi/js'
import WebcamMixin from '@/components/mixins/webcam'

export default defineComponent({
    name: 'WebcamPanel',
    components: {
        Panel,
    },
    mixins: [BaseMixin, WebcamMixin],
    props: {
        currentPage: { type: String, default: 'dashboard' },
    },
    data() {
        return {
            mdiWebcam: mdiWebcam,
            mdiMenuDown: mdiMenuDown,
            mdiViewGrid: mdiViewGrid,
        }
    },
    computed: {
        webcams(): GuiWebcamStateWebcam[] {
            return this.$store.getters['gui/webcams/getWebcams']
        },

        showSwitch() {
            return this.webcams.length > 1
        },

        // id changed to name with the refactoring of using moonraker webcam API
        currentCamId: {
            get(): string {
                if (this.webcams.length === 1) return this.webcams[0].name ?? 'all'

                const currentCamId = this.$store.state.gui.view.webcam.currentCam[this.currentPage ?? ''] ?? 'all'
                if (this.webcams.findIndex((webcam: GuiWebcamStateWebcam) => webcam.name === currentCamId) !== -1)
                    return currentCamId
                else if (currentCamId !== undefined && this.webcams.length === 1) return this.webcams[0].name ?? ''
                else return 'all'
            },
            set(newVal: string) {
                this.$store.dispatch('gui/setCurrentWebcam', { page: this.currentPage, value: newVal })
            },
        },

        currentCam(): GuiWebcamStateWebcam {
            const cam = this.webcams.find((cam: GuiWebcamStateWebcam) => cam.name === this.currentCamId)

            return (
                cam ??
                ({
                    name: this.$t('Panels.WebcamPanel.All').toString(),
                    service: 'grid',
                    icon: mdiViewGrid,
                } as GuiWebcamStateWebcam)
            )
        },
    },
})
</script>
