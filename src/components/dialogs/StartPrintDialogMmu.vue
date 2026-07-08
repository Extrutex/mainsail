<template>
    <v-card-text>
        <p class="body-2">{{ summary }}</p>
        <div class="text-center">
            <v-btn color="primary" @click="showEditTtgMapDialog = true">
                <v-icon start>{{ mdiStateMachine }}</v-icon>
                {{ $t('Panels.MmuPanel.EditTtgMap') }}
            </v-btn>
        </div>
        <mmu-edit-ttg-map-dialog v-model="showEditTtgMapDialog" :file="file" />
    </v-card-text>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, { TOOL_GATE_BYPASS } from '@/components/mixins/mmu'
import { FileStateGcodefile } from '@/store/files/types'
import { mdiStateMachine } from '@mdi/js'

export default defineComponent({
    name: 'StartPrintDialogMmu',
    mixins: [BaseMixin, MmuMixin],
    props: {
        file: { type: Object as PropType<FileStateGcodefile>, required: true },
    },
    data() {
        return {
            mdiStateMachine: mdiStateMachine,

            showEditTtgMapDialog: false,
        }
    },
    computed: {
        summary() {
            const referencedTools = this.file.referenced_tools ?? ''
            const numTools = referencedTools.length

            if (numTools <= 1 && this.mmuGate !== TOOL_GATE_BYPASS) {
                return this.$t('Panels.MmuPanel.StartPrintDialogMmu.SingleColor')
            }

            return this.$t('Panels.MmuPanel.StartPrintDialogMmu.MultiColor', { numTools: numTools })
        },
    },
})
</script>
