<template>
    <v-tooltip top>
        <template #activator="{ props }">
            <v-btn class="px-2 minwidth-0 ml-3" v-bind="props" @click="exportHistory">
                <v-icon>{{ mdiDatabaseExportOutline }}</v-icon>
            </v-btn>
        </template>
        <span>{{ $t('History.TitleExportHistory') }}</span>
    </v-tooltip>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { ServerHistoryStateJob } from '@/store/server/history/types'
import { formatFilesize } from '@/plugins/helpers'
import { mdiDatabaseExportOutline } from '@mdi/js'
import { HistoryListPanelCol } from '@/store/server/history/types'
import HistoryMixin from '@/components/mixins/history'

export default defineComponent({
    name: 'HistoryListPanelExportCsv',
    mixins: [BaseMixin, HistoryMixin],
    props: {
        headers: { type: Array, required: true },
        tableFields: { type: Array, required: true },
    },
    data() {
        return {
            formatFilesize: formatFilesize,
            mdiDatabaseExportOutline: mdiDatabaseExportOutline,
        }
    },
    computed: {
        existsSlicerCol() {
            return this.headers.find((header) => header.value === 'slicer')?.visible ?? false
        },
        exportJobs() {
            if (this.selectedJobs.length) return [...this.selectedJobs]

            return [...this.jobs]
        },
    },
    methods: {
        exportHistory() {
            const checkString = parseFloat('1.23').toLocaleString(this.browserLocale)
            const decimalSeparator = checkString.indexOf(',') >= 0 ? ',' : '.'
            const csvSeperator = decimalSeparator === ',' ? ';' : ','

            const content: string[][] = []
            content.push(this.createHeaderRow())
            content.push(...this.createContentRows(csvSeperator))

            // escape fields with the csvSeperator in the content
            // prettier-ignore
            const csvContent =
                'data:text/csv;charset=utf-8,' +
                content.map((entry) =>
                    entry.map((field) => (field.indexOf(csvSeperator) === -1 ? field : `"${field}"`)).join(csvSeperator)
                ).join('\n')

            const link = document.createElement('a')
            link.setAttribute('href', encodeURI(csvContent))
            link.setAttribute('download', 'print_history.csv')
            document.body.appendChild(link)

            link.click()
            link.remove()
        },
        createHeaderRow() {
            const row: string[] = []

            row.push('filename')
            row.push('status')

            this.tableFields.forEach((col) => {
                row.push(col.value)
            })

            if (this.existsSlicerCol) row.push('slicer')

            return row
        },
        createContentRows(csvSeperator: string) {
            if (this.exportJobs.length === 0) return []

            const rows: string[][] = []

            this.exportJobs.forEach((job: ServerHistoryStateJob) => {
                const row: string[] = []

                if (job.filename.includes(csvSeperator)) row.push(`"${job.filename}"`)
                else row.push(job.filename)
                row.push(job.status)

                this.tableFields.forEach((col) => {
                    row.push(this.outputValue(col, job, csvSeperator))
                })

                if (this.existsSlicerCol) {
                    const slicer = job.metadata?.slicer ?? '--'
                    const slicer_version = job.metadata?.slicer_version ?? '--'

                    row.push(`${slicer} ${slicer_version}`)
                }

                rows.push(row)
            })

            return rows
        },
        outputValue(col: HistoryListPanelCol, job: ServerHistoryStateJob, escapeChar: string): string {
            const key = col.value
            let value: string | number | null = null
            if (key in job) {
                const raw = job[key as keyof ServerHistoryStateJob]
                if (typeof raw === 'string' || typeof raw === 'number') value = raw
            } else if (key in job.metadata) {
                const raw = job.metadata[key]
                if (typeof raw === 'string' || typeof raw === 'number') value = raw
            }

            if (key.startsWith('history_field_')) {
                const fieldName = key.replace('history_field_', '')
                const field = job.auxiliary_data?.find((field) => field.name === fieldName)
                if (field && !Array.isArray(field.value))
                    return `${Math.round(field.value * 1000) / 1000} ${field.units}`
            }

            if (value === null) return ''

            if (typeof value === 'string') {
                if (value.includes(escapeChar)) return '"' + value + '"'

                return value
            }

            switch (col.outputType) {
                case 'date':
                    return this.formatDateTime(value * 1000)

                case 'time':
                    return value.toFixed()

                default:
                    return value.toLocaleString(this.browserLocale, { useGrouping: false })
            }
        },
    },
})
</script>
