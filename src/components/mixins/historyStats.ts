import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import {
    HistoryStatsValueNames,
    ServerHistoryStateAllPrintStatusEntry,
    ServerHistoryStateJob,
} from '@/store/server/history/types'
import i18n from '@/plugins/i18n'
import HistoryMixin from '@/components/mixins/history'

export default defineComponent({
    mixins: [HistoryMixin],
    props: {
        valueName: {
            type: String as PropType<HistoryStatsValueNames>,
            default: undefined,
        },
    },
    computed: {
        allPrintStati(): string[] {
            let array = this.allJobs.map((job: ServerHistoryStateJob) => job.status)

            array = array.filter((item: string, index: number) => array.indexOf(item) === index)

            return array
        },

        printStatusArray(): ServerHistoryStateAllPrintStatusEntry[] {
            return this.allPrintStati.map((status: string) => {
                const filterdJobs = this.allJobs.filter((job: ServerHistoryStateJob) => job.status === status)

                return {
                    name: status,
                    displayName: this.getLocalizedStatusName(status),
                    showInTable: !this.hidePrintStatus.includes(status),
                    value: filterdJobs.length,
                    itemStyle: {
                        opacity: 0.9,
                        color: this.getStatusColor(status),
                        borderColor: '#1E1E1E',
                        borderWidth: 2,
                        borderRadius: 3,
                    },
                }
            })
        },

        printStatusArrayChart(): ServerHistoryStateAllPrintStatusEntry[] {
            if (this.valueName === 'filament') {
                const jobs = this.selectedJobs.length ? this.selectedJobs : this.jobs

                return this.printStatusArray
                    .map((entry) => {
                        const value = jobs.reduce(
                            (acc: number, cur: ServerHistoryStateJob) =>
                                cur.status === entry.name ? acc + cur.filament_used : acc,
                            0
                        )

                        return {
                            ...entry,
                            value,
                        }
                    })
                    .filter((entry) => entry.value > 0)
            }

            if (this.valueName === 'time') {
                const jobs = this.selectedJobs.length ? this.selectedJobs : this.jobs

                return this.printStatusArray
                    .map((entry) => {
                        const value = jobs.reduce(
                            (acc: number, cur: ServerHistoryStateJob) =>
                                cur.status === entry.name ? acc + cur.total_duration : acc,
                            0
                        )

                        return {
                            ...entry,
                            value,
                        }
                    })
                    .filter((entry) => entry.value > 0)
            }

            return this.printStatusArray
        },

        groupedPrintStatusArray(): ServerHistoryStateAllPrintStatusEntry[] {
            return this.groupSmallEntries(this.printStatusArrayChart, 0.05)
        },
    },
    methods: {
        getStatusColor(status: string): string {
            const colorMap: Record<string, string> = {
                completed: '#BDBDBD',
                in_progress: '#EEEEEE',
                cancelled: '#616161',
                default: '#424242',
            }

            return colorMap[status] ?? colorMap.default
        },

        getLocalizedStatusName(status: string): string {
            return i18n.global.te(`History.StatusValues.${status}`, 'en')
                ? i18n.global.t(`History.StatusValues.${status}`).toString()
                : status
        },

        groupSmallEntries(
            entries: ServerHistoryStateAllPrintStatusEntry[],
            threshold: number
        ): ServerHistoryStateAllPrintStatusEntry[] {
            const totalCount = entries.reduce((acc, cur) => acc + cur.value, 0)
            const otherLimit = totalCount * threshold
            const others = entries.filter((entry) => entry.value < otherLimit)

            if (others.length < 2) return entries

            const value = others.reduce((acc, cur) => acc + cur.value, 0)
            const remaining = entries.filter((entry) => entry.value >= otherLimit)
            const displayName = i18n.global.t(`History.StatusValues.Others`).toString() + ` (${others.length})`

            remaining.push({
                name: displayName,
                displayName,
                value,
                valueFilament: 0,
                valueTime: 0,
                itemStyle: {
                    opacity: 0.9,
                    color: '#616161',
                    borderColor: '#1E1E1E',
                    borderWidth: 2,
                    borderRadius: 3,
                },
                showInTable: true,
            })

            return remaining
        },
    },
})
