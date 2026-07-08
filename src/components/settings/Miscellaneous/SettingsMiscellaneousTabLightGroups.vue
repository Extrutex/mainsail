<template>
    <settings-miscellaneous-tab-light-groups-form
        v-if="page === 'form'"
        :type="type"
        :name="name"
        :group-id="groupId"
        @close="openPage('')" />
    <settings-miscellaneous-tab-light-groups-list
        v-else
        :type="type"
        :name="name"
        @create-group="openPage('form')"
        @edit-group="editGroup"
        @close="close" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'

export default defineComponent({
    name: 'SettingsMiscellaneousTabLightGroups',
    mixins: [BaseMixin],
    props: {
        type: { type: String, required: true },
        name: { type: String, required: true },
    },
    emits: ['close'],
    data() {
        return {
            page: '',
            groupId: null as string | null,
        }
    },
    methods: {
        editGroup(groupId: string) {
            this.openPage('form')
            this.groupId = groupId
        },
        openPage(name: string) {
            this.page = name
            this.groupId = null
        },
        close() {
            this.$emit('close')
        },
    },
})
</script>
