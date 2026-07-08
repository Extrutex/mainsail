<style scoped></style>

<template>
    <div>
        <v-card v-if="!form.bool" flat>
            <v-card-text>
                <div class="d-flex align-center">
                    <v-icon style="opacity: 0.7">{{ mdiConsoleLine }}</v-icon>
                    <v-card-title class="mx-n2">
                        {{ $t('Settings.ConsoleTab.Console') }}
                    </v-card-title>
                    <v-divider class="ml-3"></v-divider>
                </div>
                <settings-row :title="$t('Settings.ConsoleTab.Direction').toString()">
                    <v-select
                        v-model="consoleDirection"
                        :items="availableDirections"
                        hide-details
                        variant="outlined"
                        density="compact"
                        attach></v-select>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.ConsoleTab.EntryStyle').toString()">
                    <v-select
                        v-model="entryStyle"
                        :items="availableEntryStyles"
                        hide-details
                        variant="outlined"
                        density="compact"
                        attach></v-select>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.ConsoleTab.Height').toString()">
                    <v-slider
                        v-model="consoleHeightTmp"
                        hide-details
                        :min="200"
                        :max="900"
                        :step="10"
                        :label="consoleHeightTmp + 'px'"
                        @change="updateConsoleHeight"></v-slider>
                </settings-row>
                <div class="d-flex align-center">
                    <v-icon style="opacity: 0.7">{{ mdiFilter }}</v-icon>
                    <v-card-title class="mx-n2">
                        {{ $t('Settings.ConsoleTab.Filters') }}
                    </v-card-title>
                    <v-divider class="ml-3"></v-divider>
                </div>
                <settings-row :title="$t('Settings.ConsoleTab.HideTemperatures').toString()" :dynamic-slot-width="true">
                    <v-switch v-model="hideWaitTemperatures" hide-details class="mt-0"></v-switch>
                </settings-row>
                <template v-if="moonrakerComponents.includes('timelapse')">
                    <v-divider class="my-2"></v-divider>
                    <settings-row
                        :title="$t('Settings.ConsoleTab.HideTimelapse').toString()"
                        :dynamic-slot-width="true">
                        <v-switch v-model="hideTimelapse" hide-details class="mt-0"></v-switch>
                    </settings-row>
                </template>
                <v-divider class="my-2"></v-divider>
                <div v-for="(filter, index) in consoleFilters" :key="index">
                    <v-divider v-if="index" class="my-2"></v-divider>
                    <settings-row :title="filter.name">
                        <v-btn
                            size="small"
                            variant="outlined"
                            class="minwidth-0 px-2"
                            :color="filter.bool ? 'white' : 'grey'"
                            @click="toggleFilter(filter)">
                            <v-icon size="small">{{ filter.bool ? mdiFilter : mdiFilterOff }}</v-icon>
                        </v-btn>
                        <v-btn size="small" variant="outlined" class="ml-3" @click="editFilter(filter)">
                            <v-icon start size="small">{{ mdiPencil }}</v-icon>
                            {{ $t('Settings.Edit') }}
                        </v-btn>
                        <v-btn
                            size="small"
                            variant="outlined"
                            class="ml-3 minwidth-0 px-2"
                            color="error"
                            @click="deleteFilter(filter.id)">
                            <v-icon size="small">{{ mdiDelete }}</v-icon>
                        </v-btn>
                    </settings-row>
                </div>
            </v-card-text>
            <v-card-actions class="d-flex justify-end">
                <v-btn variant="text" color="primary" @click="createFilter">
                    {{ $t('Settings.ConsoleTab.AddFilter') }}
                </v-btn>
            </v-card-actions>
        </v-card>
        <v-card v-else flat>
            <v-form v-model="form.valid" @submit.prevent="saveFilter">
                <v-card-title>
                    {{
                        form.id === null
                            ? $t('Settings.ConsoleTab.CreateHeadline')
                            : $t('Settings.ConsoleTab.EditHeadline')
                    }}
                </v-card-title>
                <v-card-text>
                    <settings-row :title="$t('Settings.ConsoleTab.Name').toString()">
                        <v-text-field
                            v-model="form.name"
                            hide-details="auto"
                            :rules="[rules.required, rules.unique]"
                            density="compact"
                            variant="outlined"></v-text-field>
                    </settings-row>
                    <v-divider class="my-2"></v-divider>
                    <settings-row :title="$t('Settings.ConsoleTab.Regex').toString()">
                        <v-textarea v-model="form.regex" variant="outlined" hide-details="auto"></v-textarea>
                    </settings-row>
                </v-card-text>
                <v-card-actions class="d-flex justify-end">
                    <v-btn variant="text" @click="form.bool = false">
                        {{ $t('Buttons.Cancel') }}
                    </v-btn>
                    <v-btn color="primary" variant="text" type="submit">
                        {{
                            form.id === null
                                ? $t('Settings.ConsoleTab.StoreButton')
                                : $t('Settings.ConsoleTab.UpdateButton')
                        }}
                    </v-btn>
                </v-card-actions>
            </v-form>
        </v-card>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { debounce } from '@/plugins/helpers'
import BaseMixin from '../mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { Debounce } from 'vue-debounce-decorator'
import { mdiFilter, mdiPencil, mdiFilterOff, mdiDelete, mdiConsoleLine } from '@mdi/js'
import { GuiConsoleStateFilter } from '@/store/gui/console/types'

interface consoleForm {
    bool: boolean
    id: string | null
    valid: boolean
    name: string
    regex: string
}

type ConsoleFilter = Omit<GuiConsoleStateFilter, 'id'> & { id: string }

export default defineComponent({
    name: 'SettingsConsoleTab',
    components: { SettingsRow },
    mixins: [BaseMixin],
    data() {
        return {
            mdiFilter: mdiFilter,
            mdiFilterOff: mdiFilterOff,
            mdiPencil: mdiPencil,
            mdiDelete: mdiDelete,
            mdiConsoleLine: mdiConsoleLine,
            form: {
                bool: false,
                valid: false,
                name: '',
                regex: '',
                id: null,
            } as consoleForm,
            rules: {
                required: (value: string) => value !== '' || 'required',
                unique: (value: string) => !this.existsPresetName(value) || 'Name already exists',
            },
            consoleHeightTmp: 300,
        }
    },
    computed: {
        consoleFilters() {
            return (this.$store.getters['gui/console/getConsolefilters'] ?? []) as ConsoleFilter[]
        },
        availableDirections() {
            return [
                {
                    text: this.$t('Settings.ConsoleTab.DirectionTable'),
                    value: 'table',
                },
                {
                    text: this.$t('Settings.ConsoleTab.DirectionShell'),
                    value: 'shell',
                },
            ]
        },
        consoleDirection: {
            get() {
                return this.$store.state.gui.console.direction ?? 'table'
            },
            setconsoleDirection(newVal) {
                this.$store.dispatch('gui/console/saveSetting', { name: 'direction', value: newVal })
            },
        },
        availableEntryStyles() {
            return [
                {
                    text: this.$t('Settings.ConsoleTab.EntryStyleDefault'),
                    value: 'default',
                },
                {
                    text: this.$t('Settings.ConsoleTab.EntryStyleCompact'),
                    value: 'compact',
                },
            ]
        },
        entryStyle: {
            get() {
                return this.$store.state.gui.console.entryStyle ?? 'default'
            },
            setentryStyle(newVal) {
                this.$store.dispatch('gui/console/saveSetting', { name: 'entryStyle', value: newVal })
            },
        },
        consoleHeight: {
            get() {
                return this.$store.state.gui.console.height ?? 300
            },
            setconsoleHeight(newVal) {
                this.$store.dispatch('gui/console/saveSetting', { name: 'height', value: newVal })
            },
        },
        hideWaitTemperatures: {
            get() {
                return this.$store.state.gui.console.hideWaitTemperatures
            },
            sethideWaitTemperatures(newVal) {
                this.$store.dispatch('gui/console/saveSetting', { name: 'hideWaitTemperatures', value: newVal })
            },
        },
        hideTimelapse: {
            get() {
                return this.$store.state.gui.console.hideTlCommands
            },
            sethideTimelapse(newVal) {
                this.$store.dispatch('gui/console/saveSetting', { name: 'hideTlCommands', value: newVal })
            },
        },
    },
    watch: {
        consoleHeight(newVal: number) {
            this.consoleHeightTmp = newVal
        },
    },
    mounted() {
        this.consoleHeightTmp = this.consoleHeight
    },
    methods: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updateConsoleHeight: debounce(function (this: any, newVal: number) {
            this.consoleHeight = newVal
        }, 500),
        existsPresetName(name: string) {
            return this.consoleFilters.some((filter) => filter.name === name && filter.id !== this.form.id)
        },
        clearForm() {
            this.form.bool = false
            this.form.id = null
            this.form.name = ''
            this.form.regex = ''
        },
        toggleFilter(filter: ConsoleFilter) {
            const values = {
                name: filter.name,
                bool: !filter.bool,
                regex: filter.regex,
            }

            this.$store.dispatch('gui/console/filterUpdate', { id: filter.id, values })
        },
        createFilter() {
            this.clearForm()
            this.form.bool = true
        },
        editFilter(filter: ConsoleFilter) {
            this.form.name = filter.name
            this.form.id = filter.id
            this.form.regex = filter.regex

            this.form.bool = true
        },
        saveFilter() {
            if (this.form.valid) {
                const filter = {
                    name: this.form.name,
                    bool: this.form.bool,
                    regex: this.form.regex,
                }

                if (this.form.id) this.$store.dispatch('gui/console/filterUpdate', { id: this.form.id, values: filter })
                else this.$store.dispatch('gui/console/filterStore', { values: filter })

                this.clearForm()
            }
        },
        deleteFilter(id: string) {
            this.$store.dispatch('gui/console/filterDelete', id)
        },
    },
})
</script>
