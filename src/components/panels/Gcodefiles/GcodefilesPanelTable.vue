<template>
    <v-data-table
        v-model="selectedFiles"
        :items="files"
        class="files-table"
        :headers="filteredHeaders"
        :custom-sort="sortFiles"
        v-model:sort-by="sortBy"
        v-model:sort-desc="sortDesc"
        v-model:items-per-page="countPerPage"
        :footer-props="{
            itemsPerPageText: $t('Files.Files'),
            itemsPerPageAllText: $t('Files.AllFiles'),
            itemsPerPageOptions: [10, 25, 50, 100, -1],
        }"
        item-key="filename"
        :search="search"
        :custom-filter="advancedSearch"
        mobile-breakpoint="0"
        show-select
        @current-items="refreshMetadata">
        <template #no-data>
            <div class="text-center">{{ $t('Files.Empty') }}</div>
        </template>

        <template v-if="currentPath !== ''" #body.prepend>
            <gcodefiles-panel-table-row-back />
        </template>

        <template #item="{ index, item, isSelected, select }">
            <gcodefiles-panel-table-row-file
                v-if="!item.isDirectory"
                :key="`${index} ${item.filename}`"
                :item="item"
                :is-selected="isSelected"
                :select="select" />
            <gcodefiles-panel-table-row-directory
                v-else
                :key="`${index} ${item.filename}`"
                :item="item"
                :is-selected="isSelected"
                :select="select" />
        </template>
    </v-data-table>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { sortFiles } from '@/plugins/helpers'
import { FileStateGcodefile } from '@/store/files/types'
import GcodefilesMixin from '@/components/mixins/gcodefiles'
import GcodefilesPanelTableRowBack from '@/components/panels/Gcodefiles/GcodefilesPanelTableRowBack.vue'
import GcodefilesPanelTableRowDirectory from '@/components/panels/Gcodefiles/GcodefilesPanelTableRowDirectory.vue'
import GcodefilesPanelTableRowFile from '@/components/panels/Gcodefiles/GcodefilesPanelTableRowFile.vue'

export default defineComponent({
    name: 'GcodefilesPanelTable',
    components: {
        GcodefilesPanelTableRowBack,
        GcodefilesPanelTableRowDirectory,
        GcodefilesPanelTableRowFile,
    },
    mixins: [BaseMixin, GcodefilesMixin],
    data() {
        return {
            sortFiles: sortFiles,
        }
    },
    computed: {
        sortBy: {
            get() {
                return this.$store.state.gui.view.gcodefiles.sortBy ?? 'modified'
            },
            setsortBy(newVal) {
                if (newVal === undefined) newVal = 'modified'

                this.$store.dispatch('gui/saveSetting', { name: 'view.gcodefiles.sortBy', value: newVal })
            },
        },
        sortDesc: {
            get() {
                return this.$store.state.gui.view.gcodefiles.sortDesc ?? true
            },
            setsortDesc(newVal) {
                if (newVal === undefined) newVal = false

                this.$store.dispatch('gui/saveSetting', { name: 'view.gcodefiles.sortDesc', value: newVal })
            },
        },
        countPerPage: {
            get() {
                return this.$store.state.gui.view.gcodefiles.countPerPage ?? 10
            },
            setcountPerPage(newVal) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.gcodefiles.countPerPage', value: newVal })
            },
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
