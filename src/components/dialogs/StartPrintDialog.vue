<template>
    <v-dialog
        v-model="showDialog"
        :max-width="400"
        content-class="overflow-x-hidden"
        @click:outside="closeDialog"
        @keydown.esc="closeDialog">
        <v-card>
            <start-print-dialog-thumbnail :file="file" :current-path="currentPath" />
            <v-card-title class="text-h5">{{ $t('Dialogs.StartPrint.Headline') }}</v-card-title>
            <v-card-text class="pb-0">
                <p class="body-2">
                    {{ question }}
                </p>
            </v-card-text>
            <start-print-dialog-afc v-if="afcExists" :file="file" />
            <start-print-dialog-mmu v-else-if="existsMmu" :file="file" />
            <start-print-dialog-spoolman v-else-if="existsSpoolman" :file="file" />
            <start-print-dialog-timelapse v-if="existsTimelapse" />
            <v-divider v-if="showDivider" class="my-0" />
            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" @click="closeDialog">{{ $t('Buttons.Cancel') }}</v-btn>
                <v-btn
                    color="primary"
                    variant="text"
                    :disabled="printerIsPrinting || !klipperReadyForGui"
                    @click="startPrint(file.filename)">
                    {{ $t('Dialogs.StartPrint.Print') }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { FileStateGcodefile } from '@/store/files/types'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { mdiPrinter3d } from '@mdi/js'
import { ServerSpoolmanStateSpool } from '@/store/server/spoolman/types'
import AfcMixin from '@/components/mixins/afc'

export default defineComponent({
    name: 'StartPrintDialog',
    components: { SettingsRow },
    mixins: [BaseMixin, AfcMixin],
    props: {
        modelValue: { type: Boolean, default: false },
        currentPath: { type: String, required: true, default: '' },
        file: { type: Object as PropType<FileStateGcodefile>, required: true },
    },
    emits: ['update:modelValue'],
    data() {
        return {
            mdiPrinter3d: mdiPrinter3d,
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
        existsMmu() {
            return this.$store.state.printer.mmu?.enabled && this.$store.state.printer.mmu?.gate !== -2
        },
        existsSpoolman() {
            return this.moonrakerComponents.includes('spoolman')
        },
        existsTimelapse() {
            return this.moonrakerComponents.includes('timelapse')
        },
        showDivider() {
            return this.afcExists || this.existsSpoolman || this.existsTimelapse
        },
        active_spool(): ServerSpoolmanStateSpool | null {
            return this.$store.state.server.spoolman.active_spool ?? null
        },
        question() {
            if (this.active_spool)
                return this.$t('Dialogs.StartPrint.DoYouWantToStartFilenameFilament', {
                    filename: this.file?.filename ?? 'unknown',
                })

            return this.$t('Dialogs.StartPrint.DoYouWantToStartFilename', {
                filename: this.file?.filename ?? 'unknown',
            })
        },
    },
    methods: {
        startPrint(filename = '') {
            filename = (this.currentPath + '/' + filename).substring(1)
            this.closeDialog()
            this.$socket.emit('printer.print.start', { filename: filename }, { action: 'switchToDashboard' })
        },
        closeDialog() {
            this.showDialog = false
        },
    },
})
</script>
