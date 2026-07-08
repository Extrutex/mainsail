<template>
    <v-card flat>
        <v-form @submit.prevent="saveCooldown">
            <v-card-title>{{ $t('Settings.PresetsTab.EditCooldown') }}</v-card-title>
            <v-card-text>
                <settings-row :title="$t('Settings.PresetsTab.CustomGCode')">
                    <v-textarea v-model="gcode" variant="outlined" hide-details />
                </settings-row>
            </v-card-text>
            <v-card-actions class="d-flex justify-end">
                <v-btn variant="text" @click="closeForm">
                    {{ $t('Buttons.Cancel') }}
                </v-btn>
                <v-btn color="primary" variant="text" type="submit">
                    {{ $t('Settings.PresetsTab.UpdateCooldown') }}
                </v-btn>
            </v-card-actions>
        </v-form>
    </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { mdiDelete, mdiPencil } from '@mdi/js'

export default defineComponent({
    name: 'PresetsFormCooldown',
    components: { SettingsRow },
    mixins: [BaseMixin],
    props: {
        inputGcode: { type: String, required: true },
    },
    emits: ['close'],
    data() {
        return {
            mdiPencil: mdiPencil,
            mdiDelete: mdiDelete,
            gcode: '',
        }
    },
    mounted() {
        this.gcode = this.inputGcode
    },
    methods: {
        closeForm() {
            this.$emit('close')
        },
        saveCooldown() {
            this.$store.dispatch('gui/presets/saveSetting', { name: 'cooldownGcode', value: this.gcode })
            this.closeForm()
        },
    },
})
</script>
