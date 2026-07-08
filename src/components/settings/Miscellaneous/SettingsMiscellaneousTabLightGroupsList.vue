<template>
    <div>
        <v-card-text>
            <h3 class="text-h5 mb-3">{{ $t('Settings.MiscellaneousTab.LightGroups', { name }) }}</h3>
            <template v-if="groups.length">
                <div v-for="(group, index) in groups" :key="group.id">
                    <v-divider v-if="index" class="my-2" />
                    <settings-miscellaneous-tab-light-groups-list-entry
                        :type="type"
                        :name="name"
                        :group="group"
                        @edit-group="editGroup" />
                </div>
            </template>
            <p v-else class="mb-0 text-center font-italic">{{ $t('Settings.MiscellaneousTab.NoGroupFound') }}</p>
        </v-card-text>
        <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="close">{{ $t('Buttons.Close') }}</v-btn>
            <v-btn variant="text" color="primary" @click="createGroup">
                {{ $t('Settings.MiscellaneousTab.AddGroup') }}
            </v-btn>
        </v-card-actions>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '../../mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { caseInsensitiveSort } from '@/plugins/helpers'
import { GuiMiscellaneousStateEntryLightgroup } from '@/store/gui/miscellaneous/types'

export default defineComponent({
    name: 'SettingsMiscellaneousTabLightGroupsList',
    components: {
        SettingsRow,
    },
    mixins: [BaseMixin],
    props: {
        type: { type: String, required: true },
        name: { type: String, required: true },
    },
    emits: ['close', 'create-group', 'edit-group'],
    computed: {
        entry() {
            const entries = this.$store.state.gui.miscellaneous.entries ?? {}
            const key =
                Object.keys(entries).find((key) => {
                    const entry = entries[key]
                    return entry.type === this.type && entry.name === this.name
                }) ?? ''

            return entries[key] ?? {}
        },
        groups() {
            if (!this.entry) return []

            const lightgroups = this.entry.lightgroups ?? {}

            const groups: GuiMiscellaneousStateEntryLightgroup[] = []
            Object.keys(lightgroups).forEach((key) => {
                groups.push({
                    name: lightgroups[key].name,
                    start: lightgroups[key].start,
                    end: lightgroups[key].end,
                    id: key,
                })
            })

            return caseInsensitiveSort(groups, 'name')
        },
    },
    methods: {
        editGroup(groupId: string) {
            this.$emit('edit-group', groupId)
        },
        close() {
            this.$emit('close')
        },
        createGroup() {
            this.$emit('create-group')
        },
    },
})
</script>
