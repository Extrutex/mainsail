<template>
    <div>
        <settings-miscellaneous-tab-light-groups
            v-if="page === 'groups'"
            :type="pageType"
            :name="pageName"
            @close="openPage" />
        <settings-miscellaneous-tab-light-presets
            v-else-if="page === 'presets'"
            :type="pageType"
            :name="pageName"
            @close="openPage" />
        <settings-miscellaneous-tab-list v-else @open-page="openPage" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import SettingsMiscellaneousTabList from '@/components/settings/Miscellaneous/SettingsMiscellaneousTabList.vue'
import SettingsMiscellaneousTabLightGroups from '@/components/settings/Miscellaneous/SettingsMiscellaneousTabLightGroups.vue'
import SettingsMiscellaneousTabLightPresets from '@/components/settings/Miscellaneous/SettingsMiscellaneousTabLightPresets.vue'
import MiscellaneousMixin from '@/components/mixins/miscellaneous'

export default defineComponent({
    name: 'SettingsMiscellaneousTab',
    components: {
        SettingsMiscellaneousTabList,
        SettingsMiscellaneousTabLightGroups,
        SettingsMiscellaneousTabLightPresets,
    },
    mixins: [BaseMixin, MiscellaneousMixin],
    data() {
        return {
            page: '',
            pageType: '',
            pageName: '',
        }
    },
    methods: {
        openPage(payload: { page: string; type: string; name: string } = { page: '', type: '', name: '' }) {
            this.page = payload.page
            this.pageType = payload.type
            this.pageName = payload.name
        },
    },
})
</script>
