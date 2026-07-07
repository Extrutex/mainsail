<template>
    <v-row v-if="existGcodesRootDirectory">
        <v-col :cols="12" :md="showJobQueue ? 8 : 12" :class="showJobQueue ? 'pt-0 pt-md-3 order-1 order-md-0' : ''">
            <gcodefiles-panel></gcodefiles-panel>
        </v-col>
        <v-col v-if="showJobQueue" cols="12" md="4" class="pb-0 pb-sm-3 order-0 order-md-1">
            <jobqueue-panel></jobqueue-panel>
        </v-col>
    </v-row>
    <v-row v-else>
        <v-alert
            density="compact"
            variant="text"
            type="warning"
            elevation="2"
            class="mx-auto mt-6"
            max-width="500"
            :icon="mdiLockOutline">
            {{ $t('Files.GcodesRootDirectoryDoesntExists') }}
        </v-alert>
    </v-row>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import GcodefilesPanel from '@/components/panels/GcodefilesPanel.vue'
import JobqueuePanel from '@/components/panels/JobqueuePanel.vue'
import { mdiLockOutline } from '@mdi/js'

export default defineComponent({
    name: 'PageFiles',
    components: { JobqueuePanel, GcodefilesPanel },
    mixins: [BaseMixin],
    data() {
        return {
            mdiLockOutline: mdiLockOutline,
        }
    },
    computed: {
        queued_jobs(): any[] {
            return this.$store.state.server.jobQueue.queued_jobs ?? []
        },

        showJobQueue(): boolean {
            return this.moonrakerComponents.includes('job_queue') && this.queued_jobs.length > 0
        },
    },
})
</script>
