<template>
    <div>
        <v-timeline-item class="pb-2" size="small" hide-dot>
            <div>
                <span v-if="restFilamentText" :class="restFilamentClass">
                    <v-icon size="small">{{ mdiAdjust }}</v-icon>
                    {{ restFilamentText }}
                </span>
                <span v-if="restPrinttimeText" :class="restPrinttimeClass">
                    <v-icon size="small">{{ mdiAlarm }}</v-icon>
                    {{ restPrinttimeText }}
                </span>
                <span v-if="restDaysText" :class="restDaysClass">
                    <v-icon size="small">{{ mdiCalendar }}</v-icon>
                    {{ restDaysText }}
                </span>
            </div>
            <p v-if="note" class="mt-2 mb-0" v-html="note" />
        </v-timeline-item>
        <v-timeline-item :class="classDateItem" size="small">
            <strong>{{ dateText }}</strong>
        </v-timeline-item>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiAdjust, mdiAlarm, mdiCalendar, mdiCloseThick } from '@mdi/js'
import { GuiMaintenanceStateEntry } from '@/store/gui/maintenance/types'

export default defineComponent({
    name: 'HistoryListPanelDetailMaintenanceHistoryEntry',
    components: { Panel },
    mixins: [BaseMixin],
    props: {
        item: { type: Object, default: false },
        current: { type: Boolean, default: false },
        last: { type: Boolean, default: false },
    },
    data() {
        return {
            mdiAdjust: mdiAdjust,
            mdiAlarm: mdiAlarm,
            mdiCalendar: mdiCalendar,
            mdiCloseThick: mdiCloseThick,
        }
    },
    computed: {
        date() {
            return this.formatDateTime(this.item.start_time * 1000, false)
        },
        dateText() {
            if (this.last) return this.$t('History.EntryCreatedAt', { date: this.date })

            return this.$t('History.EntryPerformedAt', { date: this.date })
        },
        showGoals() {
            if (this.item.reminder.type === null) return false

            return this.current && this.item.end_time === null
        },
        restFilament() {
            const start = this.item?.start_filament ?? 0
            const end = this.item.end_filament ?? 0
            const current = this.$store.state.server.history.job_totals?.total_filament_used ?? 0

            // calc filament since start
            // if end is not null, calc used filament until end
            let used = current - start
            if (end) used = end - start

            // convert to m
            used /= 1000

            return used
        },
        restFilamentText() {
            const value = this.item.reminder.filament?.value ?? 0
            if (!this.showGoals) return `${this.restFilament.toFixed(0)} m`

            if (!this.item.reminder.filament.bool) return false

            return `${this.restFilament.toFixed(0)} / ${value} m`
        },
        restFilamentClass() {
            const output = ['mr-3']
            if (!this.showGoals || !this.item.reminder.filament.bool) return output

            const value = this.item.reminder.filament?.value ?? 0
            if (this.restFilament > value) return [...output, 'error--text', 'font-weight-bold']

            return output
        },
        restPrinttime() {
            const start = this.item.start_printtime ?? 0
            const end = this.item.end_printtime ?? 0
            const current = this.$store.state.server.history.job_totals?.total_print_time ?? 0

            // calc filament since start
            // if end is not null, calc used filament until end
            let used = current - start
            if (end) used = end - start

            // convert to h
            used /= 3600

            return used
        },
        restPrinttimeText() {
            const value = this.item.reminder.printtime?.value ?? 0
            if (!this.showGoals) return `${this.restPrinttime.toFixed(1)} h`

            if (!this.item.reminder.printtime.bool) return false

            return `${this.restPrinttime.toFixed(1)} / ${value} h`
        },
        restPrinttimeClass() {
            const output = ['mr-3']
            if (!this.showGoals || !this.item.reminder.printtime.bool) return output

            const value = this.item.reminder.printtime?.value ?? 0
            if (this.restPrinttime > value) return [...output, 'error--text', 'font-weight-bold']

            return output
        },
        restDays() {
            const start = this.item.start_time ?? 0
            const end = this.item.end_time ?? 0
            const current = new Date().getTime() / 1000

            // calc days since start
            // if end is not null, calc used days until end
            let used = current - start
            if (end) used = end - start

            return used / (60 * 60 * 24)
        },
        restDaysText() {
            const value = this.item.reminder.date?.value ?? 0

            if (!this.showGoals) return `${this.restDays.toFixed(0)} days`

            if (!this.item.reminder.date.bool) return false

            return `${this.restDays.toFixed(0)} / ${value} days`
        },
        restDaysClass() {
            const output = ['mr-3']
            if (!this.showGoals || !this.item.reminder.date.bool) return output

            const value = this.item.reminder.date?.value ?? 0
            if (this.restDays > value) return [...output, 'error--text', 'font-weight-bold']

            return output
        },
        classDateItem() {
            return {
                'pb-2': !this.last,
                'pb-5': this.last,
            }
        },
        note() {
            return this.item.perform_note?.replaceAll('\n', '<br>')
        },
    },
})
</script>
