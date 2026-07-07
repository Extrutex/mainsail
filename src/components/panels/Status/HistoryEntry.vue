<template>
    <v-row
        v-longpress:600="openContextMenu"
        class="history-list-entry d-flex flex-row flex-nowrap cursor-pointer"
        @contextmenu="openContextMenu($event)">
        <v-col cols="auto" class="d-flex flex-column justify-center pr-0 py-0">
            <v-tooltip
                v-if="smallThumbnail"
                location="top"
                :disabled="!bigThumbnail"
                content-class="tooltip__content-opacity1"
                :color="bigThumbnailTooltipColor">
                <template #activator="{ props }">
                    <vue-load-image class="text-center width-32">
                        <template #image>
                            <img
                                :src="smallThumbnail"
                                :width="32"
                                :height="32"
                                :alt="job.filename"
                                v-bind="props" />
                        </template>
                        <template #preloader>
                            <div>
                                <v-progress-circular indeterminate color="primary" />
                            </div>
                        </template>
                        <template #error>
                            <div>
                                <v-icon>{{ mdiFile }}</v-icon>
                            </div>
                        </template>
                    </vue-load-image>
                </template>
                <span><img :src="bigThumbnail" :width="250" :alt="job.filename" /></span>
            </v-tooltip>
            <v-icon v-else>{{ mdiFile }}</v-icon>
        </v-col>
        <v-col class="py-1" style="min-width: 0; font-size: 0.875em">
            <div class="text-truncate">
                <strong v-if="job.count > 1">{{ job.count }}x</strong>
                {{ job.filename }}
            </div>
            <small v-if="description" class="text-truncate">{{ description }}</small>
        </v-col>
        <v-col cols="auto" class="d-flex flex-column justify-center pa-0 pr-3">
            <v-tooltip location="top">
                <template #activator="{ props }">
                    <span v-bind="props">
                        <v-icon size="small" :color="statusColor" :disabled="!job.exists">
                            {{ statusIcon }}
                        </v-icon>
                    </span>
                </template>
                <span>{{ statusName }}</span>
            </v-tooltip>
        </v-col>
        <v-menu v-model="showContextMenu" :target="[contextMenuX, contextMenuY]">
            <v-list>
                <v-list-item
                    v-if="job.exists && file"
                    :disabled="printerIsPrinting || !klipperReadyForGui"
                    @click="startPrintDialogBool = true">
                    <v-icon class="mr-1">{{ mdiPrinter }}</v-icon>
                    {{ $t('History.Reprint') }}
                </v-list-item>
                <v-list-item v-if="job.exists && isJobQueueAvailable" @click="addToQueue">
                    <v-icon class="mr-1">{{ mdiPlaylistPlus }}</v-icon>
                    {{ $t('Files.AddToQueue') }}
                </v-list-item>
                <v-list-item v-if="job.exists && isJobQueueAvailable" @click="addBatchToQueueDialogBool = true">
                    <v-icon class="mr-1">{{ mdiPlaylistPlus }}</v-icon>
                    {{ $t('Files.AddBatchToQueue') }}
                </v-list-item>
                <v-list-item class="red--text" @click="deleteJob">
                    <v-icon class="mr-1" color="error">{{ mdiDelete }}</v-icon>
                    {{ $t('Buttons.Delete') }}
                </v-list-item>
            </v-list>
        </v-menu>
        <add-batch-to-queue-dialog v-model="addBatchToQueueDialogBool" :show-toast="true" :filename="job.filename" />
        <start-print-dialog
            v-if="job.exists && file"
            v-model="startPrintDialogBool"
            :file="file"
            :current-path="currentPath" />
    </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import type { LongpressEvent } from '@/directives/longpress'
import BaseMixin from '@/components/mixins/base'
import { FileStateGcodefile } from '@/store/files/types'
import StartPrintDialog from '@/components/dialogs/StartPrintDialog.vue'
import AddBatchToQueueDialog from '@/components/dialogs/AddBatchToQueueDialog.vue'
import { mdiCloseThick, mdiDelete, mdiFile, mdiPlaylistPlus, mdiPrinter } from '@mdi/js'
import { defaultBigThumbnailBackground, thumbnailBigMin, thumbnailSmallMax, thumbnailSmallMin } from '@/store/variables'
import { ServerHistoryStateJobWithCount } from '@/store/server/history/types'
import { FileStateFileThumbnail } from '@/store/files/types'
import { convertPrintStatusIcon, escapePath, formatPrintTime } from '@/plugins/helpers'
import { CLOSE_CONTEXT_MENU, EventBus } from '@/plugins/eventBus'

export default defineComponent({
    name: 'StatusPanelHistoryEntry',
    components: { StartPrintDialog, AddBatchToQueueDialog },
    mixins: [BaseMixin],
    props: {
        job: { type: Object as PropType<ServerHistoryStateJobWithCount>, required: true },
    },
    data() {
        return {
            mdiCloseThick: mdiCloseThick,
            mdiDelete: mdiDelete,
            mdiFile: mdiFile,
            mdiPlaylistPlus: mdiPlaylistPlus,
            mdiPrinter: mdiPrinter,

            showContextMenu: false,
            contextMenuX: 0,
            contextMenuY: 0,

            addBatchToQueueDialogBool: false,
            startPrintDialogBool: false,
        }
    },
    computed: {
        file(): FileStateGcodefile | undefined {
            return this.$store.getters['files/getFile']('gcodes/' + this.job.filename) ?? undefined
        },

        currentPath(): string {
            const lastSlash = this.job.filename.lastIndexOf('/')
            return lastSlash > 0 ? '/' + this.job.filename.slice(0, lastSlash) : ''
        },

        smallThumbnail() {
            if ((this.job.metadata?.thumbnails?.length ?? 0) < 1) return false

            const thumbnail = this.job.metadata?.thumbnails?.find(
                (thumb) =>
                    thumb.width >= thumbnailSmallMin &&
                    thumb.width <= thumbnailSmallMax &&
                    thumb.height >= thumbnailSmallMin &&
                    thumb.height <= thumbnailSmallMax
            )

            return thumbnail ? this.createThumbnailUrl(thumbnail) : false
        },

        bigThumbnail() {
            if ((this.job.metadata?.thumbnails?.length ?? 0) < 1) return false

            const thumbnail = this.job.metadata?.thumbnails?.find((thumb) => thumb.width >= thumbnailBigMin)

            return thumbnail ? this.createThumbnailUrl(thumbnail) : false
        },

        statusIcon() {
            return convertPrintStatusIcon(this.job.status)
        },

        statusColor() {
            return convertPrintStatusIcon(this.job.status)
        },

        statusName() {
            // check if translation exists
            if (!this.$t(`History.StatusValues.${this.job.status}`, 'en')) return this.job.status.replace(/_/g, ' ')

            return this.$t(`History.StatusValues.${this.job.status}`)
        },

        description() {
            const outputArray = []

            const filamentArray = []
            let filament = '--'
            if (this.filamentLength) filamentArray.push(this.filamentLength)
            if (this.filamentWeight) filamentArray.push(this.filamentWeight)
            if (filamentArray.length) filament = filamentArray.join(' / ')
            outputArray.push(`${this.$t('Panels.StatusPanel.Filament')}: ${filament}`)

            if (this.estimatedTime !== '--')
                outputArray.push(`${this.$t('Panels.StatusPanel.PrintTime')}: ${this.estimatedTime}`)
            else if (this.totalTime) outputArray.push(`${this.$t('Panels.StatusPanel.TotalTime')}: ${this.totalTime}`)

            return outputArray.join(', ')
        },

        filamentLength() {
            const length = this.job.filament_used
            if (length === 0) return null

            if (length >= 1000) return (length / 1000).toFixed(1) + ' m'

            return length.toFixed(0) + ' mm'
        },

        filamentWeight() {
            const metadataFilamentLength = this.job.metadata?.filament_total ?? 0
            const metadataFilamentWeight = this.job.metadata?.filament_weight_total ?? 0
            if (metadataFilamentLength === 0 || metadataFilamentWeight === 0) return null

            const specificWeight = metadataFilamentWeight / metadataFilamentLength

            const weight = this.job.filament_used * specificWeight
            if (weight === 0) return null

            if (weight >= 1000) return (length / 1000).toFixed(1) + ' kg'

            return weight.toFixed(0) + ' g'
        },

        estimatedTime() {
            const totalSeconds = this.job.print_duration ?? 0
            if (totalSeconds == 0) return '--'

            return formatPrintTime(totalSeconds)
        },

        totalTime() {
            const totalSeconds: number = this.job.total_duration ?? 0
            if (totalSeconds === 0) return null

            return formatPrintTime(totalSeconds)
        },

        bigThumbnailBackground() {
            return this.$store.state.gui.uiSettings.bigThumbnailBackground ?? defaultBigThumbnailBackground
        },

        bigThumbnailTooltipColor() {
            if (defaultBigThumbnailBackground.toLowerCase() === this.bigThumbnailBackground.toLowerCase()) {
                return undefined
            }

            return this.bigThumbnailBackground
        },

        isJobQueueAvailable() {
            return this.moonrakerComponents.includes('job_queue')
        },
    },
    methods: {
        openContextMenu(e: MouseEvent | LongpressEvent) {
            e?.preventDefault()
            EventBus.$emit(CLOSE_CONTEXT_MENU)

            this.contextMenuX = e?.clientX || e?.pageX || window.screenX / 2
            this.contextMenuY = e?.clientY || e?.pageY || window.screenY / 2

            this.showContextMenu = true
        },

        closeContextMenu() {
            this.showContextMenu = false
        },

        addToQueue() {
            this.$store.dispatch('server/jobQueue/addToQueue', [this.job.filename])
            this.$toast.info(this.$t('History.AddToQueueSuccessful', { filename: this.job.filename }).toString())
        },

        deleteJob() {
            this.$socket.emit(
                'server.history.delete_job',
                { uid: this.job.job_id },
                { action: 'server/history/getDeletedJobs' }
            )
        },

        createThumbnailUrl(thumbnail: FileStateFileThumbnail) {
            let relative_url = ''
            if (this.job.filename.lastIndexOf('/') !== -1) {
                relative_url = this.job.filename.substring(0, this.job.filename.lastIndexOf('/') + 1)
            }

            return `${this.apiUrl}/server/files/gcodes/${escapePath(relative_url + thumbnail.relative_path)}?timestamp=${
                this.job.metadata.modified
            }`
        },
    },
    mounted() {
        EventBus.$on(CLOSE_CONTEXT_MENU, this.closeContextMenu)
    },
    beforeUnmount() {
        EventBus.$off(CLOSE_CONTEXT_MENU, this.closeContextMenu)
    },
})
</script>

<style scoped>
.width-32 {
    width: 32px;
}
</style>
