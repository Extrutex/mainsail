<style scoped></style>

<template>
    <div>
        <v-dialog :model-value="showDialog" width="400" persistent :fullscreen="isMobile">
            <panel
                :title="$t('Panels.StatusPanel.PauseAtLayer.PauseAtLayer').toString()"
                :icon="mdiLayersPlus"
                card-class="pause-at-layer-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="hideDialog">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <v-row v-if="type === 'atLayer' && macroSettingsPauseAtLayerEnable">
                        <v-col>
                            <v-alert variant="tonal" type="warning" border="start">
                                {{
                                    $t('Panels.StatusPanel.PauseAtLayer.DescriptionPauseAtLayerActive', {
                                        layer: macroSettingsPauseAtLayerLayer,
                                        call: macroSettingsPauseAtLayerCall,
                                    })
                                }}
                            </v-alert>
                        </v-col>
                    </v-row>
                    <v-row v-if="type === 'nextLayer' && macroSettingsPauseNextLayerEnable">
                        <v-col>
                            <v-alert variant="tonal" type="warning" border="start">
                                {{
                                    $t('Panels.StatusPanel.PauseAtLayer.DescriptionPauseNextLayerActive', {
                                        call: macroSettingsPauseAtLayerCall,
                                    })
                                }}
                            </v-alert>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-select
                                v-model="type"
                                :items="itemsFiltered"
                                :label="$t('Panels.StatusPanel.PauseAtLayer.Type')"
                                variant="outlined"
                                hide-details />
                        </v-col>
                        <v-col v-if="type === 'atLayer'">
                            <v-text-field
                                v-model="layer"
                                :label="$t('Panels.StatusPanel.PauseAtLayer.Layer')"
                                variant="outlined"
                                hide-details />
                        </v-col>
                    </v-row>
                    <v-row class="mt-0">
                        <v-col>
                            <v-select
                                v-model="call"
                                :items="itemsCall"
                                :label="$t('Panels.StatusPanel.PauseAtLayer.Call')"
                                variant="outlined"
                                hide-details />
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn variant="text" @click="hideDialog">
                        {{ $t('Panels.StatusPanel.PauseAtLayer.Abort') }}
                    </v-btn>
                    <v-btn color="primary" variant="text" @click="sendCommand">
                        {{ $t('Panels.StatusPanel.PauseAtLayer.Accept') }}
                    </v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick, mdiLayersPlus } from '@mdi/js'
import { PrinterStateMacro } from '@/store/printer/types'

export default defineComponent({
    name: 'StatusPanelPauseAtLayerDialog',
    components: { Panel },
    mixins: [BaseMixin],
    props: {
        showDialog: { type: Boolean, required: true },
    },
    emits: ['update:showDialog'],
    data() {
        return {
            mdiLayersPlus: mdiLayersPlus,
            mdiCloseThick: mdiCloseThick,

            type: 'atLayer' as 'nextLayer' | 'atLayer',
            layer: 0,
            call: 'PAUSE' as 'PAUSE' | 'M600',
        }
    },
    computed: {
        items() {
            return [
                {
                    title: this.$t('Panels.StatusPanel.PauseAtLayer.AtLayer'),
                    value: 'atLayer',
                    status: this.existsSetPauseAtLayer,
                },
                {
                    title: this.$t('Panels.StatusPanel.PauseAtLayer.NextLayer'),
                    value: 'nextLayer',
                    status: this.existsSetPauseNextLayer,
                },
            ]
        },

        itemsFiltered() {
            return this.items.filter((entry) => entry.status)
        },

        itemsCall() {
            return [
                {
                    title: 'PAUSE',
                    value: 'PAUSE',
                },
                {
                    title: 'M600',
                    value: 'M600',
                },
            ]
        },

        current_layer() {
            return this.$store.state.printer.print_stats?.info?.current_layer ?? 0
        },

        total_layer() {
            return this.$store.state.printer.print_stats?.info?.total_layer ?? 0
        },

        macros() {
            return this.$store.getters['printer/getMacros'] ?? []
        },

        existsSetPauseAtLayer() {
            return this.macros.findIndex((macro: PrinterStateMacro) => macro.name === 'SET_PAUSE_AT_LAYER') !== -1
        },

        existsSetPauseNextLayer() {
            return this.macros.findIndex((macro: PrinterStateMacro) => macro.name === 'SET_PAUSE_NEXT_LAYER') !== -1
        },

        macroSetPrintStatsInfo() {
            return this.$store.state.printer['gcode_macro SET_PRINT_STATS_INFO'] ?? {}
        },

        macroSettingsPauseAtLayer() {
            return this.macroSetPrintStatsInfo.pause_at_layer ?? {}
        },

        macroSettingsPauseAtLayerEnable() {
            return this.macroSettingsPauseAtLayer.enable ?? false
        },

        macroSettingsPauseAtLayerCall() {
            return this.macroSettingsPauseAtLayer.call ?? 'PAUSE'
        },

        macroSettingsPauseAtLayerLayer() {
            return this.macroSettingsPauseAtLayer.layer ?? 0
        },

        macroSettingsPauseNextLayer() {
            return this.macroSetPrintStatsInfo.pause_next_layer ?? {}
        },

        macroSettingsPauseNextLayerEnable() {
            return this.macroSettingsPauseNextLayer.enable ?? false
        },

        macroSettingsPauseNextLayerCall() {
            return this.macroSettingsPauseNextLayer.call ?? 'PAUSE'
        },
    },
    methods: {
        hideDialog() {
            this.$emit('update:showDialog', false)
        },

        sendCommand() {
            if (this.type === 'atLayer') {
                this.doSend(`SET_PAUSE_AT_LAYER ENABLE=1 LAYER=${this.layer} MACRO=${this.call}`)
                this.hideDialog()
                return
            }

            this.doSend(`SET_PAUSE_NEXT_LAYER ENABLE=1 MACRO=${this.call}`)
            this.hideDialog()
        },

        doSend(gcode: string) {
            this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
            this.$socket.emit('printer.gcode.script', { script: gcode })
        },
    },
    watch: {
        showDialog(newVal: boolean) {
            if (newVal) {
                this.layer = this.current_layer + 1
                this.type = 'atLayer'

                if (!this.existsSetPauseAtLayer) this.type = 'nextLayer'
            }
        },

        type(newVal: string) {
            if (newVal === 'atLayer') {
                this.call = this.macroSettingsPauseAtLayerCall
            } else if (newVal === 'nextLayer') {
                this.call = this.macroSettingsPauseNextLayerCall
            }
        },
    },
})
</script>
