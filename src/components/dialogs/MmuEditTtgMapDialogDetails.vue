<template>
    <v-row>
        <v-col cols="4" class="d-flex align-center pr-0">
            <v-list v-if="fileNeedsTool" class="max-width-100">
                <v-list-item class="pr-0">
                    <div class="text-overline">{{ $t('Panels.MmuPanel.TtgMapDialog.SlicerExpects') }}</div>
                    <v-divider />
                    <div class="mb-2 mt-2">
                        <span class="tool-swatch mr-1" :style="'background-color: ' + fileFilamentColor" />
                        {{ toolName }}
                    </div>
                    <v-list-item-title class="wrap-tool-name">{{ fileFilamentName }}</v-list-item-title>
                    <v-list-item-subtitle>{{ fileFilamentDetails }}</v-list-item-subtitle>
                    <v-alert
                        v-if="selectedGateWarnings.length > 0"
                        color="warning"
                        density="compact"
                        variant="tonal"
                        class="mt-2 max-width-100">
                        <p class="mb-2">{{ $t('Panels.MmuPanel.TtgMapDialog.Mismatch') }}</p>
                        <ul class="mb-0">
                            <li v-for="(warning, index) in selectedGateWarnings" :key="index">{{ warning }}</li>
                        </ul>
                    </v-alert>
                </v-list-item>
            </v-list>
            <div v-else class="body-2 text--secondary">{{ toolRowText }}</div>
        </v-col>
        <v-col cols="1" class="d-flex justify-center align-center">
            <span class="triangle" />
        </v-col>
        <v-col cols="7" class="pa-0 minwidth-0">
            <v-data-table
                :headers="gateTableHeaders"
                :items="gateItems"
                item-value="index"
                :sort-by="[{ key: 'index' }]"
                class="drop-down-table"
                :items-per-page="-1"
                hide-default-footer>
                <template #no-data>
                    <div class="text-center">
                        {{ $t('Panels.MmuPanel.TtgMapDialog.NoGateData') }}
                    </div>
                </template>

                <template #item="{ item }">
                    <mmu-edit-ttg-map-dialog-details-row
                        :key="item"
                        :ref="`ttg-map-row-${item}`"
                        :gate="item"
                        :selected-gate="selectedGate"
                        @select-gate="selectGate(item)"
                        @select-endless-spool-group="selectEndlessSpoolGroup(item)" />
                </template>
            </v-data-table>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { ComponentPublicInstance, PropType } from 'vue'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, { GATE_UNKNOWN, TOOL_GATE_BYPASS } from '@/components/mixins/mmu'
import { FileStateGcodefile } from '@/store/files/types'
import { colorsMatch, convertStringToArray } from '@/plugins/helpers'

export default defineComponent({
    name: 'MmuEditTtgMapDialogDetails',
    mixins: [BaseMixin, MmuMixin],
    props: {
        tool: { type: Number, required: true },
        file: { type: Object as PropType<FileStateGcodefile | null>, default: null },
    },
    computed: {
        toolName() {
            if (this.tool === TOOL_GATE_BYPASS) return this.$t('Panels.MmuPanel.TtgMapDialog.Bypass')

            return `T${this.tool}`
        },
        toolRowText() {
            if (this.file && this.fileFilamentWeight === 0)
                return this.$t('Panels.MmuPanel.TtgMapDialog.ToolNotUsed', { tool: this.toolName })

            return this.$t('Panels.MmuPanel.TtgMapDialog.NoSlicerInfo', { tool: this.toolName })
        },
        fileNeedsTool() {
            return this.file && this.fileFilamentWeight > 0
        },
        fileFilamentColor() {
            let colors = this.file?.extruder_colors ?? []
            if (['BambuStudio', 'OrcaSlicer'].includes(this.file?.slicer ?? '')) {
                colors = this.file?.filament_colors ?? []
            }

            return this.formColorString(colors[this.tool] ?? '')
        },
        fileFilamentName() {
            const names = convertStringToArray(this.file?.filament_name ?? '')

            return names[this.tool]?.trim() ?? 'Unknown'
        },
        fileFilamentTemp() {
            const temps = this.file?.filament_temps ?? []

            return temps[this.tool] ?? 0
        },
        fileFilamentType() {
            const types = convertStringToArray(this.file?.filament_type ?? '')

            return types[this.tool]?.trim() ?? 'Unknown'
        },
        fileFilamentWeight() {
            const weights = this.file?.filament_weights ?? []

            return weights[this.tool] ?? 0
        },
        fileFilamentDetails() {
            const details = [this.fileFilamentType]
            if (this.fileFilamentTemp) {
                details.push(this.fileFilamentTemp + '°C')
            }

            return details.join(' | ')
        },
        gateItems() {
            const gates = []
            for (let i = 0; i < (this.mmu?.num_gates ?? 0); i++) {
                gates.push(i)
            }

            return gates
        },
        gateTableHeaders() {
            if (this.tool < 0) return []

            return [
                {
                    title: this.$t('Panels.MmuPanel.TtgMapDialog.Gate'),
                    align: 'center',
                    key: 'index',
                    sortable: false,
                },
                {
                    title: '',
                    align: 'center',
                    sortable: false,
                },
                {
                    title: this.$t('Panels.MmuPanel.TtgMapDialog.FilamentInfo'),
                    align: 'start',
                    sortable: false,
                },
                {
                    title: this.$t('Panels.MmuPanel.TtgMapDialog.EndlessSpool'),
                    align: 'end',
                    sortable: false,
                },
            ]
        },
        selectedGate() {
            return this.ttgMap[this.tool] ?? null
        },
        selectedGateMaterial() {
            return this.mmu?.gate_material?.[this.selectedGate] ?? null
        },
        selectedGateTemperature() {
            return this.mmu?.gate_temperature?.[this.selectedGate] ?? null
        },
        selectedGateColor() {
            return this.mmu?.gate_color?.[this.selectedGate] ?? null
        },
        selectedGateWarnings() {
            const warnings = []

            if (this.selectedGateMaterial !== this.fileFilamentType) {
                warnings.push(this.$t('Panels.MmuPanel.TtgMapDialog.Material'))
            }

            if (this.selectedGateTemperature !== this.fileFilamentTemp) {
                warnings.push(this.$t('Panels.MmuPanel.TtgMapDialog.Temperature'))
            }

            const selectedGateColorString = this.formColorString(this.selectedGateColor)
            if (this.selectedGateColor === null || !colorsMatch(selectedGateColorString, this.fileFilamentColor, 10)) {
                warnings.push(this.$t('Panels.MmuPanel.TtgMapDialog.Color'))
            }

            return warnings
        },
    },
    methods: {
        selectGate(gate: number) {
            this.doSend(`MMU_REMAP_TTG TOOL=${this.tool} GATE=${gate} QUIET=1`)
        },
        selectEndlessSpoolGroup(gate: number) {
            if (gate === GATE_UNKNOWN) return

            // copy the array to change one value
            const groups = [...this.endlessSpoolGroups]
            // get the current group of the selected gate
            const selectedGroup = groups[this.selectedGate]
            // toggle the group of the clicked gate
            groups[gate] = groups[gate] === selectedGroup ? gate : selectedGroup

            this.doSend(`MMU_ENDLESS_SPOOL GROUPS="${groups.join(',')}" QUIET=1`)
        },
        scrollToSelectedGate() {
            this.$nextTick(() => {
                const element = (this.$refs[`ttg-map-row-${this.selectedGate}`] as ComponentPublicInstance)
                    ?.$el as HTMLTableRowElement
                element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
            })
        },
    },
    mounted() {
        this.scrollToSelectedGate()
    },
    watch: {
        tool() {
            this.scrollToSelectedGate()
        },
    },
})
</script>

<style scoped>
.max-width-100 {
    max-width: 100%;
}

.tool-swatch {
    display: inline-block;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    border: 1px solid lightgray;
    vertical-align: middle;
}

.triangle {
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 40px 0 40px 15px;
    border-color: transparent transparent transparent #595959;
}

:deep(.drop-down-table .v-table__wrapper) {
    height: 300px;
    overflow-y: auto;
}

:deep(.drop-down-table .v-table__wrapper table) {
    table-layout: fixed;
    width: 100%;
}

:deep(.drop-down-table table th:nth-child(1)),
:deep(.drop-down-table table th:nth-child(4)) {
    width: 64px;
}

:deep(.drop-down-table table th:nth-child(2)) {
    width: 36px;
}
</style>
