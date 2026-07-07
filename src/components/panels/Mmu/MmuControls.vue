<template>
    <div class="py-2">
        <v-row dense>
            <v-col cols="6">
                <mmu-controls-button
                    :disabled="btnPreloadDisabled"
                    :icon="mdiDownloadOutline"
                    :text="$t('Panels.MmuPanel.ButtonPreload')"
                    command="MMU_PRELOAD" />
            </v-col>
            <v-col cols="6">
                <mmu-controls-button
                    :disabled="btnEjectDisabled"
                    :icon="mdiEject"
                    :text="$t('Panels.MmuPanel.ButtonEject')"
                    command="MMU_EJECT" />
            </v-col>
        </v-row>
        <v-row dense>
            <v-col cols="6">
                <mmu-controls-button
                    :disabled="!canSend"
                    :icon="mdiCheck"
                    :text="$t('Panels.MmuPanel.ButtonCheckGate')"
                    command="MMU_CHECK_GATE" />
            </v-col>
            <v-col cols="6">
                <mmu-controls-button
                    :disabled="!canSend"
                    :icon="mdiAutoFix"
                    :text="$t('Panels.MmuPanel.ButtonRecover')"
                    command="MMU_RECOVER" />
            </v-col>
        </v-row>
        <v-row dense>
            <v-col cols="8" offset="2">
                <mmu-controls-button
                    :disabled="!canSend || !isMmuPausedAndLocked"
                    :icon="mdiThermometerPlus"
                    :text="$t('Panels.MmuPanel.ButtonUnlock')"
                    command="MMU_UNLOCK" />
            </v-col>
        </v-row>
        <v-row dense class="mt-4">
            <v-col cols="6">
                <mmu-controls-button
                    :disabled="btnUnloadDisabled"
                    :icon="mdiUpload"
                    :text="btnUnloadText"
                    size="large"
                    command="MMU_UNLOAD" />
            </v-col>
            <v-col cols="6">
                <mmu-controls-button
                    :disabled="btnLoadDisabled"
                    :icon="mdiDownload"
                    :text="btnLoadText"
                    size="large"
                    command="MMU_LOAD" />
            </v-col>
        </v-row>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, {
    TOOL_GATE_BYPASS,
    GATE_AVAILABLE,
    GATE_AVAILABLE_FROM_BUFFER,
    FILAMENT_POS_UNLOADED,
    GATE_UNKNOWN,
    GATE_EMPTY,
} from '@/components/mixins/mmu'
import { mdiDownloadOutline, mdiEject, mdiCheck, mdiAutoFix, mdiThermometerPlus, mdiDownload, mdiUpload } from '@mdi/js'
import MmuControlsButton from '@/components/panels/Mmu/MmuControlsButton.vue'

export default defineComponent({
    name: 'MmuControls',
    components: { MmuControlsButton },
    mixins: [BaseMixin, MmuMixin],
    data() {
        return {
            mdiDownloadOutline: mdiDownloadOutline,
            mdiEject: mdiEject,
            mdiCheck: mdiCheck,
            mdiAutoFix: mdiAutoFix,
            mdiThermometerPlus: mdiThermometerPlus,
            mdiUpload: mdiUpload,
            mdiDownload: mdiDownload,
        }
    },
    computed: {
        isMmuPausedAndLocked() {
            return this.mmuPrintState === 'pause_locked'
        },

        currentGateStatus(): number {
            const gateStatus = this.$store.state.printer.mmu?.gate_status ?? null

            return gateStatus?.[this.mmuGate] ?? GATE_UNKNOWN
        },

        btnPreloadDisabled(): boolean {
            return !this.canSend || [GATE_AVAILABLE, GATE_AVAILABLE_FROM_BUFFER].includes(this.currentGateStatus)
        },

        btnEjectDisabled(): boolean {
            return !this.canSend || this.currentGateStatus === GATE_EMPTY
        },

        btnUnloadDisabled() {
            return !this.canSend || this.mmuFilamentPos === FILAMENT_POS_UNLOADED
        },

        btnUnloadText() {
            return this.mmuGate === TOOL_GATE_BYPASS
                ? this.$t('Panels.MmuPanel.ButtonUnloadExt')
                : this.$t('Panels.MmuPanel.ButtonUnload')
        },

        btnLoadDisabled() {
            return !this.canSend || this.mmuFilamentPos !== FILAMENT_POS_UNLOADED
        },

        btnLoadText() {
            return this.mmuGate === TOOL_GATE_BYPASS
                ? this.$t('Panels.MmuPanel.ButtonLoadExt')
                : this.$t('Panels.MmuPanel.ButtonLoad')
        },
    },
})
</script>
