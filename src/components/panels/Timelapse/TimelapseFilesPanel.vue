<template>
    <div>
        <panel
            :title="$t('Timelapse.TimelapseFiles')"
            :icon="mdiFileDocumentMultipleOutline"
            card-class="timelapse-files-panel">
            <v-card-text>
                <v-row>
                    <v-col cols="12" class="d-flex align-center">
                        <v-text-field
                            v-model="search"
                            :append-inner-icon="mdiMagnify"
                            :label="$t('Timelapse.Search')"
                            single-line
                            variant="outlined"
                            clearable
                            hide-details
                            density="compact"
                            style="max-width: 300px"></v-text-field>
                        <v-spacer></v-spacer>
                        <v-btn
                            v-if="selectedFiles.length"
                            :title="$t('Timelapse.Download')"
                            color="primary"
                            class="px-2 minwidth-0 ml-3"
                            :loading="loadings.includes('timelapseDownloadZip')"
                            @click="downloadSelectedFiles">
                            <v-icon>{{ mdiCloudDownload }}</v-icon>
                        </v-btn>
                        <v-btn
                            v-if="selectedFiles.length"
                            :title="$t('Buttons.Delete')"
                            color="error"
                            class="px-2 minwidth-0 ml-3"
                            @click="deleteSelectedDialog = true">
                            <v-icon>{{ mdiDelete }}</v-icon>
                        </v-btn>
                        <v-btn
                            v-if="directoryPermissions.includes('w')"
                            :title="$t('Timelapse.CreateNewDirectory')"
                            class="px-2 minwidth-0 ml-3"
                            @click="createDirectory">
                            <v-icon>{{ mdiFolderPlus }}</v-icon>
                        </v-btn>
                        <v-btn
                            :title="$t('Timelapse.RefreshCurrentDirectory')"
                            class="px-2 minwidth-0 ml-3"
                            @click="refreshFileList">
                            <v-icon>{{ mdiRefresh }}</v-icon>
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-text>
                <v-row>
                    <v-col cols="12" class="py-2 d-flex align-center">
                        <span>
                            <b class="mr-1">{{ $t('Timelapse.CurrentPath') }}:</b>
                            <path-navigation
                                :path="currentPathForNavigation"
                                :base-directory-label="`/${rootDirectory}`"
                                :on-segment-click="clickPathNavGoToDirectory" />
                        </span>
                        <v-spacer></v-spacer>
                        <template v-if="disk_usage !== null">
                            <v-tooltip location="top">
                                <template #activator="{ props }">
                                    <span v-bind="props">
                                        <b>{{ $t('Timelapse.FreeDisk') }}:</b>
                                        {{ formatFilesize(disk_usage.free) }}
                                    </span>
                                </template>
                                <span>
                                    {{ $t('Timelapse.Used') }}: {{ formatFilesize(disk_usage.used) }}
                                    <br />
                                    {{ $t('Timelapse.Free') }}: {{ formatFilesize(disk_usage.free) }}
                                    <br />
                                    {{ $t('Timelapse.Total') }}: {{ formatFilesize(disk_usage.total) }}
                                </span>
                            </v-tooltip>
                        </template>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-divider class="mb-3"></v-divider>
            <v-data-table
                v-model="selectedFiles"
                v-model:sort-by="sortByTable"
                v-model:items-per-page="countPerPage"
                :items="displayFiles"
                class="files-table"
                :headers="headers"
                :items-per-page-text="$t('Timelapse.Files')"
                :items-per-page-options="itemsPerPageOptions"
                item-value="filename"
                return-object
                :search="search"
                :custom-filter="advancedSearch"
                mobile-breakpoint="0"
                show-select>
                <template #no-data>
                    <div class="text-center font-italic">{{ $t('Timelapse.Empty') }}</div>
                </template>

                <template v-if="currentPath !== rootDirectory" #body.prepend>
                    <tr class="file-list-cursor" @click="clickRowGoBack">
                        <td class="pr-0 text-center" style="width: 32px">
                            <v-icon>{{ mdiFolderUpload }}</v-icon>
                        </td>
                        <td class=" " :colspan="headers.length">..</td>
                    </tr>
                </template>

                <template #item="{ index, item, internalItem, isSelected, toggleSelect }">
                    <tr
                        :key="`${index} ${item.filename}`"
                        v-longpress:600="{ handler: showContextMenu, args: [item] }"
                        class="file-list-cursor user-select-none"
                        @contextmenu="showContextMenu($event, item)"
                        @click="clickRow(item)">
                        <td class="file-list__select-td pr-0">
                            <v-checkbox-btn
                                v-ripple
                                :model-value="isSelected(internalItem)"
                                class="pa-0 mr-0"
                                @click.stop="toggleSelect(internalItem)"></v-checkbox-btn>
                        </td>
                        <td class="px-0 text-center" style="width: 32px">
                            <template v-if="item.isDirectory">
                                <v-icon width="32">{{ mdiFolder }}</v-icon>
                            </template>
                            <template v-else-if="item.filename.endsWith('zip')">
                                <v-icon width="32">{{ mdiFolderZipOutline }}</v-icon>
                            </template>
                            <template v-else-if="getThumbnail(item)">
                                <v-tooltip
                                    v-if="!item.isDirectory && getThumbnail(item)"
                                    location="top"
                                    content-class="tooltip__content-opacity1">
                                    <template #activator="{ props }">
                                        <vue-load-image>
                                            <template #image>
                                                <img
                                                    :src="getThumbnail(item)"
                                                    :alt="item.filename"
                                                    width="32"
                                                    v-bind="props" />
                                            </template>
                                            <template #preloader>
                                                <div>
                                                    <v-progress-circular
                                                        indeterminate
                                                        color="primary"></v-progress-circular>
                                                </div>
                                            </template>
                                            <template #error>
                                                <div>
                                                    <v-icon>{{ mdiFile }}</v-icon>
                                                </div>
                                            </template>
                                        </vue-load-image>
                                    </template>
                                    <span><img :src="getThumbnail(item)" :alt="item.filename" width="250" /></span>
                                </v-tooltip>
                            </template>
                            <template v-else>
                                <v-icon>{{ mdiFile }}</v-icon>
                            </template>
                        </td>
                        <td class=" ">{{ item.filename }}</td>
                        <td
                            v-if="headers.find((header) => header.key === 'size').visible"
                            class="text-no-wrap text-right">
                            {{ item.isDirectory ? '--' : formatFilesize(item.size) }}
                        </td>
                        <td v-if="headers.find((header) => header.key === 'modified').visible" class="text-right">
                            {{ formatDateTime(item.modified) }}
                        </td>
                    </tr>
                </template>
            </v-data-table>
        </panel>
        <v-menu v-model="contextMenu.shown" :target="[contextMenu.x, contextMenu.y]">
            <v-list>
                <v-list-item v-if="!contextMenu.item.isDirectory" @click="downloadFile(contextMenu.item.filename)">
                    <v-icon class="mr-1">{{ mdiCloudDownload }}</v-icon>
                    {{ $t('Timelapse.Download') }}
                </v-list-item>
                <v-list-item
                    v-if="contextMenu.item.isDirectory && contextMenu.item.permissions.includes('w')"
                    @click="renameDirectory(contextMenu.item)">
                    <v-icon class="mr-1">{{ mdiRenameBox }}</v-icon>
                    {{ $t('Timelapse.Rename') }}
                </v-list-item>
                <v-list-item
                    v-if="!contextMenu.item.isDirectory && contextMenu.item.permissions.includes('w')"
                    @click="renameFile(contextMenu.item)">
                    <v-icon class="mr-1">{{ mdiRenameBox }}</v-icon>
                    {{ $t('Timelapse.Rename') }}
                </v-list-item>
                <v-list-item
                    v-if="!contextMenu.item.isDirectory && contextMenu.item.permissions.includes('w')"
                    class="red--text"
                    @click="deleteDialog = true">
                    <v-icon class="mr-1" color="error">{{ mdiDelete }}</v-icon>
                    {{ $t('Buttons.Delete') }}
                </v-list-item>
                <v-list-item
                    v-if="contextMenu.item.isDirectory && contextMenu.item.permissions.includes('w')"
                    class="red--text"
                    @click="deleteDirectory(contextMenu.item)">
                    <v-icon class="mr-1" color="error">{{ mdiDelete }}</v-icon>
                    {{ $t('Buttons.Delete') }}
                </v-list-item>
            </v-list>
        </v-menu>
        <v-dialog v-model="dialogRenameFile.show" max-width="400">
            <panel
                :title="$t('Timelapse.RenameFile')"
                card-class="gcode-files-rename-file-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="dialogRenameFile.show = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <v-text-field
                        ref="inputFieldRenameFile"
                        v-model="dialogRenameFile.newName"
                        :label="$t('Timelapse.Name')"
                        required
                        :rules="nameInputRules"
                        @update:error="(bool) => (isInvalidName = bool)"
                        @keypress.enter="renameFileAction"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" variant="text" @click="dialogRenameFile.show = false">
                        {{ $t('Buttons.Cancel') }}
                    </v-btn>
                    <v-btn :disabled="isInvalidName" color="primary" variant="text" @click="renameFileAction">
                        {{ $t('Timelapse.Rename') }}
                    </v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
        <v-dialog v-model="dialogCreateDirectory.show" max-width="400">
            <panel
                :title="$t('Timelapse.NewDirectory')"
                card-class="gcode-files-new-directory-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="dialogCreateDirectory.show = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <v-text-field
                        ref="inputFieldCreateDirectory"
                        v-model="dialogCreateDirectory.name"
                        :label="$t('Timelapse.Name')"
                        required
                        :rules="nameInputRules"
                        @update:error="(bool) => (isInvalidName = bool)"
                        @keypress.enter="createDirectoryAction"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" variant="text" @click="dialogCreateDirectory.show = false">
                        {{ $t('Buttons.Cancel') }}
                    </v-btn>
                    <v-btn :disabled="isInvalidName" color="primary" variant="text" @click="createDirectoryAction">
                        {{ $t('Timelapse.Create') }}
                    </v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
        <v-dialog v-model="dialogRenameDirectory.show" max-width="400">
            <panel
                :title="$t('Timelapse.RenameDirectory')"
                card-class="gcode-files-rename-directory-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="dialogRenameDirectory.show = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <v-text-field
                        ref="inputFieldRenameDirectory"
                        v-model="dialogRenameDirectory.newName"
                        :label="$t('Timelapse.Name')"
                        required
                        :rules="nameInputRules"
                        @update:error="(bool) => (isInvalidName = bool)"
                        @keyup.enter="renameDirectoryAction"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" variant="text" @click="dialogRenameDirectory.show = false">
                        {{ $t('Buttons.Cancel') }}
                    </v-btn>
                    <v-btn :disabled="isInvalidName" color="primary" variant="text" @click="renameDirectoryAction">
                        {{ $t('Timelapse.Rename') }}
                    </v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
        <confirmation-dialog
            v-model="dialogDeleteDirectory.show"
            :title="$t('Timelapse.DeleteDirectory')"
            :text="$t('Timelapse.DeleteDirectoryQuestion', { name: dialogDeleteDirectory.item.filename })"
            :action-button-text="$t('Buttons.Delete')"
            @action="deleteDirectoryAction" />
        <v-dialog v-model="boolVideoDialog" :max-width="700">
            <panel
                :title="$t('Timelapse.Video')"
                :icon="mdiFileVideo"
                card-class="timelapse-video-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="boolVideoDialog = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text class="">
                    <v-row>
                        <v-col class="pb-0">
                            <video :src="apiUrl + '/server/files/' + videoDialogFilename" controls style="width: 100%">
                                Sorry, your browser doesn't support embedded videos, but don't worry, you can
                                <a :href="apiUrl + '/server/files/' + videoDialogFilename">download it</a>
                                and watch it with your favorite video player!
                            </video>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="text-center">
                            <v-btn
                                variant="text"
                                color="primary"
                                :href="apiUrl + '/server/files/' + videoDialogFilename"
                                target="_blank">
                                {{ $t('Timelapse.Download') }}
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-card-text>
            </panel>
        </v-dialog>

        <!-- CONFIRM DELETE SINGLE FILE DIALOG -->
        <confirmation-dialog
            v-model="deleteDialog"
            :title="$t('Timelapse.Delete')"
            :text="$t('Timelapse.DeleteSingleFileQuestion', { name: contextMenu.item.filename })"
            :action-button-text="$t('Buttons.Delete')"
            @action="removeFile" />

        <!-- CONFIRM DELETE MULTIPLE FILES DIALOG -->
        <confirmation-dialog
            v-model="deleteSelectedDialog"
            :title="$t('Timelapse.Delete')"
            :text="deleteSelectedDialogText"
            :action-button-text="$t('Buttons.Delete')"
            @action="deleteSelectedFiles" />
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import type { LongpressEvent } from '@/directives/longpress'
import BaseMixin from '@/components/mixins/base'
import { escapePath, formatFilesize } from '@/plugins/helpers'
import { FileStateFile, FileStateGcodefile } from '@/store/files/types'
import Panel from '@/components/ui/Panel.vue'
import PathNavigation from '@/components/ui/PathNavigation.vue'
import {
    mdiFolderPlus,
    mdiCloseThick,
    mdiFileDocumentMultipleOutline,
    mdiFileVideo,
    mdiFolder,
    mdiFolderUpload,
    mdiMagnify,
    mdiFile,
    mdiFolderZipOutline,
    mdiRefresh,
    mdiCloudDownload,
    mdiRenameBox,
    mdiDelete,
} from '@mdi/js'
import ConfirmationDialog from '@/components/dialogs/ConfirmationDialog.vue'
import type { FocusableRef } from '@/types/vuetify'

interface dialogRenameObject {
    show: boolean
    newName: string
    item: FileStateFile
}

type SortByTableEntry = { key: string; order?: boolean | 'asc' | 'desc' }

export default defineComponent({
    name: 'TimelapseFilesPanel',
    components: { ConfirmationDialog, Panel, PathNavigation },
    mixins: [BaseMixin],
    data() {
        return {
            formatFilesize: formatFilesize,

            mdiFileVideo: mdiFileVideo,
            mdiCloseThick: mdiCloseThick,
            mdiFileDocumentMultipleOutline: mdiFileDocumentMultipleOutline,
            mdiMagnify: mdiMagnify,
            mdiFolderPlus: mdiFolderPlus,
            mdiRefresh: mdiRefresh,
            mdiFolderUpload: mdiFolderUpload,
            mdiFolder: mdiFolder,
            mdiFolderZipOutline: mdiFolderZipOutline,
            mdiFile: mdiFile,
            mdiCloudDownload: mdiCloudDownload,
            mdiRenameBox: mdiRenameBox,
            mdiDelete: mdiDelete,

            search: '',
            boolVideoDialog: false,
            videoDialogFilename: '',

            dialogCreateDirectory: {
                show: false,
                name: '',
            },

            contextMenu: {
                shown: false,
                isDirectory: false,
                touchTimer: undefined,
                x: 0,
                y: 0,
                item: {
                    isDirectory: false,
                    filename: '',
                    permissions: '',
                    modified: new Date(),
                } as FileStateFile,
            },

            dialogRenameFile: {
                show: false,
                newName: '',
                item: {
                    isDirectory: false,
                    filename: '',
                    permissions: '',
                    modified: new Date(),
                },
            } as dialogRenameObject,

            dialogRenameDirectory: {
                show: false,
                newName: '',
                item: {
                    isDirectory: false,
                    filename: '',
                    permissions: '',
                    modified: new Date(),
                },
            } as dialogRenameObject,

            dialogDeleteDirectory: {
                show: false,
                newName: '',
                item: {
                    isDirectory: false,
                    filename: '',
                    permissions: '',
                    modified: new Date(),
                },
            } as dialogRenameObject,

            deleteDialog: false,
            deleteSelectedDialog: false,

            isInvalidName: true,
            nameInputRules: [
                (value: string) => !!value || this.$t('Files.InvalidNameEmpty'),
                (value: string) => !this.existsFilename(value) || this.$t('Files.InvalidNameAlreadyExists'),
            ],

            rootDirectory: 'timelapse',
        }
    },
    computed: {
        headers() {
            return [
                {
                    title: '',
                    key: '',
                    align: 'start' as const,
                    configable: false,
                    visible: true,
                    sortable: false,
                },
                {
                    title: this.$t('Timelapse.Name'),
                    key: 'filename',
                    align: 'start' as const,
                    configable: false,
                    visible: true,
                    sortRaw: (a: FileStateFile, b: FileStateFile) => this.sortRawFiles(a, b, 'filename'),
                },
                {
                    title: this.$t('Timelapse.Filesize'),
                    key: 'size',
                    align: 'end' as const,
                    configable: true,
                    visible: true,
                    sortRaw: (a: FileStateFile, b: FileStateFile) => this.sortRawFiles(a, b, 'size'),
                },
                {
                    title: this.$t('Timelapse.LastModified'),
                    key: 'modified',
                    align: 'end' as const,
                    configable: true,
                    visible: true,
                    sortRaw: (a: FileStateFile, b: FileStateFile) => this.sortRawFiles(a, b, 'modified'),
                },
            ]
        },

        itemsPerPageOptions() {
            return [
                { value: 10, title: '10' },
                { value: 25, title: '25' },
                { value: 50, title: '50' },
                { value: 100, title: '100' },
                { value: -1, title: this.$t('Timelapse.AllFiles').toString() },
            ]
        },

        directory() {
            return this.$store.getters['files/getDirectory'](this.currentPath)
        },

        disk_usage() {
            return this.directory?.disk_usage ?? { used: 0, free: 0, total: 0 }
        },

        directoryPermissions() {
            return this.directory?.permissions ?? 'r'
        },

        files(): FileStateFile[] {
            return [...(this.directory?.childrens ?? [])]
        },

        sortBy: {
            get(): string {
                return this.$store.state.gui.view.gcodefiles.sortBy ?? 'modified'
            },
            set(newVal: string | undefined) {
                if (newVal === undefined) newVal = 'modified'

                this.$store.dispatch('gui/saveSetting', { name: 'view.timelapse.sortBy', value: newVal })
            },
        },

        sortDesc: {
            get(): boolean {
                return this.$store.state.gui.view.gcodefiles.sortDesc ?? true
            },
            set(newVal: boolean | undefined) {
                if (newVal === undefined) newVal = false

                this.$store.dispatch('gui/saveSetting', { name: 'view.timelapse.sortDesc', value: newVal })
            },
        },

        sortByTable: {
            get(): SortByTableEntry[] {
                return [{ key: this.sortBy, order: this.sortDesc ? 'desc' : 'asc' }]
            },
            set(newVal: SortByTableEntry[]) {
                const first = newVal?.length ? newVal[0] : undefined

                this.sortBy = first?.key
                this.sortDesc = first === undefined ? undefined : first.order === 'desc' || first.order === true
            },
        },

        countPerPage: {
            get(): number {
                return this.$store.state.gui.view.timelapse?.countPerPage ?? 10
            },
            set(newVal: number) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.timelapse.countPerPage', value: newVal })
            },
        },

        displayFiles() {
            return (
                this.files?.filter((file) => {
                    if (file.isDirectory) return true

                    return file.filename.endsWith('mp4') || file.filename.endsWith('zip')
                }) ?? []
            )
        },

        currentPath: {
            get(): string {
                return this.$store.state.gui.view.timelapse.currentPath
            },
            set(newVal: string) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.timelapse.currentPath', value: newVal })
            },
        },

        currentPathForNavigation() {
            if (this.currentPath === this.rootDirectory) {
                return ''
            }

            return this.currentPath.substring(this.rootDirectory.length)
        },

        selectedFiles: {
            get(): FileStateFile[] {
                return this.$store.state.gui.view.timelapse.selectedFiles ?? []
            },
            set(newVal: FileStateFile[]) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.timelapse.selectedFiles', value: newVal })
            },
        },

        deleteSelectedDialogText(): string {
            if (this.selectedFiles.length === 1) {
                return this.$t('Timelapse.DeleteSingleFileQuestion', {
                    name: this.selectedFiles[0].filename,
                }).toString()
            }

            return this.$t('Timelapse.DeleteSelectedQuestion', {
                count: this.selectedFiles.length,
            }).toString()
        },
    },
    methods: {
        existsFilename(name: string) {
            return this.files.findIndex((file) => file.filename === name) >= 0
        },

        /**
         * Replacement for the removed v-data-table custom-sort prop. Replicates the
         * sortFiles helper: directories always first, then compare by column value.
         * The table negates the result for descending order, so the directory
         * comparison is pre-negated to keep directories on top in both directions.
         */
        sortRawFiles(a: FileStateFile, b: FileStateFile, key: string): number {
            const dirCompare = a.isDirectory === b.isDirectory ? 0 : a.isDirectory ? -1 : 1
            if (dirCompare !== 0) return this.sortDesc ? -dirCompare : dirCompare

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const valueA = (a as any)[key]
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const valueB = (b as any)[key]

            if (valueA === valueB) return 0
            if (valueA === null || valueA === undefined) return -1
            if (valueB === null || valueB === undefined) return 1

            if (typeof valueA === 'string' && typeof valueB === 'string') {
                return valueA.localeCompare(valueB, undefined, { sensitivity: 'base' })
            }

            if (valueA instanceof Date && valueB instanceof Date) {
                return valueA.getTime() - valueB.getTime()
            }

            if (typeof valueA === 'number' && typeof valueB === 'number') {
                return valueA - valueB
            }

            return String(valueA).localeCompare(String(valueB), undefined, { numeric: true, sensitivity: 'base' })
        },

        createDirectory() {
            this.dialogCreateDirectory.name = ''
            this.dialogCreateDirectory.show = true

            setTimeout(() => {
                ;(this.$refs.inputFieldCreateDirectory as FocusableRef | undefined)?.focus()
            }, 200)
        },

        createDirectoryAction() {
            this.dialogCreateDirectory.show = false

            this.$socket.emit(
                'server.files.post_directory',
                {
                    path: this.currentPath + '/' + this.dialogCreateDirectory.name,
                },
                { action: 'files/getCreateDir' }
            )
        },

        refreshFileList() {
            this.$socket.emit(
                'server.files.get_directory',
                { path: this.currentPath },
                { action: 'files/getDirectory' }
            )
        },

        advancedSearch(value: string | number, search: string) {
            return (
                value != null &&
                search != null &&
                typeof value === 'string' &&
                value.toString().toLowerCase().indexOf(search.toLowerCase()) !== -1
            )
        },

        getThumbnail(item: FileStateFile) {
            const filename = item.filename.slice(0, item.filename.lastIndexOf('.'))
            const preview = this.files?.find((file) => file.filename === filename + '.jpg')
            if (preview) {
                return `${this.apiUrl}/server/files/${escapePath(this.currentPath)}/${escapePath(
                    preview.filename
                )}?timestamp=${preview.modified.getTime()}`
            }

            return ''
        },

        clickRow(item: FileStateFile, force = false) {
            if (!this.contextMenu.shown || force) {
                if (force) this.contextMenu.shown = false

                if (item.isDirectory) this.currentPath += '/' + item.filename
                else if (item.filename.endsWith('zip')) {
                    this.downloadFile(item.filename)
                } else if (item.filename.endsWith('mp4')) {
                    this.videoDialogFilename = escapePath(`${this.currentPath}/${item.filename}`)
                    this.boolVideoDialog = true
                }
            }
        },

        clickRowGoBack() {
            this.currentPath = this.currentPath.slice(0, this.currentPath.lastIndexOf('/'))
        },

        clickPathNavGoToDirectory(segment: { location: string }) {
            this.currentPath = `${this.rootDirectory}${segment.location}`
        },

        showContextMenu(e: MouseEvent | LongpressEvent, item: FileStateFile) {
            if (!this.contextMenu.shown) {
                e?.preventDefault()
                this.contextMenu.shown = true
                this.contextMenu.x = e?.clientX || e?.pageX || window.screenX / 2
                this.contextMenu.y = e?.clientY || e?.pageY || window.screenY / 2
                this.contextMenu.item = item
                this.$nextTick(() => {
                    this.contextMenu.shown = true
                })
            }
        },

        existsFramesZip(item: FileStateFile) {
            const posLastPoint = item.filename.lastIndexOf('.')
            const zipFilename = item.filename.slice(0, posLastPoint) + '.zip'

            return this.files.findIndex((file) => file.filename === zipFilename) !== -1
        },

        downloadFile(filename: string) {
            const path = this.currentPath + '/' + filename
            const href = this.apiUrl + '/server/files/' + escapePath(path)

            window.open(href)
        },

        async downloadSelectedFiles() {
            const items: string[] = []

            const addElementToItems = async (absolutPath: string, directory: FileStateFile[]) => {
                for (const file of directory) {
                    const filePath = `${absolutPath}/${file.filename}`

                    if (file.isDirectory && file.childrens) {
                        await addElementToItems(filePath, file.childrens)

                        continue
                    }

                    items.push(filePath)

                    if (file.filename.endsWith('.mp4')) {
                        const indexLastPoint = file.filename.lastIndexOf('.')
                        const filenameWithoutExtension = file.filename.slice(0, indexLastPoint)
                        const filenameJpg = `${filenameWithoutExtension}.jpg`

                        if (this.files.some((f: FileStateFile) => f.filename === filenameJpg)) {
                            items.push(`${absolutPath}/${filenameJpg}`)
                        }
                    }
                }
            }

            await addElementToItems(this.currentPath, this.selectedFiles)
            const date = new Date()
            const timestamp = `${date.getFullYear()}${date.getMonth()}${date.getDate()}-${date.getHours()}${date.getMinutes()}${date.getSeconds()}`

            this.$socket.emit(
                'server.files.zip',
                { items, dest: `timelapse/timelapse-${timestamp}.zip` },
                { action: 'files/downloadZip', loading: 'timelapseDownloadZip' }
            )

            this.selectedFiles = []
        },

        renameFile(item: FileStateFile) {
            const posLastPoint = item.filename.lastIndexOf('.')
            this.dialogRenameFile.newName = item.filename.slice(0, posLastPoint)

            this.dialogRenameFile.item = item
            this.dialogRenameFile.show = true

            setTimeout(() => {
                ;(this.$refs.inputFieldRenameFile as FocusableRef | undefined)?.focus()
            }, 200)
        },

        renameFileAction() {
            const posLastPoint = this.dialogRenameFile.item.filename.lastIndexOf('.')
            const oldNameWithoutExtension = this.dialogRenameFile.item.filename.slice(0, posLastPoint)
            const fileExtension = this.dialogRenameFile.item.filename.split('.').pop()

            this.dialogRenameFile.show = false

            /**
             * rename the file regardless of its file-extension
             */
            this.$socket.emit(
                'server.files.move',
                {
                    source: `${this.currentPath}/${this.dialogRenameFile.item.filename}`,
                    dest: `${this.currentPath}/${this.dialogRenameFile.newName}.${fileExtension}`,
                },
                { action: 'files/getMove' }
            )

            if (fileExtension !== 'mp4') return

            /**
             * mp4 and jpg always require to have the same name as the
             * jpg is used as a mp4-thumbnail in the timelapse file-browser
             */
            const fileJpg = this.files.find((file) => file.filename === `${oldNameWithoutExtension}.jpg`)

            if (fileJpg) {
                this.$socket.emit('server.files.move', {
                    source: `${this.currentPath}/${oldNameWithoutExtension}.jpg`,
                    dest: `${this.currentPath}/${this.dialogRenameFile.newName}.jpg`,
                })
            }
        },

        renameDirectory(item: FileStateFile) {
            this.dialogRenameDirectory.item = item
            this.dialogRenameDirectory.newName = item.filename
            this.dialogRenameDirectory.show = true

            setTimeout(() => {
                ;(this.$refs.inputFieldRenameDirectory as FocusableRef | undefined)?.focus()
            }, 200)
        },

        renameDirectoryAction() {
            this.dialogRenameDirectory.show = false
            this.$socket.emit(
                'server.files.move',
                {
                    source: this.currentPath + '/' + this.dialogRenameDirectory.item.filename,
                    dest: this.currentPath + '/' + this.dialogRenameDirectory.newName,
                },
                { action: 'files/getMove' }
            )
        },

        removeFile() {
            const filename = this.contextMenu.item.filename.slice(0, this.contextMenu.item.filename.lastIndexOf('.'))
            const fileExtension = this.contextMenu.item.filename.split('.').pop()

            /**
             * delete the file regardless of its file-extension
             */
            this.$socket.emit(
                'server.files.delete_file',
                { path: this.currentPath + '/' + this.contextMenu.item.filename },
                { action: 'files/getDeleteFile' }
            )

            if (fileExtension !== 'mp4') return

            /**
             * if file-extension is mp4, also delete its corresponding thumbnail jpg
             */
            const previewFilename = filename + '.jpg'
            const previewExists = this.files.findIndex((file) => file.filename === previewFilename) !== -1

            if (previewExists)
                this.$socket.emit(
                    'server.files.delete_file',
                    { path: this.currentPath + '/' + previewFilename },
                    { action: 'files/getDeleteFile' }
                )
        },

        deleteDirectory(item: FileStateFile) {
            this.dialogDeleteDirectory.item = item
            this.dialogDeleteDirectory.show = true
        },

        deleteDirectoryAction() {
            this.$socket.emit(
                'server.files.delete_directory',
                { path: this.currentPath + '/' + this.contextMenu.item.filename, force: true },
                { action: 'files/getDeleteDir' }
            )
        },

        deleteSelectedFiles() {
            this.selectedFiles.forEach((item: FileStateGcodefile) => {
                if (item.isDirectory) {
                    this.$socket.emit(
                        'server.files.delete_directory',
                        { path: this.currentPath + '/' + item.filename, force: true },
                        { action: 'files/getDeleteDir' }
                    )
                } else {
                    const filename = item.filename.slice(0, item.filename.lastIndexOf('.'))
                    const fileExtension = item.filename.split('.').pop()

                    this.$socket.emit(
                        'server.files.delete_file',
                        { path: this.currentPath + '/' + item.filename },
                        { action: 'files/getDeleteFile' }
                    )

                    if (fileExtension !== 'mp4') return

                    /**
                     * if file-extension is mp4, also delete its corresponding thumbnail jpg
                     */
                    const previewFilename = filename + '.jpg'
                    const previewExists = this.files.findIndex((file) => file.filename === previewFilename) !== -1

                    if (previewExists)
                        this.$socket.emit(
                            'server.files.delete_file',
                            { path: this.currentPath + '/' + previewFilename },
                            { action: 'files/getDeleteFile' }
                        )
                }
            })

            this.selectedFiles = []
        },
    },
})
</script>

<style scoped>
.v-data-table .v-data-table-header__icon {
    margin-left: 7px;
}

.v-data-table th {
    white-space: nowrap;
}

.v-data-table .file-list-cursor:hover {
    cursor: pointer;
}
</style>
