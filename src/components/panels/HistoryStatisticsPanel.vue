<template>
    <panel
        :icon="mdiChartAreaspline"
        :title="$t('History.Statistics')"
        card-class="history-statistics-panel"
        :collapsible="true">
        <v-card-text class="pa-0">
            <v-row align="center">
                <v-col cols="12" sm="6" md="4">
                    <v-table>
                        <tbody>
                            <tr v-for="total in totals" :key="total.title">
                                <td>{{ total.title }}</td>
                                <td class="text-right">{{ total.value }}</td>
                            </tr>
                        </tbody>
                    </v-table>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                    <history-all-print-status-chart v-if="togglePrintStatus === 'chart'" :value-name="toggleValue" />
                    <history-all-print-status-table v-else :value-name="toggleValue" />
                    <div class="text-center mb-3">
                        <v-btn-toggle v-model="togglePrintStatus" size="small" mandatory>
                            <v-btn size="small" value="chart">{{ $t('History.Chart') }}</v-btn>
                            <v-btn size="small" value="table">{{ $t('History.Table') }}</v-btn>
                        </v-btn-toggle>
                        <v-tooltip v-if="!allLoaded" top>
                            <template #activator="{ props }">
                                <v-btn
                                    variant="outlined"
                                    size="small"
                                    :loading="loadings.includes('historyLoadAll')"
                                    class="ml-3 minwidth-0 px-2"
                                    color="primary"
                                    v-bind="props"
                                    @click="refreshHistory">
                                    <v-icon size="small">{{ mdiDatabaseArrowDownOutline }}</v-icon>
                                </v-btn>
                            </template>
                            <span>{{ $t('History.LoadCompleteHistory') }}</span>
                        </v-tooltip>
                    </div>
                    <div class="text-center mb-3">
                        <v-btn-toggle v-model="toggleValue" size="small" mandatory>
                            <v-btn
                                v-for="option in toggleValueOptions"
                                :key="option.value"
                                size="small"
                                :value="option.value">
                                {{ option.text }}
                            </v-btn>
                        </v-btn-toggle>
                    </div>
                </v-col>
                <v-col cols="12" sm="12" md="4">
                    <history-filament-usage v-if="toggleChart === 'filament_usage'" />
                    <history-printtime-avg v-else-if="toggleChart === 'printtime_avg'" />
                    <div class="text-center mt-3">
                        <v-btn-toggle v-model="toggleChart" size="small" mandatory>
                            <v-btn size="small" value="filament_usage">{{ $t('History.FilamentUsage') }}</v-btn>
                            <v-btn size="small" value="printtime_avg">{{ $t('History.PrinttimeAvg') }}</v-btn>
                        </v-btn-toggle>
                    </div>
                </v-col>
            </v-row>
        </v-card-text>
    </panel>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import HistoryFilamentUsage from '@/components/charts/HistoryFilamentUsage.vue'
import HistoryPrinttimeAvg from '@/components/charts/HistoryPrinttimeAvg.vue'
import HistoryAllPrintStatusChart from '@/components/charts/HistoryAllPrintStatusChart.vue'
import {
    HistoryStatsValueNames,
    ServerHistoryStateJob,
    ServerHistoryStateJobAuxiliaryTotal,
} from '@/store/server/history/types'
import { mdiChartAreaspline, mdiDatabaseArrowDownOutline } from '@mdi/js'
import { formatPrintTime } from '@/plugins/helpers'
import HistoryMixin from '@/components/mixins/history'
import { TranslateResult } from 'vue-i18n'

export default defineComponent({
    name: 'HistoryStatisticsPanel',
    components: { Panel, HistoryFilamentUsage, HistoryPrinttimeAvg, HistoryAllPrintStatusChart },
    mixins: [BaseMixin, HistoryMixin],
    data() {
        return {
            mdiChartAreaspline: mdiChartAreaspline,
            mdiDatabaseArrowDownOutline: mdiDatabaseArrowDownOutline,
            formatPrintTime: formatPrintTime,
            toggleValue: 'jobs',
        }
    },
    computed: {
        toggleValueOptions(): { text: TranslateResult; value: HistoryStatsValueNames }[] {
            return [
                { text: this.$t('History.Jobs'), value: 'jobs' },
                { text: this.$t('History.Filament'), value: 'filament' },
                { text: this.$t('History.Time'), value: 'time' },
            ]
        },
        existsSelectedJobs() {
            return this.selectedJobs.length > 0
        },
        totalPrintTime() {
            return this.$store.state.server.history.job_totals?.total_print_time ?? 0
        },
        selectedPrintTime() {
            let printtime = 0

            this.selectedJobs.forEach((job: ServerHistoryStateJob) => {
                printtime += job.print_duration
            })

            return printtime
        },
        longestPrintTime() {
            return this.$store.state.server.history.job_totals?.longest_print ?? 0
        },
        selectedLongestPrintTime() {
            let printtime = 0

            this.selectedJobs.forEach((job: ServerHistoryStateJob) => {
                if (job.print_duration > printtime) printtime = job.print_duration
            })

            return printtime
        },
        avgPrintTime() {
            if (this.totalJobsCount > 0 && this.totalPrintTime > 0)
                return Math.round(this.totalPrintTime / this.totalJobsCount)

            return 0
        },
        selectedAvgPrintTime() {
            if (this.selectedJobs.length > 0 && this.selectedPrintTime > 0)
                return Math.round(this.selectedPrintTime / this.selectedJobs.length)

            return 0
        },
        totalFilamentUsed() {
            return this.$store.state.server.history.job_totals?.total_filament_used ?? 0
        },
        totalFilamentUsedFormat() {
            const value = Math.round(this.totalFilamentUsed / 100) / 10

            return `${value} m`
        },
        selectedFilamentUsed() {
            let filamentUsed = 0

            this.selectedJobs.forEach((job: ServerHistoryStateJob) => {
                filamentUsed += job.filament_used
            })

            return filamentUsed
        },
        selectedFilamentUsedFormat() {
            const value = Math.round(this.selectedFilamentUsed / 100) / 10

            return `${value} m`
        },
        totalJobsCount() {
            return this.$store.state.server.history.job_totals?.total_jobs ?? 0
        },
        toggleChart: {
            get() {
                return this.$store.state.gui.view.history.toggleChartCol3
            },
            settoggleChart(newVal) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.history.toggleChartCol3', value: newVal })
            },
        },
        togglePrintStatus: {
            get() {
                return this.$store.state.gui.view.history.toggleChartCol2
            },
            settogglePrintStatus(newVal) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.history.toggleChartCol2', value: newVal })
            },
        },
        allLoaded() {
            return this.$store.state.server.history.all_loaded ?? false
        },
        selectedTotals() {
            const output: { title: string; value: string }[] = [
                {
                    title: this.$t('History.SelectedPrinttime') as string,
                    value: this.formatPrintTime(this.selectedPrintTime, false),
                },
                {
                    title: this.$t('History.LongestPrinttime') as string,
                    value: this.formatPrintTime(this.selectedLongestPrintTime, false),
                },
                {
                    title: this.$t('History.AvgPrinttime') as string,
                    value: this.formatPrintTime(this.selectedAvgPrintTime, false),
                },
                {
                    title: this.$t('History.SelectedFilamentUsed') as string,
                    value: this.selectedFilamentUsedFormat,
                },
                {
                    title: this.$t('History.SelectedJobs') as string,
                    value: this.selectedJobs.length.toString(),
                },
            ]

            output.push(...this.auxiliarySelectedTotals)

            return output
        },
        auxiliarySelectedTotals() {
            const output: { title: string; value: string }[] = []
            this.moonrakerHistoryFields.forEach((historyField) => {
                const value = this.selectedJobs.reduce((acc: number, job: ServerHistoryStateJob) => {
                    const historyFieldName = historyField.name.replace('history_field_', '')
                    const auxiliary_data = job.auxiliary_data?.find(
                        (auxiliary) =>
                            auxiliary.provider === historyField.provider && auxiliary.name === historyFieldName
                    )

                    if (!auxiliary_data || typeof auxiliary_data.value !== 'number') return acc

                    return acc + auxiliary_data.value
                }, 0)

                output.push({
                    title: historyField.desc,
                    value: `${Math.round(value * 1000) / 1000} ${historyField.unit}`,
                })
            })

            return output
        },
        genericTotals() {
            const output: { title: string; value: string }[] = [
                {
                    title: this.$t('History.TotalPrinttime') as string,
                    value: this.formatPrintTime(this.totalPrintTime, false),
                },
                {
                    title: this.$t('History.LongestPrinttime') as string,
                    value: this.formatPrintTime(this.longestPrintTime, false),
                },
                {
                    title: this.$t('History.AvgPrinttime') as string,
                    value: this.formatPrintTime(this.avgPrintTime, false),
                },
                {
                    title: this.$t('History.TotalFilamentUsed') as string,
                    value: this.totalFilamentUsedFormat,
                },
                {
                    title: this.$t('History.TotalJobs') as string,
                    value: this.totalJobsCount.toString(),
                },
            ]

            // Add auxiliary totals
            output.push(...this.auxiliaryTotals)

            return output
        },
        auxiliaryTotals() {
            const auxiliaries = this.$store.state.server.history.auxiliary_totals ?? []
            const output: { title: string; value: string }[] = []

            auxiliaries.forEach((auxiliary: ServerHistoryStateJobAuxiliaryTotal) => {
                const historyFieldName = `history_field_${auxiliary.field}`
                const historyField = this.moonrakerHistoryFields.find(
                    (historyField) =>
                        historyField.provider === auxiliary.provider && historyField.name === historyFieldName
                )
                const value = Math.round((auxiliary.total ?? 0) * 1000) / 1000

                output.push({
                    title: historyField?.desc ?? auxiliary.field,
                    value: `${value} ${historyField?.unit}`,
                })
            })

            return output
        },
        totals() {
            return this.existsSelectedJobs ? this.selectedTotals : this.genericTotals
        },
    },
    methods: {
        refreshHistory() {
            this.$store.dispatch('socket/addLoading', { name: 'historyLoadAll' })

            this.$socket.emit('server.history.list', { start: 0, limit: 50 }, { action: 'server/history/getHistory' })
        },
    },
})
</script>
