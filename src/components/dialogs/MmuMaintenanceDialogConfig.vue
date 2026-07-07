<template>
    <div>
        <h3 class="text-h5 mb-3 mt-5">{{ $t('Panels.MmuPanel.MmuMaintenanceDialog.Config') }}</h3>

        <settings-row
            :title="$t('Panels.MmuPanel.MmuMaintenanceDialog.TxMacroColor')"
            :sub-title="$t('Panels.MmuPanel.MmuMaintenanceDialog.TxMacroColorDescription')"
            dense>
            <v-select
                v-model="configTMacroColor"
                :items="tMacroColorOptions"
                hide-details
                variant="outlined"
                density="compact" />
        </settings-row>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import MmuMixin from '@/components/mixins/mmu'

export default defineComponent({
    name: 'MmuMaintenanceStateDialogLeds',
    mixins: [BaseMixin, MmuMixin],
    computed: {
        configTMacroColor: {
            get(): string {
                return this.mmuSettings?.t_macro_color ?? 'slicer'
            },
            set(newVal: string) {
                this.doSend(`MMU_TEST_CONFIG QUIET=1 t_macro_color=${newVal}`)
            },
        },
        tMacroColorOptions() {
            return [
                { value: 'slicer', title: this.$t('Panels.MmuPanel.MmuMaintenanceDialog.TMacroColorOptions.Slicer') },
                {
                    value: 'allgates',
                    title: this.$t('Panels.MmuPanel.MmuMaintenanceDialog.TMacroColorOptions.AllGates'),
                },
                { value: 'gatemap', title: this.$t('Panels.MmuPanel.MmuMaintenanceDialog.TMacroColorOptions.GateMap') },
                { value: 'off', title: this.$t('Panels.MmuPanel.MmuMaintenanceDialog.TMacroColorOptions.Off') },
            ]
        },
    },
})
</script>
