import { defineComponent } from 'vue'
import { HistoryListRowJob, ServerHistoryStateJob } from '@/store/server/history/types'
import { HistoryListRowMaintenance } from '@/store/gui/maintenance/types'

// I don't know why I cannot import the type from the HistoryListPanel, that's why I have to define it here again
type HistoryListPanelRow = HistoryListRowJob | HistoryListRowMaintenance

export default defineComponent({
    computed: {
        hidePrintStatus(): string[] {
            return this.$store.state.gui.view.history.hidePrintStatus ?? []
        },

        allJobs(): ServerHistoryStateJob[] {
            return this.$store.state.server.history.jobs ?? []
        },

        jobs(): ServerHistoryStateJob[] {
            return this.allJobs.filter((job: ServerHistoryStateJob) => {
                return !this.hidePrintStatus.includes(job.status)
            })
        },

        selectedJobs(): ServerHistoryStateJob[] {
            const entries = this.$store.state.gui.view.history.selectedJobs ?? []

            return entries.filter((entry: HistoryListPanelRow) => entry.type === 'job') as ServerHistoryStateJob[]
        },

        moonrakerHistoryFields(): { desc: string; unit: string; provider: string; name: string; parameter: string }[] {
            const config = this.$store.state.server.config?.config ?? {}
            const sensors = Object.keys(config).filter((key) => key.startsWith('sensor '))
            const historyFields: { desc: string; unit: string; provider: string; name: string; parameter: string }[] =
                []

            sensors.forEach((configName) => {
                const sensor = config[configName] ?? {}

                Object.keys(sensor)
                    .filter((key) => key.startsWith('history_field_'))
                    .forEach((key) => {
                        const historyField = sensor[key]

                        historyFields.push({
                            desc: historyField.desc,
                            unit: historyField.units,
                            provider: configName,
                            parameter: historyField.parameter,
                            name: key,
                        })
                    })
            })

            return historyFields
        },
    },
})
