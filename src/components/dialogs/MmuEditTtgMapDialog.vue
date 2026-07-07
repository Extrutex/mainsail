<template>
    <v-dialog v-model="showDialog" width="800" persistent :fullscreen="isMobile">
        <panel
            :title="$t('Panels.MmuPanel.EditTtgMapTitle')"
            :icon="mdiStateMachine"
            card-class="mmu-edit-ttg-map-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn variant="text" tile @click="showResetDialog = true">
                    {{ $t('Panels.MmuPanel.TtgMapDialog.Reset') }}
                </v-btn>
                <v-btn icon tile @click="showDialog = false">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>

            <!-- UPPER SECTION -->
            <v-card-text>
                <v-row>
                    <v-col cols="8">
                        <v-row>
                            <v-col class="pb-0">{{ titleHeader }}</v-col>
                        </v-row>
                        <v-row>
                            <v-col class="d-flex flex-wrap gap-6">
                                <mmu-edit-ttg-map-dialog-tool
                                    v-for="map in filteredTtgMap"
                                    :key="map.tool"
                                    :gate="map.gate"
                                    :tool="map.tool"
                                    :is-selected="selectedTool === map.tool"
                                    :is-disabled="selectedTool > -1 && selectedTool !== map.tool"
                                    @select-tool="selectTool" />
                            </v-col>
                        </v-row>
                    </v-col>
                    <v-col cols="4">
                        <v-row>
                            <v-col class="">
                                <div class="d-flex align-center justify-end pr-8">
                                    <span class="mr-4">{{ $t('Panels.MmuPanel.TtgMapDialog.AllTools') }}</span>
                                    <v-switch
                                        v-model="allTools"
                                        :disabled="allToolsDisabled"
                                        hide-details
                                        class="mt-0 pt-0" />
                                </div>
                                <div v-if="showSkipAutomap" class="d-flex align-center justify-end pr-8">
                                    <span class="mr-4">{{ $t('Panels.MmuPanel.TtgMapDialog.SkipAutomap') }}</span>
                                    <v-switch v-model="skipAutomap" hide-details class="mt-0 pt-0" />
                                </div>
                                <mmu-ttg-map :selected-tool="selectedTool" :selected-gate="selectedGate" />
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>
            </v-card-text>

            <v-divider />

            <v-card-text class="min-height-300 position-relative py-3 pr-3">
                <transition name="fade">
                    <div v-if="selectedTool === -1" class="overlay-text">
                        {{ $t('Panels.MmuPanel.TtgMapDialog.SelectTool') }}
                    </div>
                    <mmu-edit-ttg-map-dialog-details v-else :tool="selectedTool" :file="file" />
                </transition>
            </v-card-text>

            <!-- CONFIRMATION FOR RESET ACTION -->
            <confirmation-dialog
                v-model="showResetDialog"
                :title="$t('Panels.MmuPanel.Dialog.AreYouSure')"
                :text="$t('Panels.MmuPanel.TtgMapDialog.ResetConfirmation')"
                :action-button-text="$t('Panels.MmuPanel.TtgMapDialog.Reset')"
                @action="resetTtgMap" />
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, { TOOL_GATE_UNKNOWN } from '@/components/mixins/mmu'
import Panel from '@/components/ui/Panel.vue'
import type { FileStateGcodefile } from '@/store/files/types'
import ConfirmationDialog from '@/components/dialogs/ConfirmationDialog.vue'
import { mdiCloseThick, mdiStateMachine } from '@mdi/js'
import MmuEditTtgMapDialogDetails from '@/components/dialogs/MmuEditTtgMapDialogDetails.vue'

export default defineComponent({
    name: 'MmuEditTtgMapDialog',
    components: { MmuEditTtgMapDialogDetails, Panel, ConfirmationDialog },
    mixins: [BaseMixin, MmuMixin],
    props: {
        modelValue: { type: Boolean, default: false },
        file: { type: Object as PropType<FileStateGcodefile | null>, default: null },
    },
    emits: ['update:modelValue'],
    data() {
        return {
            mdiCloseThick: mdiCloseThick,
            mdiStateMachine: mdiStateMachine,

            allTools: true,
            selectedTool: -1,
            showResetDialog: false,
        }
    },
    computed: {
        showDialog: {
            get(): boolean {
                return this.modelValue
            },
            set(newVal: boolean) {
                this.$emit('update:modelValue', newVal)
            },
        },
        titleHeader() {
            if (this.allTools) return this.$t('Panels.MmuPanel.TtgMapDialog.MapTools')

            return this.$t('Panels.MmuPanel.TtgMapDialog.MapSlicerTools')
        },
        allToolsDisabled() {
            return this.file === null
        },
        skipAutomap: {
            get(): boolean {
                return this.mmu?.slicer_tool_map?.skip_automap ?? false
            },
            set(value: boolean) {
                this.doSend(`MMU_SLICER_TOOL_MAP SKIP_AUTOMAP=${value ? 1 : 0}`)
            },
        },
        showSkipAutomap() {
            const automapStrategy = this.mmuSoftwareVars.automap_strategy ?? 'none'

            return this.file !== null && automapStrategy !== 'none'
        },
        fileTools() {
            const toolsInFile: number[] = []
            this.file?.filament_weights?.forEach((weight, index) => {
                if (weight <= 0) return

                toolsInFile.push(index)
            })

            if (toolsInFile.length === 0) return null

            return toolsInFile
        },
        filteredTtgMap() {
            const ttgMap: { tool: number; gate: number }[] = []

            this.ttgMap.forEach((gate, tool) => {
                if (!this.allTools && !this.fileTools?.includes(Number(tool))) return

                ttgMap.push({ tool: Number(tool), gate })
            })

            return ttgMap
        },
        selectedGate() {
            if (this.selectedTool === TOOL_GATE_UNKNOWN) {
                return TOOL_GATE_UNKNOWN
            }

            return this.ttgMap[this.selectedTool]
        },
    },
    methods: {
        selectTool(tool: number) {
            if (this.selectedTool === tool) {
                this.selectedTool = TOOL_GATE_UNKNOWN
                return
            }

            this.selectedTool = tool
        },
        resetTtgMap() {
            this.doSend('MMU_TTG_MAP RESET=1\nMMU_ENDLESS_SPOOL RESET=1')
        },
        handleEscapePress(event: KeyboardEvent) {
            if (event.key === 'Escape' || event.code === 'Escape') {
                this.selectedTool = -1
            }
        },
    },
    mounted() {
        document.addEventListener('keydown', this.handleEscapePress)
    },
    beforeUnmount() {
        document.removeEventListener('keydown', this.handleEscapePress)
    },
    watch: {
        showDialog(newValue: boolean) {
            if (!newValue) return

            this.allTools = this.file === null
        },
    },
})
</script>

<style scoped>
.gap-6 {
    gap: 6px;
}

.min-height-300 {
    min-height: 300px;
}

.overlay-text {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
}
</style>
