<template>
    <td class="text-no-wrap">
        <div class="d-flex align-center">
            <gcodefiles-panel-table-row-file-metadata-filaments-badge
                v-for="(filament, index) in filaments"
                :key="index"
                :filament="filament" />
        </div>
    </td>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { FileStateGcodefile, FileStateGcodefileFilament } from '@/store/files/types'
import { convertStringToArray } from '@/plugins/helpers'

export default defineComponent({
    name: 'GcodefilesPanelTableRowFileMetadataFilaments',
    mixins: [BaseMixin],
    props: {
        item: { type: Object, required: true },
    },
    computed: {
        filament_colors() {
            return this.item.filament_colors ?? []
        },
        filament_types() {
            return convertStringToArray(this.item.filament_type ?? '')
        },
        filament_weights_exists() {
            return 'filament_weights' in this.item && this.filament_weights.length > 0
        },
        filament_weights() {
            return this.item.filament_weights ?? []
        },
        filament_names() {
            return convertStringToArray(this.item.filament_name ?? '')
        },
        filaments(): FileStateGcodefileFilament[] {
            if (!this.filament_weights_exists && this.filament_names.length === 1 && this.filament_types.length === 1) {
                return [
                    {
                        color: '#666',
                        name: this.filament_names[0] ?? '--',
                        type: this.filament_types[0] ?? '--',
                        weight: this.item.filament_weight_total ?? 0,
                    },
                ]
            }

            return this.filament_weights
                .map((weight, index) => {
                    return {
                        color: this.filament_colors[index] ?? '#000000',
                        name: this.filament_names[index] ?? '--',
                        type: this.filament_types[index] ?? '--',
                        weight: weight,
                    }
                })
                .filter((filament) => filament.weight > 0)
        },
    },
})
</script>
