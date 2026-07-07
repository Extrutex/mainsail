<template>
    <v-row>
        <v-col cols="12" md="8" class="pt-0 pt-md-3" :order="$vuetify.display.mdAndUp ? '' : '2'">
            <timelapse-files-panel></timelapse-files-panel>
        </v-col>
        <v-col cols="12" md="4" :order="$vuetify.display.mdAndUp ? '' : '1'">
            <timelapse-status-panel></timelapse-status-panel>
        </v-col>
    </v-row>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import TimelapseFilesPanel from '@/components/panels/Timelapse/TimelapseFilesPanel.vue'
import TimelapseStatusPanel from '@/components/panels/Timelapse/TimelapseStatusPanel.vue'

export default defineComponent({
    name: 'PageTimelapse',
    components: { TimelapseStatusPanel, TimelapseFilesPanel },
    mixins: [BaseMixin],
})
</script>
