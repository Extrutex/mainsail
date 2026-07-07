<template>
    <panel :icon="mdiTrayFull" :title="$t('JobQueue.JobQueue')" card-class="jobqueue-panel">
        <template #buttons>
            <v-btn
                v-if="queueState === 'paused'"
                color="success"
                :loading="loadings.includes('startJobqueue')"
                icon
                tile
                :disabled="!klipperReadyForGui"
                @click="startJobqueue">
                <v-tooltip location="top">
                    <template #activator="{ props }">
                        <v-icon v-bind="props">{{ mdiPlay }}</v-icon>
                    </template>
                    <span>{{ $t('JobQueue.Start') }}</span>
                </v-tooltip>
            </v-btn>
            <v-btn
                v-if="['ready', 'loading'].includes(queueState)"
                color="warning"
                :loading="loadings.includes('pauseJobqueue')"
                icon
                tile
                @click="pauseJobqueue">
                <v-tooltip location="top">
                    <template #activator="{ props }">
                        <v-icon v-bind="props">{{ mdiPause }}</v-icon>
                    </template>
                    <span>{{ $t('JobQueue.Pause') }}</span>
                </v-tooltip>
            </v-btn>
        </template>
        <v-row v-if="jobs.length" class="mx-0 mt-0">
            <v-col>
                <draggable
                    :list="jobs"
                    item-key="job_id"
                    handle=".handle"
                    class="jobqueue-list mb-3"
                    ghost-class="ghost"
                    group="jobs"
                    :force-fallback="true"
                    @end="updateOrder">
                    <template #item="{ element }">
                        <jobqueue-entry :job="element" :show-handle="true" />
                    </template>
                </draggable>
                <jobqueue-entry-sum :jobs="jobs" />
            </v-col>
        </v-row>
        <v-card-text v-else>
            <p>{{ $t('JobQueue.Empty') }}</p>
        </v-card-text>
    </panel>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiPlay, mdiPause, mdiTrayFull } from '@mdi/js'
import JobqueueEntry from '@/components/panels/Status/JobqueueEntry.vue'
import draggable from 'vuedraggable'
import JobqueueEntrySum from '@/components/panels/Status/JobqueueEntrySum.vue'
import { DraggableEndEvent } from '@/types/vuedraggable'

export default defineComponent({
    name: 'JobqueuePanel',
    components: { JobqueueEntrySum, draggable, JobqueueEntry, Panel },
    mixins: [BaseMixin],
    data() {
        return {
            mdiPlay: mdiPlay,
            mdiPause: mdiPause,
            mdiTrayFull: mdiTrayFull,
        }
    },
    computed: {
        jobs() {
            return this.$store.getters['server/jobQueue/getJobs']
        },

        queueState() {
            return this.$store.state.server.jobQueue.queue_state ?? ''
        },
    },
    methods: {
        startJobqueue() {
            this.$store.dispatch('server/jobQueue/start')
        },

        pauseJobqueue() {
            this.$store.dispatch('server/jobQueue/pause')
        },

        updateOrder(event: DraggableEndEvent) {
            this.$store.dispatch('server/jobQueue/changePosition', {
                newIndex: event.newIndex,
                oldIndex: event.oldIndex,
            })
        },
    },
})
</script>

<style lang="scss">
.jobqueue-list > .jobqueue-list-entry + .jobqueue-list-entry {
    border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.jobqueue-list > div.ghost {
    background-color: rgba(255, 255, 255, 0.12);
}

.theme--light .jobqueue-list > .jobqueue-list-entry + .jobqueue-list-entry {
    border-top: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
