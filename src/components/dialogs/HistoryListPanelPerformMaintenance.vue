<template>
    <v-dialog v-model="showDialog" :max-width="400" persistent @keydown.esc="closeDialog">
        <panel
            :title="$t('History.PerformMaintenance')"
            :icon="mdiNotebook"
            card-class="history-perform-maintenance-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text class="pb-0">
                <v-row>
                    <v-col>
                        <v-textarea
                            v-model="note"
                            variant="outlined"
                            hide-details="auto"
                            :label="$t('History.AddANote')" />
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" @click="closeDialog">{{ $t('Buttons.Cancel') }}</v-btn>
                <v-btn v-if="showPerformButton" variant="text" color="primary" @click="perform">
                    {{ performButtonText }}
                </v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { GuiMaintenanceStateEntry } from '@/store/gui/maintenance/types'
import { defineComponent, PropType } from 'vue'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick, mdiNotebook } from '@mdi/js'

export default defineComponent({
    name: 'HistoryListPanelPerformMaintenance',
    components: { Panel },
    mixins: [BaseMixin],
    props: {
        modelValue: { type: Boolean },
        item: { type: Object as PropType<GuiMaintenanceStateEntry>, default: () => ({}) as GuiMaintenanceStateEntry },
    },
    emits: ['close-details-dialog', 'update:modelValue'],
    data() {
        return {
            mdiCloseThick: mdiCloseThick,
            mdiNotebook: mdiNotebook,
            note: '',
        }
    },
    computed: {
        showDialog: {
            get(): boolean {
                return this.modelValue
            },
            set(value: boolean) {
                this.$emit('update:modelValue', value)
            },
        },
        showPerformButton() {
            if (this.item.end_time) return false

            return this.item.reminder?.type ?? false
        },
        performButtonText() {
            if (this.item.reminder?.type === 'repeat') return this.$t('History.PerformedAndReschedule')

            return this.$t('History.Performed')
        },
    },
    watch: {
        showDialog(newVal: boolean) {
            if (!newVal) return

            this.note = ''
        },
    },
    methods: {
        closeDialog() {
            this.showDialog = false
        },
        perform() {
            this.$store.dispatch('gui/maintenance/perform', { id: this.item.id, note: this.note })
            this.$emit('close-details-dialog')
        },
    },
})
</script>
