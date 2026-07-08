<template>
    <v-data-table
        v-model="selectedFiles"
        :items="sortedFiles"
        class="files-table"
        :headers="vuetifyHeaders"
        :custom-key-sort="noopSortMap"
        v-model:sort-by="vuetifySortBy"
        v-model:items-per-page="countPerPage"
        :items-per-page-text="$t('Files.Files')"
        :items-per-page-options="[10, 25, 50, 100, -1]"
        item-value="filename"
        :search="search"
        :custom-filter="advancedSearch"
        mobile-breakpoint="0"
        show-select
        @update:current-items="refreshMetadata">
        <template #no-data>
            <div class="text-center">{{ $t('Files.Empty') }}</div>
        </template>

        <template v-if="currentPath !== ''" #body.prepend>
            <gcodefiles-panel-table-row-back />
        </template>

        <template #item="{ index, item, isSelected, toggleSelect }">
            <gcodefiles-panel-table-row-file
                v-if="!item.isDirectory"
                :key="`${index} ${item.filename}`"
                :item="item"
                :is-selected="isSelected(item)"
                :select="() => toggleSelect(item)" />
            <gcodefiles-panel-table-row-directory
                v-else
                :key="`${index} ${item.filename}`"
                :item="item"
                :is-selected="isSelected(item)"
                :select="() => toggleSelect(item)" />
        </template>
    </v-data-table>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { sortFiles } from '@/plugins/helpers'
import { FileStateFile, FileStateGcodefile } from '@/store/files/types'
import GcodefilesMixin from '@/components/mixins/gcodefiles'
import GcodefilesPanelTableRowBack from '@/components/panels/Gcodefiles/GcodefilesPanelTableRowBack.vue'
import GcodefilesPanelTableRowDirectory from '@/components/panels/Gcodefiles/GcodefilesPanelTableRowDirectory.vue'
import GcodefilesPanelTableRowFile from '@/components/panels/Gcodefiles/GcodefilesPanelTableRowFile.vue'

interface VuetifySortItem {
    key: string
    order?: boolean | 'asc' | 'desc'
}

export default defineComponent({
    name: 'GcodefilesPanelTable',
    components: {
        GcodefilesPanelTableRowBack,
        GcodefilesPanelTableRowDirectory,
        GcodefilesPanelTableRowFile,
    },
    mixins: [BaseMixin, GcodefilesMixin],
    computed: {
        sortBy: {
            get(): string {
                return this.$store.state.gui.view.gcodefiles.sortBy ?? 'modified'
            },
            set(newVal: string) {
                if (newVal === undefined) newVal = 'modified'

                this.$store.dispatch('gui/saveSetting', { name: 'view.gcodefiles.sortBy', value: newVal })
            },
        },
        sortDesc: {
            get(): boolean {
                return this.$store.state.gui.view.gcodefiles.sortDesc ?? true
            },
            set(newVal: boolean) {
                if (newVal === undefined) newVal = false

                this.$store.dispatch('gui/saveSetting', { name: 'view.gcodefiles.sortDesc', value: newVal })
            },
        },
        countPerPage: {
            get() {
                return this.$store.state.gui.view.gcodefiles.countPerPage ?? 10
            },
            set(newVal) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.gcodefiles.countPerPage', value: newVal })
            },
        },

        // sorting is fully handled by `sortFiles` (see `sortedFiles`); the table only needs
        // `sort-by` to drive the header arrows/click handling, bridged to the two store fields.
        vuetifySortBy: {
            get(): VuetifySortItem[] {
                return [{ key: this.sortBy, order: this.sortDesc ? 'desc' : 'asc' }]
            },
            set(newVal: VuetifySortItem[]) {
                const entry = newVal[0]
                this.sortBy = entry?.key ?? 'modified'
                this.sortDesc = entry?.order === 'desc'
            },
        },

        sortedFiles(): FileStateFile[] {
            return sortFiles(this.files.slice(), [this.sortBy], [this.sortDesc])
        },

        vuetifyHeaders() {
            return this.filteredHeaders.map((header) => ({
                title: header.text,
                key: header.value,
                sortable: header.sortable,
                class: header.class,
            }))
        },

        // sort() is already applied by `sortedFiles`; keep the table's own re-sort a no-op
        // (stable sort keeps our order) so header clicks still work without double-sorting.
        noopSortMap() {
            const map: Record<string, () => number> = {}
            this.filteredHeaders.forEach((header) => {
                if (header.sortable !== false) map[header.value] = () => 0
            })

            return map
        },
    },
    methods: {
        advancedSearch(value: unknown, search: string | null) {
            if (search === null) return false
            if (typeof value !== 'string') return false

            value = value.toString().toLowerCase()
            const searchSplits = search.toLowerCase().split(' ')
            for (const searchWord of searchSplits) {
                if (!value.includes(searchWord)) return false
            }

            return true
        },
        refreshMetadata(data: FileStateGcodefile[]) {
            const items = data.filter((file) => !file.isDirectory && !file.metadataRequested && !file.metadataPulled)
            this.$store.dispatch(
                'files/requestMetadata',
                items.map((file: FileStateGcodefile) => ({
                    filename: 'gcodes' + this.currentPath + '/' + file.filename,
                }))
            )
        },
    },
})
</script>

<style scoped>
.files-table :deep(.v-data-table-header__icon) {
    margin-left: 7px;
}

.files-table :deep(.file-list-cursor:hover) {
    cursor: pointer;
}

.files-table :deep(.v-data-table-header th:first-child) {
    padding-right: 0;
}
</style>
