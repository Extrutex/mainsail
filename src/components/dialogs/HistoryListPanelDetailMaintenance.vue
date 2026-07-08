<template>
    <v-dialog v-model="showDialog" :max-width="500" persistent @keydown.esc="closeDialog">
        <panel
            :title="$t('History.Maintenance')"
            :icon="mdiNotebook"
            card-class="history-maintenance-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="showEditDialog = true">
                    <v-icon>{{ mdiPencil }}</v-icon>
                </v-btn>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <overlay-scrollbars style="height: 350px">
                <v-card-text class="pb-0">
                    <v-row>
                        <v-col>
                            <div>{{ date }}</div>
                            <p class="text-h4 text--primary">{{ item.name }}</p>
                            <div v-if="note" class="text--primary" v-html="note" />
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-divider class="mt-3 mb-0" />
                <v-card-text class="pt-0 mb-0 pb-0">
                    <v-timeline align-top density="compact">
                        <v-timeline-item class="pb-1" size="small">
                            <strong>{{ outputFirstPointOfHistory }}</strong>
                        </v-timeline-item>
                        <history-list-panel-detail-maintenance-history-entry
                            v-for="entry in history"
                            :key="entry.id"
                            :item="entry"
                            :current="entry.id === item.id"
                            :last="entry.id === history[history.length - 1].id" />
                    </v-timeline>
                </v-card-text>
            </overlay-scrollbars>
            <v-divider class="mt-0" />
            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" @click="closeDialog">{{ $t('Buttons.Cancel') }}</v-btn>
                <v-btn v-if="showPerformButton" variant="text" color="primary" @click="showPerformDialog = true">
                    {{ $t('History.Perform') }}
                </v-btn>
            </v-card-actions>
        </panel>
        <history-list-panel-perform-maintenance
            v-model="showPerformDialog"
            :item="item"
            @close-details-dialog="closeDialog" />
        <history-list-panel-edit-maintenance v-model="showEditDialog" :item="item" />
    </v-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick, mdiNotebook, mdiPencil } from '@mdi/js'
import { GuiMaintenanceStateEntry } from '@/store/gui/maintenance/types'
import HistoryListPanelDetailMaintenanceHistoryEntry from '@/components/dialogs/HistoryListPanelDetailMaintenanceHistoryEntry.vue'
import HistoryListPanelPerformMaintenance from '@/components/dialogs/HistoryListPanelPerformMaintenance.vue'

export default defineComponent({
    name: 'HistoryListPanelDetailMaintenance',
    components: { HistoryListPanelPerformMaintenance, Panel, HistoryListPanelDetailMaintenanceHistoryEntry },
    mixins: [BaseMixin],
    props: {
        modelValue: { type: Boolean },
        item: { type: Object as PropType<GuiMaintenanceStateEntry>, default: () => ({}) as GuiMaintenanceStateEntry },
    },
    emits: ['update:modelValue'],
    data() {
        return {
            mdiCloseThick: mdiCloseThick,
            mdiNotebook: mdiNotebook,
            mdiPencil: mdiPencil,
            showEditDialog: false,
            showPerformDialog: false,
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
        date() {
            return this.formatDateTime(this.item.start_time * 1000, false)
        },
        note() {
            return this.item.note.replaceAll('\n', '<br>')
        },
        showPerformButton() {
            if (this.item.end_time) return false

            return this.item.reminder?.type ?? false
        },
        allEntries() {
            return this.$store.getters['gui/maintenance/getEntries'] ?? []
        },
        history() {
            const array = []

            let latest_entry_id = this.item.id
            while (latest_entry_id) {
                const entry = this.allEntries.find((entry: GuiMaintenanceStateEntry) => entry.id === latest_entry_id)
                if (!entry) break
                array.push(entry)
                latest_entry_id = entry.last_entry
            }

            return array
        },
        outputFirstPointOfHistory() {
            if (this.item.reminder.type === null) return this.$t('History.EntrySince')
            if (this.item.end_time === null) return this.$t('History.EntryNextPerform')

            return this.$t('History.EntryPerformedAt', { date: this.formatDateTime(this.item.end_time * 1000) })
        },
    },
    methods: {
        closeDialog() {
            this.showDialog = false
        },
    },
})
</script>
