<template>
    <v-dialog v-model="showDialog" :max-width="600" persistent @keydown.esc="closeDialog">
        <panel
            :title="$t('History.AddMaintenance')"
            :icon="mdiNotebookPlus"
            card-class="history-add-maintenance-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text class="pb-0">
                <v-row>
                    <v-col>
                        <v-text-field
                            v-model="name"
                            :rules="nameInputRules"
                            :label="$t('History.Name')"
                            hide-details="auto"
                            variant="outlined"
                            density="compact" />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-textarea v-model="note" variant="outlined" hide-details="auto" :label="$t('History.Note')" />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <settings-row :title="$t('History.Reminder')">
                            <v-select
                                v-model="reminder"
                                :items="reminderItems"
                                variant="outlined"
                                density="compact"
                                hide-details
                                class="mt-0" />
                        </settings-row>
                    </v-col>
                </v-row>
                <template v-if="reminder">
                    <v-row>
                        <v-col>
                            <settings-row
                                :icon="mdiAdjust"
                                :title="$t('History.FilamentBasedReminder')"
                                :sub-title="$t('History.FilamentBasedReminderDescription')">
                                <v-checkbox v-model="reminderFilament" hide-details class="mt-0" />
                                <v-text-field
                                    v-model.number="reminderFilamentValue"
                                    hide-details="auto"
                                    type="number"
                                    class="mt-0"
                                    variant="outlined"
                                    density="compact"
                                    :suffix="$t('History.Meter')" />
                            </settings-row>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <settings-row
                                :icon="mdiAlarm"
                                :title="$t('History.PrinttimeBasedReminder')"
                                :sub-title="$t('History.PrinttimeBasedReminderDescription')">
                                <v-checkbox v-model="reminderPrinttime" hide-details class="mt-0" />
                                <v-text-field
                                    v-model.number="reminderPrinttimeValue"
                                    hide-details="auto"
                                    type="number"
                                    class="mt-0"
                                    variant="outlined"
                                    density="compact"
                                    :suffix="$t('History.Hours')" />
                            </settings-row>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <settings-row
                                :icon="mdiCalendar"
                                :title="$t('History.DateBasedReminder')"
                                :sub-title="$t('History.DateBasedReminderDescription')">
                                <v-checkbox v-model="reminderDate" hide-details class="mt-0" />
                                <v-text-field
                                    v-model.number="reminderDateValue"
                                    hide-details="auto"
                                    type="number"
                                    class="mt-0"
                                    variant="outlined"
                                    density="compact"
                                    :suffix="$t('History.Days')" />
                            </settings-row>
                        </v-col>
                    </v-row>
                </template>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" @click="closeDialog">{{ $t('Buttons.Cancel') }}</v-btn>
                <v-btn color="primary" variant="text" :disabled="!isValid" @click="save">
                    {{ $t('Buttons.Save') }}
                </v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import Panel from '@/components/ui/Panel.vue'
import { mdiAdjust, mdiAlarm, mdiCalendar, mdiCloseThick, mdiNotebookPlus } from '@mdi/js'

export default defineComponent({
    name: 'HistoryListPanelAddMaintenance',
    components: {
        Panel,
        SettingsRow,
    },
    mixins: [BaseMixin],
    props: {
        modelValue: { type: Boolean },
    },
    emits: ['update:modelValue'],
    data() {
        return {
            mdiAdjust: mdiAdjust,
            mdiAlarm: mdiAlarm,
            mdiCalendar: mdiCalendar,
            mdiCloseThick: mdiCloseThick,
            mdiNotebookPlus: mdiNotebookPlus,
            name: '',
            note: '',
            reminder: null as 'one-time' | 'repeat' | null,
            reminderFilament: false,
            reminderFilamentValue: 0,
            reminderPrinttime: false,
            reminderPrinttimeValue: 0,
            reminderDate: false,
            reminderDateValue: 0,
            nameInputRules: [(value: string) => !!value || this.$t('History.InvalidNameEmpty')],
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
        reminderItems() {
            return [
                {
                    text: this.$t('History.NoReminder').toString(),
                    value: null,
                },
                {
                    text: this.$t('History.OneTime').toString(),
                    value: 'one-time',
                },
                {
                    text: this.$t('History.Repeat').toString(),
                    value: 'repeat',
                },
            ]
        },
        totalFilamentUsed() {
            return this.$store.state.server.history.job_totals?.total_filament_used ?? 0
        },
        totalPrinttime() {
            return this.$store.state.server.history.job_totals?.total_print_time ?? 0
        },
        isValid() {
            if (this.name === '') return false

            if (this.reminder !== null) {
                if (!this.reminderFilament && !this.reminderPrinttime && !this.reminderDate) return false

                if (this.reminderFilament && this.reminderFilamentValue <= 0) return false
                if (this.reminderPrinttime && this.reminderPrinttimeValue <= 0) return false
                if (this.reminderDate && this.reminderDateValue <= 0) return false
            }

            return true
        },
    },
    watch: {
        showDialog() {
            if (this.showDialog) this.resetValues()
        },
    },
    methods: {
        closeDialog() {
            this.showDialog = false
        },
        save() {
            const date = new Date()
            this.$store.dispatch('gui/maintenance/store', {
                entry: {
                    name: this.name,
                    note: this.note,
                    // divided by 1000 to get seconds, because history entries are also in seconds
                    start_time: date.getTime() / 1000,
                    end_time: null,
                    start_filament: this.totalFilamentUsed,
                    end_filament: null,
                    start_printtime: this.totalPrinttime,
                    end_printtime: null,

                    reminder: {
                        type: this.reminder,

                        filament: {
                            bool: this.reminderFilament,
                            value: this.reminderFilamentValue,
                        },

                        printtime: {
                            bool: this.reminderPrinttime,
                            value: this.reminderPrinttimeValue,
                        },

                        date: {
                            bool: this.reminderDate,
                            value: this.reminderDateValue,
                        },
                    },
                },
            })

            this.closeDialog()
        },
        resetValues() {
            this.name = ''
            this.note = ''
            this.reminder = null
            this.reminderFilament = false
            this.reminderFilamentValue = 0
            this.reminderPrinttime = false
            this.reminderPrinttimeValue = 0
            this.reminderDate = false
            this.reminderDateValue = 0
        },
    },
})
</script>
