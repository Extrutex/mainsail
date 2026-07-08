<template>
    <v-card flat>
        <v-card-text v-if="showGeneral">
            <h3 class="text-h5 mb-3">{{ $t('Settings.MacrosTab.General') }}</h3>
            <settings-row :title="$t('Settings.MacrosTab.Management')">
                <v-select
                    v-model="mode"
                    :items="modes"
                    variant="outlined"
                    density="compact"
                    hide-details
                    attach></v-select>
            </settings-row>
            <v-divider class="my-2"></v-divider>
        </v-card-text>
        <template v-if="mode === 'expert'">
            <settings-macros-tab-expert
                @update:showGeneral="updateShowGeneral"
                @scrollToTop="scrollToTop"></settings-macros-tab-expert>
        </template>
        <template v-else>
            <settings-macros-tab-simple></settings-macros-tab-simple>
        </template>
    </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '../mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import SettingsMacrosTabSimple from '@/components/settings/SettingsMacrosTabSimple.vue'
import SettingsMacrosTabExpert from '@/components/settings/SettingsMacrosTabExpert.vue'

export default defineComponent({
    name: 'SettingsMacrosTab',
    components: { SettingsMacrosTabExpert, SettingsMacrosTabSimple, SettingsRow },
    mixins: [BaseMixin],
    emits: ['scrollToTop'],
    data() {
        return {
            showGeneral: true,
        }
    },
    computed: {
        modes() {
            return [
                {
                    text: this.$t('Settings.MacrosTab.Simple'),
                    value: 'simple',
                },
                {
                    text: this.$t('Settings.MacrosTab.Expert'),
                    value: 'expert',
                },
            ]
        },
        mode: {
            get() {
                return this.$store.state.gui?.macros?.mode ?? 'simple'
            },
            setmode(newVal) {
                this.$store.dispatch('gui/macros/saveSetting', { name: 'mode', value: newVal })
            },
        },
    },
    methods: {
        updateShowGeneral(newVal: boolean) {
            this.showGeneral = newVal
        },
        scrollToTop() {
            this.$emit('scrollToTop')
        },
    },
})
</script>
