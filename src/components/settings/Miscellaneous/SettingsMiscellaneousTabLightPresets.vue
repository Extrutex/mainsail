<template>
    <settings-miscellaneous-tab-light-presets-form
        v-if="page === 'form'"
        :type="type"
        :name="name"
        :preset-id="presetId"
        @close="openPage('')" />
    <settings-miscellaneous-tab-light-presets-list
        v-else
        :type="type"
        :name="name"
        @create-preset="openPage('form')"
        @edit-preset="editPreset"
        @close="close" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'

export default defineComponent({
    name: 'SettingsMiscellaneousTabLightPresets',
    mixins: [BaseMixin],
    props: {
        type: { type: String, required: true },
        name: { type: String, required: true },
    },
    emits: ['close'],
    data() {
        return {
            page: '',
            presetId: null as string | null,
        }
    },
    methods: {
        editPreset(groupId: string) {
            this.openPage('form')
            this.presetId = groupId
        },
        openPage(name: string) {
            this.page = name
            this.presetId = null
        },
        close() {
            this.$emit('close')
        },
    },
})
</script>
