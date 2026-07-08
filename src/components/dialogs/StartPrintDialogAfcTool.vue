<template>
    <v-row :class="{ 'bt-1': borderTop }" class="px-6">
        <v-col class="d-flex align-center shrink pr-0">
            <v-tooltip v-if="warnings.length" location="top">
                <template #activator="{ props }">
                    <v-icon color="warning" v-bind="props">{{ mdiAlert }}</v-icon>
                </template>
                <span>{{ warnings.join('\n') }}</span>
            </v-tooltip>
            <v-icon v-else color="success">{{ mdiCheckCircle }}</v-icon>
        </v-col>
        <v-col class="d-flex align-center">
            <span class="mr-3 text-subtitle-1 font-weight-bold">{{ toolName }}</span>
            <gcodefiles-panel-table-row-file-metadata-filaments-badge :filament="fileFilament" />
        </v-col>
        <v-col class="d-flex align-center pr-0">
            <span class="mr-3 text-subtitle-1 font-weight-bold text-uppercase">{{ laneName }}</span>
            <gcodefiles-panel-table-row-file-metadata-filaments-badge :filament="laneFilament" />
            <v-menu location="bottom end">
                <template #activator="{ props }">
                    <v-btn v-bind="props" icon variant="text" ripple class="pr-0">
                        <v-icon>{{ mdiChevronDown }}</v-icon>
                    </v-btn>
                </template>
                <v-list>
                    <v-list-item
                        v-for="lane in afcLanes"
                        :key="lane"
                        :disabled="lane === laneName"
                        @click="changeToolMapping(lane)">
                        <span class="mr-3 text-subtitle-1 font-weight-bold text-uppercase">{{ lane }}</span>
                        <gcodefiles-panel-table-row-file-metadata-filaments-badge
                            :filament="getAfcLaneFilament(lane)" />
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { FileStateGcodefile } from '@/store/files/types'
import AfcMixin from '@/components/mixins/afc'
import { mdiAlert, mdiCheckCircle, mdiChevronDown } from '@mdi/js'
import { convertStringToArray, filamentWeightFormat } from '@/plugins/helpers'

export default defineComponent({
    name: 'StartPrintDialogAfc',
    mixins: [BaseMixin, AfcMixin],
    props: {
        file: { type: Object as PropType<FileStateGcodefile>, required: true },
        toolIndex: { type: Number, required: true },
        borderTop: { type: Boolean, required: false, default: false },
    },
    data() {
        return {
            mdiAlert: mdiAlert,
            mdiCheckCircle: mdiCheckCircle,
            mdiChevronDown: mdiChevronDown,
        }
    },
    computed: {
        toolName() {
            return `T${this.toolIndex}`
        },
        fileFilament() {
            const fileColors = this.file.filament_colors ?? []
            const fileNames = convertStringToArray(this.file.filament_name ?? '')
            const fileTypes = convertStringToArray(this.file.filament_type ?? '')
            const fileWeights = this.file.filament_weights ?? []

            return {
                color: fileColors[this.toolIndex] ?? '#000000',
                name: fileNames[this.toolIndex] ?? '--',
                type: fileTypes[this.toolIndex] ?? '--',
                weight: fileWeights[this.toolIndex],
            }
        },
        laneName() {
            const lanes = this.afc?.lanes ?? []

            return lanes.find((lane: string) => {
                const laneObject = this.getAfcLaneObject(lane)
                const mappedTool = laneObject?.map?.toLowerCase()

                return mappedTool === this.toolName.toLowerCase()
            })
        },
        laneFilament() {
            return this.getAfcLaneFilament(this.laneName ?? '')
        },
        isFilamentTypeValid() {
            return this.fileFilament?.type?.toLowerCase() === this.laneFilament?.type?.toLowerCase()
        },
        isFilamentWeightValid() {
            return this.fileFilament.weight < this.laneFilament.weight
        },
        warnings() {
            const warnings: string[] = []

            if (!this.isFilamentTypeValid) {
                warnings.push(
                    this.$t('Dialogs.StartPrint.Afc.FilamentTypeMismatch', {
                        file: this.fileFilament?.type ?? '--',
                        lane: this.laneFilament?.type ?? '--',
                    }) as string
                )
            }

            if (!this.isFilamentWeightValid) {
                warnings.push(
                    this.$t('Dialogs.StartPrint.Afc.FilamentWeightNotEnough', {
                        lane: this.laneName ?? '--',
                        required: filamentWeightFormat(this.fileFilament?.weight ?? 0),
                        available: filamentWeightFormat(this.laneFilament?.weight ?? 0),
                    }) as string
                )
            }

            return warnings
        },
    },
    methods: {
        changeToolMapping(lane: string) {
            const gcode = `SET_MAP LANE=${lane} MAP=${this.toolName}`

            this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
            this.$socket.emit('printer.gcode.script', { script: gcode })
        },
    },
})
</script>
