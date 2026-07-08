<template>
    <v-tooltip top>
        <template #activator="{ props }">
            <div class="d-flex flex-column align-center mx-1" v-bind="props">
                <v-chip :color="filament.color" size="x-small" :style="chipStyle" class="chip">{{ weight }}</v-chip>
                <small class="type mt-1">{{ filament.type }}</small>
            </div>
        </template>
        <span>{{ filament.name }}</span>
    </v-tooltip>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { FileStateGcodefileFilament } from '@/store/files/types'
import { filamentTextColor, filamentWeightFormat } from '@/plugins/helpers'

export default defineComponent({
    name: 'GcodefilesPanelTableRowFileMetadataFilaments',
    mixins: [BaseMixin],
    props: {
        filament: { type: Object, required: true },
    },
    computed: {
        weight() {
            return filamentWeightFormat(this.filament.weight ?? 0)
        },
        fontColor() {
            return filamentTextColor(this.filament.color)
        },
        chipStyle() {
            return {
                color: this.fontColor,
            }
        },
    },
})
</script>

<style scoped>
.chip {
    font-size: 0.7rem;
    cursor: pointer;
}

.type {
    line-height: 1;
}
</style>
