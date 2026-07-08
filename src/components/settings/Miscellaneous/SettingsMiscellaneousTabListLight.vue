<template>
    <settings-row :title="outputName" :dynamic-slot-width="true">
        <v-btn v-if="chainCount > 1" size="small" variant="outlined" class="ml-3" @click="openGroups">
            <v-icon start size="small">{{ mdiPencil }}</v-icon>
            {{ $t('Settings.MiscellaneousTab.Groups') }}
        </v-btn>
        <v-btn size="small" variant="outlined" class="ml-3" @click="openPresets">
            <v-icon start size="small">{{ mdiPalette }}</v-icon>
            {{ $t('Settings.MiscellaneousTab.Presets') }}
        </v-btn>
    </settings-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '../../mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { mdiPalette, mdiPencil } from '@mdi/js'
import { convertName } from '@/plugins/helpers'
import MiscellaneousMixin from '@/components/mixins/miscellaneous'

export default defineComponent({
    name: 'SettingsMiscellaneousTabListLight',
    components: { SettingsRow },
    mixins: [BaseMixin, MiscellaneousMixin],
    props: {
        type: { type: String, required: true },
        name: { type: String, required: true },
    },
    emits: ['open-page'],
    data() {
        return {
            mdiPalette: mdiPalette,
            mdiPencil: mdiPencil,
            convertName: convertName,
        }
    },
    computed: {
        outputName() {
            return this.convertName(this.name)
        },
        settings() {
            const key = `${this.type.toLowerCase()} ${this.name.toLowerCase()}`
            const settings = this.$store.state.printer.configfile?.settings ?? {}

            return settings[key] ?? {}
        },
        chainCount() {
            return this.settings.chain_count ?? 1
        },
    },
    methods: {
        openGroups() {
            this.$emit('open-page', { page: 'groups', type: this.type, name: this.name })
        },
        openPresets() {
            this.$emit('open-page', { page: 'presets', type: this.type, name: this.name })
        },
    },
})
</script>
