<template>
    <v-card ref="filesGcodeCard" class="filesGcodeCard" variant="flat">
        <v-data-table
            :items="gcodeFiles"
            hide-default-header
            hide-default-footer
            class="dashboard-gcodes-table"
            :sort-by="[{ key: 'time_added' }]"
            mobile-breakpoint="0">
            <template #no-data>
                <div class="text-center">{{ $t('Panels.StatusPanel.EmptyGcodes') }}</div>
            </template>

            <template #item="{ item }">
                <status-panel-gcodefiles-entry :key="item.filename" :content-td-width="contentTdWidth" :item="item" />
            </template>
        </v-data-table>
    </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import BaseMixin from '@/components/mixins/base'
import ControlMixin from '@/components/mixins/control'
import { FileStateGcodefile } from '@/store/files/types'
import Panel from '@/components/ui/Panel.vue'
import StatusPanelGcodefilesEntry from '@/components/panels/Status/GcodefilesEntry.vue'
import { debounce } from '@/plugins/helpers'

export default defineComponent({
    name: 'StatusPanelGcodefiles',
    components: { Panel, StatusPanelGcodefilesEntry },
    mixins: [BaseMixin, ControlMixin],
    data() {
        return {
            contentTdWidth: 100,
            resizeObserver: null as ResizeObserver | null,
        }
    },
    computed: {
        filesLimit() {
            return this.$store.state.gui.uiSettings.dashboardFilesLimit ?? 5
        },

        filesFilter() {
            return this.$store.state.gui.uiSettings.dashboardFilesFilter ?? []
        },

        gcodeFiles() {
            let gcodes = this.$store.getters['files/getAllGcodes'] ?? []

            if (this.filesFilter.length > 0 && this.filesFilter.length < 3) {
                gcodes = gcodes.filter((file: FileStateGcodefile) => {
                    if (this.filesFilter.includes('new') && file.last_status === null) return true
                    if (this.filesFilter.includes('completed') && file.last_status === 'completed') return true
                    if (
                        this.filesFilter.includes('failed') &&
                        file.last_status !== null &&
                        file.last_status !== 'completed'
                    )
                        return true

                    return false
                })
            }

            gcodes = gcodes
                .sort((a: FileStateGcodefile, b: FileStateGcodefile) => {
                    return b.modified.getTime() - a.modified.getTime()
                })
                .slice(0, this.filesLimit)

            const requestItems = gcodes.filter(
                (file: FileStateGcodefile) => !file.metadataRequested && !file.metadataPulled
            )
            this.$store.dispatch(
                'files/requestMetadata',
                requestItems.map((file: FileStateGcodefile) => ({
                    filename: 'gcodes/' + file.filename,
                }))
            )
            return gcodes
        },
    },
    mounted() {
        this.resizeObserver = new ResizeObserver(() => this.handleResize())
        this.resizeObserver.observe((this.$refs.filesGcodeCard as ComponentPublicInstance).$el)

        this.calcContentTdWidth()
    },
    beforeUnmount() {
        this.resizeObserver?.disconnect()
    },
    methods: {
        calcContentTdWidth() {
            const filesGcodeCard = this.$refs.filesGcodeCard as ComponentPublicInstance | undefined
            this.contentTdWidth = (filesGcodeCard?.$el.clientWidth ?? 0) - 48 - 48 - 32
        },

        handleResize: debounce(function (this: any) {
            this.$nextTick(() => {
                this.calcContentTdWidth()
            })
        }, 200),
    },
})
</script>

<style scoped>
.filesGcodeCard {
    position: relative;
}
</style>
