<template>
    <div>
        <v-dialog
            v-model="show"
            persistent
            fullscreen
            hide-overlay
            :transition="false"
            @close="close"
            @keydown.esc="escClose"
            @keydown.ctrl.shift.s.prevent="restartServiceNameExists && save(restartServiceName)"
            @keydown.meta.shift.s.prevent="restartServiceNameExists && save(restartServiceName)"
            @keydown.ctrl.s.prevent="save(null)"
            @keydown.meta.s.prevent="save(null)">
            <panel
                card-class="editor-dialog"
                :icon="isWriteable ? mdiFileDocumentEditOutline : mdiFileDocumentOutline"
                :title="title">
                <template #buttons>
                    <v-btn variant="text" tile class="d-none d-md-flex" @click="dialogDevices = true">
                        <v-icon size="small" class="mr-1">{{ mdiUsb }}</v-icon>
                        {{ $t('Editor.DeviceDialog') }}
                    </v-btn>
                    <v-btn
                        v-if="restartServiceName === 'klipper'"
                        variant="text"
                        tile
                        :href="klipperConfigReference"
                        target="_blank"
                        class="d-none d-md-flex">
                        <v-icon size="small" class="mr-1">{{ mdiHelp }}</v-icon>
                        {{ $t('Editor.ConfigReference') }}
                    </v-btn>
                    <v-btn
                        v-if="existsFileStructure"
                        variant="text"
                        tile
                        class="d-none d-md-flex"
                        @click="toggleFileStructure">
                        <v-icon size="small" class="mr-1">{{ mdiFormatListCheckbox }}</v-icon>
                        {{ $t('Editor.FileStructure') }}
                    </v-btn>
                    <v-btn
                        v-if="restartServiceNameExists"
                        color="primary"
                        variant="text"
                        tile
                        class="d-none d-sm-flex"
                        @click="save(restartServiceName)">
                        <v-icon size="small" class="mr-1">{{ mdiRestart }}</v-icon>
                        {{ $t('Editor.SaveRestart') }}
                    </v-btn>
                    <v-btn v-if="isWriteable" icon tile @click="save(null)">
                        <v-icon>{{ mdiContentSave }}</v-icon>
                    </v-btn>
                    <v-btn icon tile @click="close">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text class="pa-0 d-flex">
                    <codemirror-async
                        v-if="show"
                        ref="editor"
                        v-model="sourcecode"
                        :name="filename"
                        :file-extension="fileExtension"
                        class="codemirror"
                        :class="{ withSidebar: existsFileStructure && fileStructureSidebar }"
                        @lineChange="lineChanges" />
                    <div v-if="existsFileStructure && fileStructureSidebar" class="d-none d-md-flex structure-sidebar">
                        <v-treeview
                            activatable
                            density="compact"
                            :active="structureActive"
                            :open="structureOpen"
                            :item-key="treeviewItemKeyProp"
                            :items="configFileStructure"
                            class="w-100"
                            @update:active="activeChanges">
                            <template #label="{ item }">
                                <div
                                    class="cursor-pointer _structure-sidebar-item"
                                    :class="item.type == 'item' ? 'ͼp' : 'ͼt'"
                                    @click="activeChangesItemClick">
                                    {{ item.name }}
                                </div>
                            </template>
                            <template v-if="restartServiceName === 'klipper'" #append="{ item }">
                                <v-btn
                                    v-if="item.type == 'section'"
                                    icon
                                    size="small"
                                    plain
                                    color="grey darken-2"
                                    :href="klipperConfigReference + '#' + item.name.split(' ')[0]"
                                    target="_blank">
                                    <v-icon size="small" class="mr-1">{{ mdiHelpCircle }}</v-icon>
                                </v-btn>
                            </template>
                        </v-treeview>
                    </div>
                </v-card-text>
            </panel>
        </v-dialog>
        <v-snackbar v-model="loaderBool" :timeout="-1" fixed right bottom>
            <div>
                {{ snackbarHeadline }}
                <br />
                <strong>{{ filename }}</strong>
            </div>
            <template v-if="loaderProgress.total > 0">
                <span class="mr-1">
                    ({{ formatFilesize(loaderProgress.loaded) }}/{{ formatFilesize(loaderProgress.total) }})
                </span>
                {{ Math.round((100 * loaderProgress.loaded) / loaderProgress.total) }} % @ {{ loaderProgress.speed }}/s
                <br />
                <v-progress-linear
                    class="mt-2"
                    :value="(100 * loaderProgress.loaded) / loaderProgress.total"></v-progress-linear>
            </template>
            <template v-else>
                <v-progress-linear class="mt-2" indeterminate></v-progress-linear>
            </template>
            <template #action="{ attrs }">
                <v-btn color="red" variant="text" v-bind="props" style="min-width: auto" tile @click="cancelDownload">
                    <v-icon class="0">{{ mdiClose }}</v-icon>
                </v-btn>
            </template>
        </v-snackbar>
        <v-dialog v-model="dialogConfirmChange" persistent :width="600">
            <panel
                card-class="editor-confirm-change-dialog"
                :icon="mdiHelpCircle"
                :title="$t('Editor.UnsavedChanges')"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="dialogConfirmChange = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text class="pt-3">
                    <v-row>
                        <v-col>
                            <p class="body-1 mb-2">{{ $t('Editor.UnsavedChangesMessage', { filename: filename }) }}</p>
                            <p class="body-2">{{ $t('Editor.UnsavedChangesSubMessage') }}</p>
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn variant="text" @click="discardChanges">
                        {{ $t('Editor.DontSave') }}
                    </v-btn>
                    <v-btn variant="text" color="primary" @click="save">
                        {{ $t('Editor.SaveClose') }}
                    </v-btn>
                    <template v-if="restartServiceNameExists">
                        <v-btn variant="text" color="primary" @click="save(restartServiceName)">
                            {{ $t('Editor.SaveRestart') }}
                        </v-btn>
                    </template>
                </v-card-actions>
            </panel>
        </v-dialog>
        <devices-dialog v-model="dialogDevices" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { capitalize, formatFilesize, windowBeforeUnloadFunction } from '@/plugins/helpers'
import Panel from '@/components/ui/Panel.vue'
import { klipperRepos } from '@/store/variables'
import CodemirrorAsync from '@/components/inputs/CodemirrorAsync'
import type Codemirror from '@/components/inputs/Codemirror.vue'
import {
    mdiClose,
    mdiCloseThick,
    mdiContentSave,
    mdiFileDocumentOutline,
    mdiFileDocumentEditOutline,
    mdiHelp,
    mdiHelpCircle,
    mdiRestart,
    mdiUsb,
    mdiFormatListCheckbox,
} from '@mdi/js'
import DevicesDialog from '@/components/dialogs/DevicesDialog.vue'
import { ConfigFileSection } from '@/store/files/types'

export default defineComponent({
    name: 'TheEditor',
    components: { DevicesDialog, Panel, CodemirrorAsync },
    mixins: [BaseMixin],
    data() {
        return {
            dialogConfirmChange: false,
            dialogDevices: false,
            treeviewItemKeyProp: 'line' as const,
            structureActive: [] as number[],
            structureOpen: [] as number[],
            structureActiveChangedBySidebar: false,
            formatFilesize: formatFilesize,
            /**
             * Icons
             */
            mdiCloseThick: mdiCloseThick,
            mdiHelp: mdiHelp,
            mdiContentSave: mdiContentSave,
            mdiRestart: mdiRestart,
            mdiClose: mdiClose,
            mdiHelpCircle: mdiHelpCircle,
            mdiFileDocumentEditOutline: mdiFileDocumentEditOutline,
            mdiFileDocumentOutline: mdiFileDocumentOutline,
            mdiUsb: mdiUsb,
            mdiFormatListCheckbox: mdiFormatListCheckbox,
        }
    },
    computed: {
        editor(): typeof Codemirror {
            return this.$refs.editor as typeof Codemirror
        },
        changed() {
            return this.$store.state.editor.changed ?? false
        },
        changedOutput() {
            return this.changed ? '*' : ''
        },
        show() {
            return this.$store.state.editor.bool ?? false
        },
        filepath(): string {
            return this.$store.state.editor.filepath ?? ''
        },
        filename(): string {
            return this.$store.state.editor.filename ?? ''
        },
        filenameWithoutExtension(): string {
            if (this.filename.lastIndexOf('.')) return this.filename.slice(0, this.filename.lastIndexOf('.'))

            return this.filename
        },
        fileExtension() {
            if (this.filename.lastIndexOf('.')) return this.filename.slice(this.filename.lastIndexOf('.') + 1)

            return ''
        },
        fileroot() {
            return this.$store.state.editor.fileroot ?? 'gcodes'
        },
        permissions(): string {
            return this.$store.state.editor.permissions ?? 'r'
        },
        isWriteable() {
            return this.permissions.includes('w')
        },
        sourcecode: {
            get() {
                return this.$store.state.editor.sourcecode ?? ''
            },
            setsourcecode(newVal) {
                this.$store.dispatch('editor/updateSourcecode', newVal)
            },
        },
        loaderBool() {
            return this.$store.state.editor.loaderBool ?? false
        },
        loaderProgress() {
            return this.$store.state.editor.loaderProgress ?? {}
        },
        snackbarHeadline() {
            let directionUppercase = this.$t('Editor.Downloading')
            if (this.loaderProgress.direction) directionUppercase = capitalize(this.loaderProgress.direction)

            return this.$t(`Editor.${directionUppercase}`)
        },
        availableServices() {
            return this.$store.state.server.system_info?.available_services ?? []
        },
        restartAllowedOrPossible() {
            if (!this.isWriteable) return null
            if (['printing', 'paused'].includes(this.printer_state)) return null

            return true
        },
        restartServiceName() {
            // check for generic services <service>.conf (like moonraker.conf, crowsnest.conf, sonar.conf)
            if (this.availableServices.includes(this.filenameWithoutExtension) && this.fileExtension === 'conf')
                return this.filenameWithoutExtension

            // old webcam service DEPRECATED
            if (this.filename.startsWith('webcam') && ['conf', 'txt'].includes(this.fileExtension)) return 'webcamd'

            // check for mooncord config files
            if (this.filename.startsWith('mooncord') && this.fileExtension === 'json') return 'mooncord'

            // fallback for moonraker with multi instances
            if (this.filename === 'moonraker.conf') return 'moonraker'

            // all .cfg files will be klipper config files
            if (this.fileExtension === 'cfg') return 'klipper'

            return null
        },
        restartServiceNameExists() {
            if (!this.restartAllowedOrPossible) return false

            // hide the button, if there is no service found
            if (this.restartServiceName === null) return false

            // klipper and moonraker uses specific api calls instead of generic service restart
            if (['klipper', 'moonraker'].includes(this.restartServiceName)) return true

            return this.availableServices.includes(this.restartServiceName)
        },
        confirmUnsavedChanges() {
            return this.$store.state.gui.editor.confirmUnsavedChanges ?? false
        },
        escToClose() {
            return this.$store.state.gui.editor.escToClose ?? false
        },
        title() {
            const title = this.filepath ? `${this.filepath}/${this.filename}` : this.filename

            if (!this.isWriteable) return `${title} (${this.$t('Editor.FileReadOnly')})`

            return `${title} ${this.changedOutput}`
        },
        currentLanguage() {
            return this.$store.state.gui.general.language
        },
        klipperConfigReference(): string {
            const currentLanguage = this.currentLanguage
            const klipperRepo = klipperRepos[this.klipperAppName] ?? klipperRepos.Klipper

            let url = klipperRepo.url
            if (klipperRepo.docsLanguages?.includes(currentLanguage)) {
                url += `${currentLanguage}/`
            }

            url += 'Config_Reference.html'

            return url
        },
        fileStructureSidebar: {
            get() {
                return this.$store.state.gui.editor.fileStructureSidebar
            },
            setfileStructureSidebar(newVal) {
                this.$store.dispatch('gui/saveSetting', { name: 'editor.fileStructureSidebar', value: newVal })
            },
        },
        configFileStructure(): ConfigFileSection[] {
            if (!['conf', 'cfg'].includes(this.fileExtension)) return []

            const lines = this.sourcecode.split(/\n/gi)
            const regex = /^[^#\S]*?(\[(?<section>.*?)]|(?<name>\w+)\s*?[:=])/gim
            const structure: ConfigFileSection[] = []

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i]
                const matches = [...line.matchAll(regex)]

                // break if no matches were found
                if (matches.length === 0) continue

                const match = matches[0]
                if (match['groups']['section']) {
                    structure.push({
                        name: match['groups']['section'],
                        type: 'section',
                        line: i + 1,
                        children: [],
                    })

                    continue
                }

                if (structure.length && match['groups']['name']) {
                    structure[structure.length - 1]['children'].push({
                        name: match['groups']['name'],
                        type: 'item',
                        line: i + 1,
                    })
                }
            }

            return structure
        },
        existsFileStructure() {
            return this.configFileStructure.length > 0
        },
    },
    watch: {
        changed(newVal: boolean) {
            if (!this.confirmUnsavedChanges) return

            if (newVal) {
                window.addEventListener('beforeunload', windowBeforeUnloadFunction)
                return
            }

            window.removeEventListener('beforeunload', windowBeforeUnloadFunction)
        },
    },
    methods: {
        toggleFileStructure() {
            this.fileStructureSidebar = !this.fileStructureSidebar
        },
        cancelDownload() {
            this.$store.dispatch('editor/cancelLoad')
        },
        escClose() {
            if (this.escToClose) this.close()
        },
        close() {
            if (this.confirmUnsavedChanges) this.promptUnsavedChanges()
            else this.$store.dispatch('editor/close')
        },
        discardChanges() {
            this.dialogConfirmChange = false
            this.$store.dispatch('editor/close')
        },
        promptUnsavedChanges() {
            if (!this.changed || !this.isWriteable) this.$store.dispatch('editor/close')
            else this.dialogConfirmChange = true
        },
        save(restartServiceName: string | null = null) {
            this.dialogConfirmChange = false

            this.$store.dispatch('editor/saveFile', {
                content: this.sourcecode,
                restartServiceName: restartServiceName,
            })
        },
        // Relies on event bubbling to flip the flag before treeview active change is handled
        activeChangesItemClick() {
            this.structureActiveChangedBySidebar = true
        },
        activeChanges(activeItems: Array<ConfigFileSection[typeof this.treeviewItemKeyProp]>) {
            if (!this.structureActiveChangedBySidebar) {
                return
            }

            this.structureActiveChangedBySidebar = false

            if (!activeItems.length) {
                return
            }

            this.editor?.gotoLine(activeItems[0])
        },
        lineChanges(line: number) {
            this.configFileStructure?.map((item) => {
                if (item.line == line) {
                    this.structureActive = [line]
                } else {
                    item.children?.map((child) => {
                        if (child.line == line) {
                            this.structureActive = [line]
                            if (!this.structureOpen.includes(item.line)) this.structureOpen.push(item.line)
                        }
                    })
                }
            })
        },
    },
})
</script>
<style scoped>
:deep(.ͼ1 .cm-panel.cm-search *:focus:not(.focus-visible)) {
    outline: none;
}

:deep(.ͼ1 .cm-panel.cm-search input[type='checkbox']) {
    width: 2.2em;
    height: 2.2em;
    color: dodgerblue;
    vertical-align: middle;
    -webkit-appearance: none;
    border: 10px;
    outline: 0;
    flex-grow: 0;
    border-radius: 4px;
    background: var(--v-toolbar-base);
    transition: background 300ms;
    cursor: pointer;
    margin-right: 0.5em;
}

/* Pseudo element for check styling */

:deep(.ͼ1 .cm-panel.cm-search input[type='checkbox']::before) {
    content: '';
    color: transparent;
    display: block;
    width: inherit;
    height: inherit;
    border-radius: inherit;
    border: 2px;
    background-color: transparent;
    background-size: contain;
    box-shadow: inset 0 0 0 1px #ccd3d8;
    font-size: 16px;
}

/* Checked */

:deep(.ͼ1 .cm-panel.cm-search input[type='checkbox']:checked) {
    background-color: var(--color-primary);
}

:deep(.ͼ1 .cm-panel.cm-search input[type='checkbox']:checked::before) {
    box-shadow: none;
    background-color: var(--color-primary);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E %3Cpath d='M15.88 8.29L10 14.17l-1.88-1.88a.996.996 0 1 0-1.41 1.41l2.59 2.59c.39.39 1.02.39 1.41 0L17.3 9.7a.996.996 0 0 0 0-1.41c-.39-.39-1.03-.39-1.42 0z' fill='%23fffff'/%3E %3C/svg%3E");
}

@media screen and (min-width: 960px) {
    .codemirror:not(.withSidebar) {
        width: 100%;
    }
    .codemirror.withSidebar {
        width: calc(100% - 300px);
    }
}

.structure-sidebar {
    width: 300px;
    overflow-y: auto;
    max-height: calc(100vh - 48px);
}
._structure-sidebar-item {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}

:deep(.v-treeview-node__level + .v-treeview-node__level) {
    width: 12px;
}
</style>
