<template>
    <tr
        :key="item.job_id"
        v-longpress:600="showContextMenu"
        :class="cssClasses"
        @contextmenu="showContextMenu($event)"
        @click="detailsDialogBool = true">
        <td class="pr-0">
            <v-checkbox
                :model-value="isSelected"
                density="compact"
                hide-details
                class="pa-0 mr-0"
                @click.stop="select(!isSelected)" />
        </td>
        <td class="px-0 text-center" style="width: 32px">
            <template v-if="!item.exists">
                <v-icon class="text--disabled">{{ mdiFileCancel }}</v-icon>
            </template>
            <template v-else-if="smallThumbnail && bigThumbnail">
                <v-tooltip top>
                    <template #activator="{ props }">
                        <vue-load-image>
                            <template #image>
                                <img :alt="item.filename" :src="smallThumbnail" width="32" height="32" v-bind="props" />
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
                    <span><img :alt="item.filename" :src="bigThumbnail" width="250" /></span>
                </v-tooltip>
            </template>
            <template v-else-if="smallThumbnail">
                <vue-load-image>
                    <template #image>
                        <img :alt="item.filename" :src="smallThumbnail" width="32" height="32" />
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
            <template v-else>
                <v-icon>{{ mdiFile }}</v-icon>
            </template>
        </td>
        <td>{{ item.filename }}</td>
        <td class="text-right text-no-wrap">
            <template v-if="'note' in item && item.note">
                <v-tooltip top>
                    <template #activator="{ props }">
                        <v-icon size="small" class="mr-2" v-bind="props">
                            {{ mdiNoteTextOutline }}
                        </v-icon>
                    </template>
                    <span v-html="item.note.replaceAll('\n', '<br />')" />
                </v-tooltip>
            </template>
            <v-tooltip top>
                <template #activator="{ props }">
                    <span v-bind="props">
                        <v-icon size="small" :color="statusColor" :disabled="!item.exists">
                            {{ statusIcon }}
                        </v-icon>
                    </span>
                </template>
                <span>{{ statusName }}</span>
            </v-tooltip>
        </td>
        <td v-for="col in tableFields" :key="col.value" class="text-no-wrap" v-html="outputValue(col, item)" />
        <!-- Context menu -->
        <v-menu
            v-model="contextMenuBool"
            :position-x="contextMenuX"
            :position-y="contextMenuY"
            absolute
            location="bottom">
            <v-list>
                <v-list-item @click="detailsDialogBool = true">
                    <v-icon class="mr-1">{{ mdiTextBoxSearch }}</v-icon>
                    {{ $t('History.Details') }}
                </v-list-item>
                <v-list-item v-if="item.note" @click="editNote">
                    <v-icon class="mr-1">{{ mdiNoteEditOutline }}</v-icon>
                    {{ $t('History.EditNote') }}
                </v-list-item>
                <v-list-item v-else @click="createNote">
                    <v-icon class="mr-1">{{ mdiNotePlusOutline }}</v-icon>
                    {{ $t('History.AddNote') }}
                </v-list-item>
                <v-list-item
                    v-if="item.exists && file"
                    :disabled="printerIsPrinting || !klipperReadyForGui"
                    @click="startPrintDialogBool = true">
                    <v-icon class="mr-1">{{ mdiPrinter }}</v-icon>
                    {{ $t('History.Reprint') }}
                </v-list-item>
                <v-list-item v-if="item.exists && isJobQueueAvailable" @click="addToQueue">
                    <v-icon class="mr-1">{{ mdiPlaylistPlus }}</v-icon>
                    {{ $t('Files.AddToQueue') }}
                </v-list-item>
                <v-list-item v-if="item.exists && isJobQueueAvailable" @click="addBatchToQueueDialogBool = true">
                    <v-icon class="mr-1">{{ mdiPlaylistPlus }}</v-icon>
                    {{ $t('Files.AddBatchToQueue') }}
                </v-list-item>
                <v-list-item class="red--text" @click="deleteJob">
                    <v-icon class="mr-1" color="error">{{ mdiDelete }}</v-icon>
                    {{ $t('Buttons.Delete') }}
                </v-list-item>
            </v-list>
        </v-menu>
        <history-list-panel-details-dialog v-model="detailsDialogBool" :job="item" />
        <history-list-panel-note-dialog v-model="noteDialogBool" :type="noteDialogType" :job="item" />
        <add-batch-to-queue-dialog v-model="addBatchToQueueDialogBool" :show-toast="true" :filename="item.filename" />
        <start-print-dialog
            v-if="item.exists && file"
            v-model="startPrintDialogBool"
            :file="file"
            :current-path="currentPath" />
    </tr>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import type { LongpressEvent } from '@/directives/longpress'
import HistoryListPanelDetailsDialog from '@/components/dialogs/HistoryListPanelDetailsDialog.vue'
import BaseMixin from '@/components/mixins/base'
import StartPrintDialog from '@/components/dialogs/StartPrintDialog.vue'
import { FileStateFileThumbnail, FileStateGcodefile } from '@/store/files/types'
import { ServerHistoryStateJob } from '@/store/server/history/types'
import { thumbnailBigMin, thumbnailSmallMax, thumbnailSmallMin } from '@/store/variables'
import {
    mdiCloseThick,
    mdiDelete,
    mdiFile,
    mdiFileCancel,
    mdiNoteEditOutline,
    mdiNotePlusOutline,
    mdiNoteTextOutline,
    mdiPlaylistPlus,
    mdiPrinter,
    mdiTextBoxSearch,
} from '@mdi/js'
import { CLOSE_CONTEXT_MENU, EventBus } from '@/plugins/eventBus'
import {
    convertPrintStatusIcon,
    convertPrintStatusIconColor,
    escapePath,
    formatFilesize,
    formatPrintTime,
} from '@/plugins/helpers'
import { HistoryListPanelCol } from '@/store/server/history/types'
import HistoryListPanelNoteDialog from '@/components/dialogs/HistoryListPanelNoteDialog.vue'
import AddBatchToQueueDialog from '@/components/dialogs/AddBatchToQueueDialog.vue'

export default defineComponent({
    name: 'HistoryListPanel',
    components: {
        AddBatchToQueueDialog,
        HistoryListPanelNoteDialog,
        HistoryListPanelDetailsDialog,
        StartPrintDialog,
    },
    mixins: [BaseMixin],
    props: {
        item: { type: Object, required: true },
        tableFields: { type: Array, required: true },
        isSelected: { type: Boolean, required: true },
    },
    emits: ['select'],
    data() {
        return {
            mdiCloseThick: mdiCloseThick,
            mdiDelete: mdiDelete,
            mdiFile: mdiFile,
            mdiFileCancel: mdiFileCancel,
            mdiNoteEditOutline: mdiNoteEditOutline,
            mdiNotePlusOutline: mdiNotePlusOutline,
            mdiNoteTextOutline: mdiNoteTextOutline,
            mdiPrinter: mdiPrinter,
            mdiTextBoxSearch: mdiTextBoxSearch,
            mdiPlaylistPlus: mdiPlaylistPlus,
            detailsDialogBool: false,
            contextMenuBool: false,
            contextMenuX: 0,
            contextMenuY: 0,
            noteDialogBool: false,
            noteDialogType: 'create' as 'create' | 'edit',
            addBatchToQueueDialogBool: false,
            startPrintDialogBool: false,
        }
    },
    computed: {
        file(): FileStateGcodefile | undefined {
            return this.$store.getters['files/getFile']('gcodes/' + this.item.filename) ?? undefined
        },
        currentPath(): string {
            const lastSlash = this.item.filename.lastIndexOf('/')
            return lastSlash > 0 ? '/' + this.item.filename.slice(0, lastSlash) : ''
        },
        smallThumbnail() {
            if ((this.item.metadata?.thumbnails?.length ?? 0) < 1) return false

            const thumbnail = this.item.metadata?.thumbnails?.find(
                (thumb) =>
                    thumb.width >= thumbnailSmallMin &&
                    thumb.width <= thumbnailSmallMax &&
                    thumb.height >= thumbnailSmallMin &&
                    thumb.height <= thumbnailSmallMax
            )

            return thumbnail ? this.createThumbnailUrl(thumbnail) : false
        },
        bigThumbnail() {
            if ((this.item.metadata?.thumbnails?.length ?? 0) < 1) return false

            const thumbnail = this.item.metadata?.thumbnails?.find((thumb) => thumb.width >= thumbnailBigMin)

            return thumbnail ? this.createThumbnailUrl(thumbnail) : false
        },
        statusIcon() {
            return convertPrintStatusIcon(this.item.status)
        },
        statusColor() {
            return convertPrintStatusIconColor(this.item.status)
        },
        statusName() {
            // check if translation exists
            if (!this.$t(`History.StatusValues.${this.item.status}`, 'en')) return this.item.status.replace(/_/g, ' ')

            return this.$t(`History.StatusValues.${this.item.status}`)
        },
        cssClasses() {
            const output = ['file-list-cursor', 'user-select-none']

            if (!this.item.exists) output.push('text--disabled')

            return output
        },
        isJobQueueAvailable() {
            return this.moonrakerComponents.includes('job_queue')
        },
    },
    mounted() {
        EventBus.$on(CLOSE_CONTEXT_MENU, this.closeContextMenu)
    },
    beforeUnmount() {
        EventBus.$off(CLOSE_CONTEXT_MENU, this.closeContextMenu)
    },
    methods: {
        select(newVal: boolean) {
            this.$emit('select', newVal)
        },
        showContextMenu(e: MouseEvent | LongpressEvent) {
            e?.preventDefault()
            EventBus.$emit(CLOSE_CONTEXT_MENU)

            this.contextMenuX = e?.clientX || e?.pageX || window.screenX / 2
            this.contextMenuY = e?.clientY || e?.pageY || window.screenY / 2

            this.contextMenuBool = true
        },
        closeContextMenu() {
            this.contextMenuBool = false
        },
        createNote() {
            this.noteDialogType = 'create'
            this.noteDialogBool = true
        },
        editNote() {
            this.noteDialogType = 'edit'
            this.noteDialogBool = true
        },
        addToQueue() {
            this.$store.dispatch('server/jobQueue/addToQueue', [this.item.filename])
            this.$toast.info(this.$t('History.AddToQueueSuccessful', { filename: this.item.filename }).toString())
        },
        deleteJob() {
            this.$socket.emit(
                'server.history.delete_job',
                { uid: this.item.job_id },
                { action: 'server/history/getDeletedJobs' }
            )
        },
        outputValue(col: HistoryListPanelCol, item: ServerHistoryStateJob) {
            const key = col.value
            let value: string | number | null = null
            if (key in item) {
                const raw = item[key as keyof ServerHistoryStateJob]
                if (typeof raw === 'string' || typeof raw === 'number') value = raw
            } else if (key in item.metadata) {
                const raw = item.metadata[key]
                if (typeof raw === 'string' || typeof raw === 'number') value = raw
            }

            if (key.startsWith('history_field_')) {
                const fieldName = key.replace('history_field_', '')
                const field = item.auxiliary_data?.find((field) => field.name === fieldName)
                if (field && !Array.isArray(field.value))
                    return `${Math.round(field.value * 1000) / 1000} ${field.units}`
            }

            if (value === null) return '--'

            if (key === 'slicer') return `${value}<br />${item.metadata.slicer_version}`

            if (typeof value !== 'number') return value

            switch (col.outputType) {
                case 'filesize':
                    return formatFilesize(value)

                case 'date':
                    return this.formatDateTime(value * 1000)

                case 'time':
                    return formatPrintTime(value, false)

                case 'temp':
                    return value.toFixed() + ' °C'

                case 'length':
                    if (value > 1000) return (value / 1000).toFixed(2) + ' m'

                    return value.toFixed(2) + ' mm'

                default:
                    return value
            }
        },
        createThumbnailUrl(thumbnail: FileStateFileThumbnail) {
            let relative_url = ''
            if (this.item.filename.lastIndexOf('/') !== -1) {
                relative_url = this.item.filename.substring(0, this.item.filename.lastIndexOf('/') + 1)
            }

            return `${this.apiUrl}/server/files/gcodes/${escapePath(relative_url + thumbnail.relative_path)}?timestamp=${
                this.item.metadata.modified
            }`
        },
    },
})
</script>
