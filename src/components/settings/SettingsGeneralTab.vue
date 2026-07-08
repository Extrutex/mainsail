<template>
    <div>
        <v-card flat>
            <v-card-text>
                <settings-row :title="$t('Settings.GeneralTab.PrinterName')">
                    <v-text-field
                        v-model="printerName"
                        hide-details
                        variant="outlined"
                        density="compact"></v-text-field>
                </settings-row>
                <v-divider class="my-2" />
                <settings-row :title="$t('Settings.GeneralTab.Language')">
                    <v-select
                        v-model="currentLanguage"
                        :items="availableLanguages"
                        hide-details
                        variant="outlined"
                        density="compact" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row :title="$t('Settings.GeneralTab.DateFormat')">
                    <v-select
                        v-model="dateFormat"
                        :items="dateFormatItems"
                        hide-details
                        variant="outlined"
                        density="compact" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row :title="$t('Settings.GeneralTab.TimeFormat')">
                    <v-select
                        v-model="timeFormat"
                        :items="timeFormatItems"
                        hide-details
                        variant="outlined"
                        density="compact" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.GeneralTab.CalcPrintProgress')"
                    :sub-title="$t('Settings.GeneralTab.CalcPrintProgressDescription')">
                    <v-select
                        v-model="calcPrintProgress"
                        :items="calcPrintProgressItems"
                        hide-details
                        density="compact"
                        variant="outlined" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.GeneralTab.CalcEstimateTime')"
                    :sub-title="$t('Settings.GeneralTab.CalcEstimateTimeDescription')">
                    <v-select
                        v-model="calcEstimateTime"
                        :items="calcEstimateItems"
                        multiple
                        hide-details
                        density="compact"
                        variant="outlined" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.GeneralTab.CalcEtaTime')"
                    :sub-title="$t('Settings.GeneralTab.CalcEtaTimeDescription')">
                    <v-select
                        v-model="calcEtaTime"
                        :items="calcEtaTimeItems"
                        multiple
                        hide-details
                        density="compact"
                        variant="outlined" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row :title="$t('Settings.GeneralTab.MainsailSettingsMoonrakerDb')" :dynamic-slot-width="true">
                    <settings-general-tab-backup-database />
                    <settings-general-tab-restore-database />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row :title="$t('Settings.GeneralTab.FactoryReset')" :dynamic-slot-width="true">
                    <settings-general-tab-reset-database />
                </settings-row>
            </v-card-text>
        </v-card>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import SettingsGeneralTabBackupDatabase from '@/components/settings/General/GeneralBackup.vue'
import SettingsGeneralTabRestoreDatabase from '@/components/settings/General/GeneralRestore.vue'
import SettingsGeneralTabResetDatabase from '@/components/settings/General/GeneralReset.vue'
import SettingsGeneralDatabase from '@/components/mixins/settingsGeneralDatabase'

export default defineComponent({
    name: 'SettingsGeneralTab',
    components: {
        SettingsRow,
        SettingsGeneralTabBackupDatabase,
        SettingsGeneralTabRestoreDatabase,
        SettingsGeneralTabResetDatabase,
    },
    mixins: [BaseMixin, SettingsGeneralDatabase],
    data() {
        return {
            availableLanguages: [] as { text: string; value: string }[],
        }
    },
    computed: {
        printerName: {
            get() {
                return this.$store.state.gui.general.printername
            },
            set(newVal) {
                this.$store.dispatch('gui/saveSetting', { name: 'general.printername', value: newVal })
            },
        },
        currentLanguage: {
            get() {
                return this.$store.state.gui.general.language
            },
            set(newVal) {
                this.$store.dispatch('gui/saveSetting', { name: 'general.language', value: newVal })
            },
        },
        dateFormat: {
            get() {
                return this.$store.state.gui.general.dateFormat
            },
            set(newVal) {
                this.$store.dispatch('gui/saveSetting', { name: 'general.dateFormat', value: newVal })
            },
        },
        dateFormatItems() {
            const date = new Date()
            const availableFormats = [
                null,
                'short',
                'iso',
                'mm-dd-yyyy',
                'mm-dd-yy',
                'm-d-yyyy',
                'm-d-yy',
                'dd-mm-yyyy',
                'dd-mm-yy',
                'dd.mm.yyyy',
                'dd.mm.yy',
                'd.m.yyyy',
                'd.m.yy',
                'yyyy. mm. dd.',
                'yy. mm. dd.',
            ]

            return availableFormats.map((format) => {
                let name = format
                if (name === null) name = 'Browser'
                else if (['short', 'iso'].includes(name)) name = name.toUpperCase()

                let example = this.formatDate(date, format)
                if (format === null) example = date.toLocaleDateString(this.browserLocale, { dateStyle: 'medium' })

                return {
                    value: format,
                    text: `${name} (${example})`,
                }
            })
        },
        timeFormat: {
            get() {
                return this.$store.state.gui.general.timeFormat
            },
            set(newVal) {
                this.$store.dispatch('gui/saveSetting', { name: 'general.timeFormat', value: newVal })
            },
        },
        timeFormatItems() {
            const date = new Date()
            const userLocale =
                navigator.languages && navigator.languages.length ? navigator.languages[0] : navigator.language

            return [
                { value: null, text: `Browser (${date.toLocaleTimeString(userLocale, { timeStyle: 'short' })})` },
                {
                    value: '24hours',
                    text: this.$t('Settings.GeneralTab.24hours', {
                        time: date.toLocaleTimeString(userLocale, {
                            hour: '2-digit',
                            minute: '2-digit',
                            hourCycle: 'h23',
                        }),
                    }),
                },
                {
                    value: '12hours',
                    text: this.$t('Settings.GeneralTab.12hours', {
                        time: date.toLocaleTimeString(userLocale, {
                            hour: '2-digit',
                            minute: '2-digit',
                            hourCycle: 'h12',
                        }),
                    }),
                },
            ]
        },
        calcPrintProgressItems() {
            return [
                { value: 'file-relative', text: this.$t('Settings.GeneralTab.CalcPrintProgressItems.FileRelative') },
                { value: 'file-absolute', text: this.$t('Settings.GeneralTab.CalcPrintProgressItems.FileAbsolute') },
                { value: 'slicer', text: this.$t('Settings.GeneralTab.CalcPrintProgressItems.Slicer') },
                { value: 'filament', text: this.$t('Settings.GeneralTab.CalcPrintProgressItems.Filament') },
            ]
        },
        calcPrintProgress: {
            get() {
                return this.$store.state.gui.general.calcPrintProgress ?? 'file-relative'
            },
            set(newVal) {
                this.$store.dispatch('gui/saveSetting', { name: 'general.calcPrintProgress', value: newVal })
            },
        },
        calcEstimateItems() {
            return [
                { value: 'file', text: this.$t('Settings.GeneralTab.EstimateValues.File') },
                { value: 'filament', text: this.$t('Settings.GeneralTab.EstimateValues.Filament') },
            ]
        },
        calcEstimateTime: {
            get() {
                return this.$store.state.gui.general.calcEstimateTime
            },
            set(newVal) {
                this.$store.dispatch('gui/saveSetting', { name: 'general.calcEstimateTime', value: newVal })
            },
        },
        calcEtaTimeItems() {
            return [
                { value: 'file', text: this.$t('Settings.GeneralTab.EstimateValues.File') },
                { value: 'filament', text: this.$t('Settings.GeneralTab.EstimateValues.Filament') },
                { value: 'slicer', text: this.$t('Settings.GeneralTab.EstimateValues.Slicer') },
            ]
        },
        calcEtaTime: {
            get() {
                return this.$store.state.gui.general.calcEtaTime
            },
            set(newVal) {
                this.$store.dispatch('gui/saveSetting', { name: 'general.calcEtaTime', value: newVal })
            },
        },
    },
    async created() {
        const locales = import.meta.glob('../../locales/*.json', { import: 'default' })
        const languages: { text: string; value: string }[] = []

        for (const file in locales) {
            const langKey = file.slice(file.lastIndexOf('/') + 1, file.lastIndexOf('.'))
            const locale = (await locales[file]()) as { title: string }

            languages.push({
                text: locale.title,
                value: langKey,
            })
        }

        this.availableLanguages = languages.sort((a, b) => a.text.localeCompare(b.text))
    },
})
</script>
