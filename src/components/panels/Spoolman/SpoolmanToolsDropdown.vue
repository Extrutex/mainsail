<template>
    <v-menu :offset-y="true" :close-on-content-click="false" left>
        <template #activator="{ props }">
            <v-btn icon tile v-bind="props">
                <v-icon>{{ mdiSwapVertical }}</v-icon>
            </v-btn>
        </template>
        <v-list density="compact">
            <v-list-item>
                <v-btn size="small" @click="showChangeSpoolDialog = true">
                    <v-icon start>{{ mdiSwapVertical }}</v-icon>
                    {{ $t('Panels.SpoolmanPanel.ActiveSpool') }}
                </v-btn>
            </v-list-item>
            <spoolman-tools-dropdown-item v-for="tool in tools" :key="tool" :object-name="tool" />
        </v-list>
        <spoolman-change-spool-dialog v-model="showChangeSpoolDialog" />
    </v-menu>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { mdiSwapVertical } from '@mdi/js'
import SpoolmanToolsDropdownItem from '@/components/panels/Spoolman/SpoolmanToolsDropdownItem.vue'

export default defineComponent({
    name: 'SpoolmanToolsDropdown',
    components: { SpoolmanToolsDropdownItem },
    mixins: [BaseMixin],
    props: {
        tools: { type: Array as PropType<string[]>, required: false, default: () => [] },
    },
    data() {
        return {
            mdiSwapVertical: mdiSwapVertical,
            showChangeSpoolDialog: false,
        }
    },
})
</script>
