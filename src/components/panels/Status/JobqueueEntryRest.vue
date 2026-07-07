<template>
    <v-row class="d-flex flex-row flex-nowrap">
        <v-col cols="auto" class="d-flex flex-column justify-center pr-0 py-0">
            <v-icon style="width: 32px">{{ mdiFileMultiple }}</v-icon>
        </v-col>
        <v-col class="py-2" style="min-width: 0; font-size: 0.875em">
            <div class="text-truncate">{{ headline }}</div>
            <small class="text-truncate">{{ description }}</small>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { ServerJobQueueStateJob } from '@/store/server/jobQueue/types'
import { mdiFileMultiple } from '@mdi/js'

export default defineComponent({
    name: 'StatusPanelJobqueueEntryRest',
    mixins: [BaseMixin],
    props: {
        jobs: { type: Array as PropType<ServerJobQueueStateJob[]>, required: true },
    },
    data() {
        return {
            mdiFileMultiple: mdiFileMultiple,
        }
    },
    computed: {
        sums() {
            const sums = {
                filamentLength: 0,
                filamentWeight: 0,
                estimatedTime: 0,
            }

            this.jobs.forEach((job: ServerJobQueueStateJob) => {
                const count = (job.combinedIds?.length ?? 0) + 1

                sums.filamentLength += (job.metadata?.filament_total ?? 0) * count
                sums.filamentWeight += (job.metadata?.filament_weight_total ?? 0) * count
                sums.estimatedTime += (job.metadata?.estimated_time ?? 0) * count
            })

            return sums
        },

        count() {
            let count = 0

            this.jobs.forEach((item: ServerJobQueueStateJob) => {
                count += (item.combinedIds?.length ?? 0) + 1
            })

            return count
        },

        headline() {
            return this.$tc('Panels.StatusPanel.JobqueueMoreFiles', this.count, {
                count: this.count,
            })
        },

        description() {
            const filamentArray = []
            let filament = '--'
            if (this.filamentLength) filamentArray.push(this.filamentLength)
            if (this.filamentWeight) filamentArray.push(this.filamentWeight)
            if (filamentArray.length) filament = filamentArray.join(' / ')

            let time = '--'
            if (this.estimatedTime) time = this.estimatedTime

            return `${this.$t('Panels.StatusPanel.Filament')}: ${filament}, ${this.$t(
                'Panels.StatusPanel.PrintTime'
            )}: ${time}`
        },

        filamentLength() {
            const length = this.sums.filamentLength
            if (length === 0) return null

            if (length >= 1000) return (length / 1000).toFixed(1) + ' m'

            return length.toFixed(0) + ' mm'
        },

        filamentWeight() {
            const weight = this.sums.filamentWeight
            if (weight === 0) return null

            if (weight >= 1000) return (weight / 1000).toFixed(1) + ' kg'

            return weight.toFixed(0) + ' g'
        },

        estimatedTime() {
            let totalSeconds = this.sums.estimatedTime
            if (totalSeconds == 0) return '--'

            const output = []

            const days = Math.floor(totalSeconds / (3600 * 24))
            if (days) {
                totalSeconds %= 3600 * 24
                output.push(days + 'd')
            }

            const hours = Math.floor(totalSeconds / 3600)
            totalSeconds %= 3600
            if (hours) output.push(hours + 'h')

            const minutes = Math.floor(totalSeconds / 60)
            if (minutes) output.push(minutes + 'm')

            // skip seconds if there are hours
            if (hours > 0) return output.join(' ')

            const seconds = totalSeconds % 60
            if (seconds) output.push(seconds.toFixed(0) + 's')

            return output.join(' ')
        },
    },
})
</script>
