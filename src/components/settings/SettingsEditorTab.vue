<template>
    <div>
        <v-card flat>
            <v-card-text>
                <settings-row
                    :title="$t('Settings.EditorTab.UseEscToClose')"
                    :sub-title="$t('Settings.EditorTab.UseEscToCloseDescription')"
                    :dynamic-slot-width="true">
                    <v-switch v-model="escToClose" hide-details class="mt-0" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.EditorTab.ConfirmUnsavedChanges')"
                    :sub-title="$t('Settings.EditorTab.ConfirmUnsavedChangesDescription')"
                    :dynamic-slot-width="true">
                    <v-switch v-model="confirmUnsavedChanges" hide-details class="mt-0" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.EditorTab.TabSize')"
                    :sub-title="$t('Settings.EditorTab.TabSizeDescription')"
                    :dynamic-slot-width="true">
                    <v-select
                        v-model="tabSize"
                        :items="tabSizes"
                        hide-details
                        variant="outlined"
                        density="compact"
                        attached />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.EditorTab.KlipperRestartMethod')"
                    :sub-title="$t('Settings.EditorTab.KlipperRestartMethodDescription')">
                    <v-select
                        v-model="klipperRestartMethod"
                        :items="klipperRestartMethods"
                        hide-details
                        variant="outlined"
                        density="compact"
                        attached />
                </settings-row>
            </v-card-text>
        </v-card>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'

export default defineComponent({
    name: 'SettingsEditorTab',
    components: { SettingsRow },
    mixins: [BaseMixin],
    data() {
        return {
            klipperRestartMethods: [
                {
                    text: 'FIRMWARE_RESTART',
                    value: 'FIRMWARE_RESTART',
                },
                {
                    text: 'RESTART',
                    value: 'RESTART',
                },
            ],
        }
    },
    computed: {
        tabSizes() {
            const spaces = [2, 4, 6, 8]
            return spaces.map((space) => ({
                text: this.$t('Settings.EditorTab.Spaces', { count: space }),
                value: space,
            }))
        },
        escToClose: {
            get() {
                return this.$store.state.gui.editor.escToClose
            },
            setescToClose(newVal) {
                this.$store.dispatch('gui/saveSetting', { name: 'editor.escToClose', value: newVal })
            },
        },
        confirmUnsavedChanges: {
            get() {
                return this.$store.state.gui.editor.confirmUnsavedChanges
            },
            setconfirmUnsavedChanges(newVal) {
                this.$store.dispatch('gui/saveSetting', { name: 'editor.confirmUnsavedChanges', value: newVal })
            },
        },
        tabSize: {
            get() {
                return this.$store.state.gui.editor.tabSize || 2
            },
            settabSize(newVal) {
                this.$store.dispatch('gui/saveSetting', { name: 'editor.tabSize', value: newVal })
            },
        },
        klipperRestartMethod: {
            get() {
                return this.$store.state.gui.editor.klipperRestartMethod
            },
            setklipperRestartMethod(newVal) {
                this.$store.dispatch('gui/saveSetting', { name: 'editor.klipperRestartMethod', value: newVal })
            },
        },
    },
})
</script>
