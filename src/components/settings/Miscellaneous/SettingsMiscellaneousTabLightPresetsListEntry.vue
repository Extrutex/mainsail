<template>
    <settings-row :title="preset.name" :sub-title="subTitle" :dynamic-slot-width="true">
        <v-btn size="small" variant="outlined" class="ml-3" @click="editPreset">
            <v-icon start size="small">{{ mdiPencil }}</v-icon>
            {{ $t('Settings.Edit') }}
        </v-btn>
        <v-btn size="small" variant="outlined" class="ml-3 minwidth-0 px-2" color="error" @click="deletePreset">
            <v-icon size="small">{{ mdiDelete }}</v-icon>
        </v-btn>
    </settings-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { mdiDelete, mdiPencil } from '@mdi/js'

export default defineComponent({
    name: 'SettingsMiscellaneousTabLightPresetsListEntry',
    components: { SettingsRow },
    mixins: [BaseMixin],
    props: {
        type: { type: String, required: true },
        name: { type: String, required: true },
        preset: { type: Object, required: true },
    },
    emits: ['edit-preset'],
    data() {
        return {
            mdiDelete: mdiDelete,
            mdiPencil: mdiPencil,
        }
    },
    computed: {
        settings() {
            if (!this.type || !this.name) return null

            const key = `${this.type.toLowerCase()} ${this.name.toLowerCase()}`
            return this.$store.state.printer?.configfile?.settings[key] ?? {}
        },
        colorOrder() {
            if (this.type?.toLowerCase() === 'led') {
                let colorOrder = ''
                if ('red_pin' in this.settings) colorOrder += 'R'
                if ('green_pin' in this.settings) colorOrder += 'G'
                if ('blue_pin' in this.settings) colorOrder += 'B'
                if ('white_pin' in this.settings) colorOrder += 'W'

                return colorOrder
            }

            // is array
            if (Array.isArray(this.settings.color_order)) {
                return this.settings.color_order[0] ?? ''
            }

            return this.settings.color_order ?? ''
        },
        subTitle() {
            const output: string[] = []

            if (this.colorOrder.includes('R')) output.push(`R: ${this.preset.red}`)
            if (this.colorOrder.includes('G')) output.push(`G: ${this.preset.green}`)
            if (this.colorOrder.includes('B')) output.push(`B: ${this.preset.blue}`)
            if (this.colorOrder.includes('W')) output.push(`W: ${this.preset.white}`)

            return output.join(', ')
        },
    },
    methods: {
        editPreset() {
            this.$emit('edit-preset', this.preset.id)
        },
        deletePreset() {
            this.$store.dispatch('gui/miscellaneous/deletePreset', {
                type: this.type,
                name: this.name,
                presetId: this.preset.id,
            })
        },
    },
})
</script>
