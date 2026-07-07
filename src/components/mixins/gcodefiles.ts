import { defineComponent } from 'vue'
import { FileStateFile } from '@/store/files/types'

export interface tableColumnSetting {
    text: string
    value: string
    visible: boolean
    sortable?: boolean
    class?: string
    pos?: number
    outputType?: 'string' | 'date' | 'length' | 'weight' | 'filesize' | 'temp' | 'time'
}

export default defineComponent({
    computed: {
        search: {
            get(): string {
                return this.$store.state.gui.view.gcodefiles.search ?? ''
            },
            set(value: string) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.gcodefiles.search', value })
            },
        },

        currentPath: {
            get(): string {
                const path = this.$store.state.gui.view.gcodefiles.currentPath ?? ''
                if (path === 'gcodes') return ''

                return path
            },
            set(newVal: string) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.gcodefiles.currentPath', value: newVal })
            },
        },

        showHiddenFiles: {
            get(): boolean {
                return this.$store.state.gui.view.gcodefiles.showHiddenFiles ?? false
            },
            set(newVal: boolean) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.gcodefiles.showHiddenFiles', value: newVal })
            },
        },

        showPrintedFiles: {
            get(): boolean {
                return this.$store.state.gui.view.gcodefiles.showPrintedFiles ?? true
            },
            set(newVal: boolean) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.gcodefiles.showPrintedFiles', value: newVal })
            },
        },

        files(): FileStateFile[] {
            return this.$store.getters['files/getGcodeFiles'](
                this.currentPath,
                this.showHiddenFiles,
                this.showPrintedFiles
            )
        },

        hideMetadataColumns: {
            get(): string[] {
                return this.$store.state.gui.view.gcodefiles.hideMetadataColumns ?? []
            },
            set(newVal: string[]) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.gcodefiles.hideMetadataColumns', value: newVal })
            },
        },

        orderMetadataColumns: {
            get(): string[] {
                return this.$store.state.gui.view.gcodefiles.orderMetadataColumns ?? []
            },
            set(newVal: string[]) {
                this.$store.dispatch('gui/saveSetting', {
                    name: 'view.gcodefiles.orderMetadataColumns',
                    value: newVal,
                })
            },
        },

        fixedHeaders(): tableColumnSetting[] {
            return [
                { text: '', value: '', visible: true, sortable: false },
                {
                    text: this.$t('Files.Name').toString(),
                    value: 'filename',
                    visible: true,
                    class: 'text-no-wrap',
                },
                { text: '', value: 'status', visible: true, class: 'text-no-wrap', sortable: false },
            ]
        },

        configurableHeaders: {
            get(): tableColumnSetting[] {
                const headers: tableColumnSetting[] = [
                    {
                        text: this.$t('Files.Filesize').toString(),
                        value: 'size',
                        visible: true,
                        class: 'text-no-wrap',
                        outputType: 'filesize',
                    },
                    {
                        text: this.$t('Files.LastModified').toString(),
                        value: 'modified',
                        visible: true,
                        class: 'text-no-wrap',
                        outputType: 'date',
                    },
                    {
                        text: this.$t('Files.ObjectHeight').toString(),
                        value: 'object_height',
                        visible: true,
                        class: 'text-no-wrap',
                        outputType: 'length',
                    },
                    {
                        text: this.$t('Files.LayerHeight').toString(),
                        value: 'layer_height',
                        visible: true,
                        class: 'text-no-wrap',
                        outputType: 'length',
                    },
                    {
                        text: this.$t('Files.NozzleDiameter').toString(),
                        value: 'nozzle_diameter',
                        visible: true,
                        class: 'text-no-wrap',
                        outputType: 'length',
                    },
                    {
                        text: this.$t('Files.ExtruderTemp').toString(),
                        value: 'first_layer_extr_temp',
                        visible: true,
                        class: 'text-no-wrap',
                        outputType: 'temp',
                    },
                    {
                        text: this.$t('Files.BedTemp').toString(),
                        value: 'first_layer_bed_temp',
                        visible: true,
                        class: 'text-no-wrap',
                        outputType: 'temp',
                    },
                    {
                        text: this.$t('Files.ChamberTemp').toString(),
                        value: 'chamber_temp',
                        visible: true,
                        class: 'text-no-wrap',
                        outputType: 'temp',
                    },
                    {
                        text: this.$t('Files.Filaments').toString(),
                        value: 'filaments',
                        visible: true,
                        class: 'text-no-wrap',
                    },
                    {
                        text: this.$t('Files.FilamentName').toString(),
                        value: 'filament_name',
                        visible: true,
                        class: 'text-no-wrap',
                    },
                    {
                        text: this.$t('Files.FilamentType').toString(),
                        value: 'filament_type',
                        visible: true,
                        class: 'text-no-wrap',
                        outputType: 'string',
                    },
                    {
                        text: this.$t('Files.FilamentUsage').toString(),
                        value: 'filament_total',
                        visible: true,
                        class: 'text-no-wrap',
                        outputType: 'length',
                    },
                    {
                        text: this.$t('Files.FilamentWeight').toString(),
                        value: 'filament_weight_total',
                        visible: true,
                        class: 'text-no-wrap',
                        outputType: 'weight',
                    },
                    {
                        text: this.$t('Files.PrintTime').toString(),
                        value: 'estimated_time',
                        visible: true,
                        class: 'text-no-wrap',
                        outputType: 'time',
                    },
                    {
                        text: this.$t('Files.LastStartTime').toString(),
                        value: 'last_start_time',
                        visible: true,
                        class: 'text-no-wrap',
                        outputType: 'date',
                    },
                    {
                        text: this.$t('Files.LastEndTime').toString(),
                        value: 'last_end_time',
                        visible: true,
                        class: 'text-no-wrap',
                        outputType: 'date',
                    },
                    {
                        text: this.$t('Files.LastPrintDuration').toString(),
                        value: 'last_print_duration',
                        visible: true,
                        class: 'text-no-wrap',
                        outputType: 'time',
                    },
                    {
                        text: this.$t('Files.LastTotalDuration').toString(),
                        value: 'last_total_duration',
                        visible: true,
                        class: 'text-no-wrap',
                        outputType: 'time',
                    },
                    {
                        text: this.$t('Files.LastFilamentUsed').toString(),
                        value: 'last_filament_used',
                        visible: true,
                        class: 'text-no-wrap',
                        outputType: 'length',
                    },
                    {
                        text: this.$t('Files.Slicer').toString(),
                        value: 'slicer',
                        visible: true,
                        class: 'text-no-wrap',
                        outputType: 'string',
                    },
                ]

                let unknownPos = 0
                headers.forEach((header) => {
                    header.visible = !this.hideMetadataColumns.includes(header.value)

                    let pos = this.orderMetadataColumns?.findIndex((value: string) => value === header.value)
                    if (pos === -1) {
                        unknownPos++
                        pos = this.orderMetadataColumns.length + unknownPos
                    }
                    header.pos = pos
                })

                return headers.sort((a, b) => (a.pos ?? 0) - (b.pos ?? 0))
            },
            set(newVal: tableColumnSetting[]) {
                const orderArray: string[] = []
                newVal.forEach((row: tableColumnSetting) => orderArray.push(row.value))

                this.orderMetadataColumns = orderArray
            },
        },

        headers(): tableColumnSetting[] {
            return [...this.fixedHeaders, ...this.configurableHeaders]
        },

        filteredHeaders(): tableColumnSetting[] {
            return this.headers.filter((header) => header.visible)
        },

        tableColumns(): tableColumnSetting[] {
            return this.configurableHeaders.filter((column) => column.visible)
        },

        selectedFiles: {
            get(): FileStateFile[] {
                return this.$store.state.gui.view.gcodefiles.selectedFiles ?? []
            },
            set(newVal: FileStateFile[]) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.gcodefiles.selectedFiles', value: newVal })
            },
        },
    },
    methods: {
        existsFilename(name: string) {
            return this.files.findIndex((file: FileStateFile) => file.filename === name) >= 0
        },
    },
})
