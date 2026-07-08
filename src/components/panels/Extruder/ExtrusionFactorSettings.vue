<template>
    <v-container>
        <tool-slider
            :label="$t('Panels.ExtruderControlPanel.ExtrusionFactor')"
            :icon="mdiPrinter3dNozzleOutline"
            :target="extrudeFactor"
            :min="1"
            :max="200"
            :multi="100"
            :step="1"
            :has-input-field="true"
            command="M221"
            attribute-name="S" />
    </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { mdiPrinter3dNozzleOutline } from '@mdi/js'
import ExtruderMixin from '@/components/mixins/extruder'

export default defineComponent({
    name: 'PressureAdvanceSettings',
    mixins: [BaseMixin, ExtruderMixin],
    data() {
        return {
            mdiPrinter3dNozzleOutline: mdiPrinter3dNozzleOutline,
        }
    },
})
</script>
