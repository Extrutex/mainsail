<template>
    <div>
        <v-btn color="error" size="small" @click="openDialog">
            {{ $t('Settings.GeneralTab.FactoryReset') }}
        </v-btn>
        <v-dialog v-model="showDialog" persistent :width="360">
            <panel
                :title="$t('Settings.GeneralTab.FactoryReset')"
                card-class="mainsail-reset-dialog"
                :margin-bottom="false"
                :icon="mdiHelpCircle">
                <template #buttons>
                    <v-btn icon tile @click="closeDialog">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <v-row>
                        <v-col>
                            <p class="mb-0">{{ $t('Settings.GeneralTab.FactoryDialog') }}</p>
                        </v-col>
                    </v-row>
                    <v-row>
                        <checkbox-list
                            :options="resetableNamespaces"
                            select-all
                            @update:selectedCheckboxes="onSelectResetCheckboxes" />
                    </v-row>
                    <v-row>
                        <v-col class="text-center">
                            <v-btn
                                color="red"
                                :loading="loadings.includes('resetMainsail')"
                                @click="resetMainsailAction">
                                {{ $t('Settings.GeneralTab.Reset') }}
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-card-text>
            </panel>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick, mdiHelpCircle } from '@mdi/js'
import CheckboxList from '@/components/inputs/CheckboxList.vue'
import { TranslateResult } from 'vue-i18n'
import SettingsGeneralDatabase from '@/components/mixins/settingsGeneralDatabase'

export default defineComponent({
    name: 'SettingsGeneralTabResetDatabase',
    components: { Panel, SettingsRow, CheckboxList },
    mixins: [BaseMixin, SettingsGeneralDatabase],
    data() {
        return {
            mdiHelpCircle: mdiHelpCircle,
            mdiCloseThick: mdiCloseThick,
            showDialog: false,
            resetableNamespaces: [] as { value: string; label: string | TranslateResult }[],
            resetCheckboxes: [] as string[],
        }
    },
    async mounted() {
        await this.loadResetableNamespaces()
    },
    methods: {
        onSelectResetCheckboxes(resetCheckboxes: string[]) {
            this.resetCheckboxes = resetCheckboxes
        },
        resetMainsailAction() {
            this.$store.dispatch('socket/addLoading', 'resetMainsail')
            this.$store.dispatch('gui/resetMoonrakerDB', this.resetCheckboxes)
        },
        async openDialog() {
            await this.loadResetableNamespaces()
            this.showDialog = true
        },
        async loadResetableNamespaces() {
            this.resetableNamespaces = await this.loadBackupableNamespaces()

            // stop if history is not enabled
            if (!this.moonrakerComponents.includes('history')) return

            this.resetableNamespaces.push({
                value: 'history_jobs',
                label: this.$t('Settings.GeneralTab.DbHistoryJobs'),
            })

            this.resetableNamespaces.push({
                value: 'history_totals',
                label: this.$t('Settings.GeneralTab.DbHistoryTotals'),
            })
        },
        closeDialog() {
            this.showDialog = false
        },
    },
})
</script>
