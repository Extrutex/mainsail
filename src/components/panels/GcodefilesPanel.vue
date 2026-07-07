<template>
    <panel :title="$t('Files.GCodeFiles')" :icon="mdiFileDocumentMultipleOutline" card-class="gcode-files-panel">
        <v-card-text>
            <gcodefiles-panel-header />
            <gcodefiles-panel-header-path-size />
        </v-card-text>
        <v-divider class="mb-3" />
        <gcodefiles-panel-table />
    </panel>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import GcodefilesMixin from '@/components/mixins/gcodefiles'
import GcodefilesPanelHeader from '@/components/panels/Gcodefiles/GcodefilesPanelHeader.vue'
import { mdiFileDocumentMultipleOutline } from '@mdi/js'
import GcodefilesPanelHeaderPathSize from '@/components/panels/Gcodefiles/GcodefilesPanelHeaderPathSize.vue'

export default defineComponent({
    name: 'GcodefilesPanel',
    components: { GcodefilesPanelHeaderPathSize, GcodefilesPanelHeader },
    mixins: [BaseMixin, GcodefilesMixin],
    data() {
        return {
            mdiFileDocumentMultipleOutline: mdiFileDocumentMultipleOutline,
        }
    },
})
</script>
