<template>
    <settings-row :title="group.name" :sub-title="subTitle" :dynamic-slot-width="true">
        <v-btn size="small" variant="outlined" class="ml-3" @click="editGroup">
            <v-icon start size="small">{{ mdiPencil }}</v-icon>
            {{ $t('Settings.Edit') }}
        </v-btn>
        <v-btn size="small" variant="outlined" class="ml-3 minwidth-0 px-2" color="error" @click="deleteGroup">
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
    name: 'SettingsMiscellaneousTabLightGroupsListEntry',
    components: { SettingsRow },
    mixins: [BaseMixin],
    props: {
        type: { type: String, required: true },
        name: { type: String, required: true },
        group: { type: Object, required: true },
    },
    emits: ['edit-group'],
    data() {
        return {
            mdiDelete: mdiDelete,
            mdiPencil: mdiPencil,
        }
    },
    computed: {
        subTitle() {
            return this.$t('Settings.MiscellaneousTab.GroupSubTitle', {
                start: this.group.start,
                end: this.group.end,
            })
        },
    },
    methods: {
        editGroup() {
            this.$emit('edit-group', this.group.id)
        },
        deleteGroup() {
            this.$store.dispatch('gui/miscellaneous/deleteLightgroup', {
                type: this.type,
                name: this.name,
                lightgroupId: this.group.id,
            })
        },
    },
})
</script>

<style scoped></style>
