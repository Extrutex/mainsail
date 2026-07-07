<template>
    <v-container fluid class="py-0 px-0">
        <v-row>
            <v-col cols="12" md="6" class="pb-0 pb-md-3">
                <config-files-panel></config-files-panel>
            </v-col>
            <v-col cols="12" md="6" class="pt-0 pt-md-3">
                <klippy-state-panel></klippy-state-panel>
                <system-panel></system-panel>
                <update-panel></update-panel>
                <v-row>
                    <v-col v-if="klipperState === 'ready'" cols="12" sm="6" class="pb-0 pb-md-3">
                        <endstop-panel></endstop-panel>
                    </v-col>
                    <v-col
                        :cols="12"
                        :sm="klipperState !== 'ready' ? 12 : 6"
                        :class="klipperState !== 'ready' ? '' : 'pt-0 pt-sm-3'">
                        <logfiles-panel></logfiles-panel>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </v-container>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import KlippyStatePanel from '@/components/panels/KlippyStatePanel.vue'
import UpdatePanel from '@/components/panels/Machine/UpdatePanel.vue'
import LogfilesPanel from '@/components/panels/Machine/LogfilesPanel.vue'
import EndstopPanel from '@/components/panels/Machine/EndstopPanel.vue'
import ConfigFilesPanel from '@/components/panels/Machine/ConfigFilesPanel.vue'
import SystemPanel from '@/components/panels/Machine/SystemPanel.vue'

export default defineComponent({
    name: 'PageMachine',
    components: {
        SystemPanel,
        ConfigFilesPanel,
        EndstopPanel,
        LogfilesPanel,
        UpdatePanel,
        KlippyStatePanel,
    },
    mixins: [BaseMixin],
})
</script>
