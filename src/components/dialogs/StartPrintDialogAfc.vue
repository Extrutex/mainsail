<template>
    <v-card-text class="py-3 px-0 bt-1">
        <start-print-dialog-afc-tool
            v-for="(tool, index) in usedTools"
            :key="tool"
            :file="file"
            :tool-index="tool"
            :border-top="index > 0" />
    </v-card-text>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { FileStateGcodefile } from '@/store/files/types'
import AfcMixin from '@/components/mixins/afc'
import StartPrintDialogAfcTool from '@/components/dialogs/StartPrintDialogAfcTool.vue'

export default defineComponent({
    name: 'StartPrintDialogAfc',
    components: { StartPrintDialogAfcTool },
    mixins: [BaseMixin, AfcMixin],
    props: {
        file: { type: Object as PropType<FileStateGcodefile>, required: true },
    },
    computed: {
        usedTools() {
            const filamentWeights = this.file.filament_weights ?? []

            const usedTools: number[] = []
            filamentWeights.forEach((weight, index) => {
                if (weight > 0) usedTools.push(index)
            })

            return usedTools
        },
    },
})
</script>
