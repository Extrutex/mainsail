<style scoped></style>

<template>
    <div v-if="['printing', 'paused'].includes(printer_state) && printing_objects.length">
        <v-container class="py-0">
            <div class="d-flex flex-row flex-nowrap justify-space-between">
                <div class="py-2" style="width: calc(100% - 25px)">
                    <span class="subtitle-2 d-block px-0 text--disabled text-truncate">
                        <v-icon class="mr-2" size="small">{{ mdiPrinter3dNozzle }}</v-icon>
                        {{ current_object !== null ? current_object : '--' }}
                    </span>
                </div>
                <div class="py-2 pl-0">
                    <v-icon
                        v-if="current_object !== null"
                        class="text--disabled cursor-pointer"
                        size="small"
                        @click="openCancelObjectDialog(current_object)">
                        {{ mdiSelectionRemove }}
                    </v-icon>
                </div>
            </div>
        </v-container>
        <v-divider class="mt-0 mb-0" />
        <confirmation-dialog
            v-model="boolShowExcludeObjectDialog"
            :title="$t('Panels.StatusPanel.ExcludeObject.ExcludeObjectHeadline')"
            :text="$t('Panels.StatusPanel.ExcludeObject.ExcludeObjectText', { name: excludeObjectDialogName })"
            :action-button-text="$t('Panels.StatusPanel.ExcludeObject.ExcludeObject')"
            action-button-color="primary"
            @action="cancelObject" />
        <status-panel-exclude-object-dialog
            v-model:show-dialog="showDialogPass"
            v-model:exclude-object-dialog-name="excludeObjectDialogName"
            v-model:exclude-object-dialog-bool="boolShowExcludeObjectDialog"
            @update:name="updateExcludeObjectDialogName"
            @update:bool="updateExcludeObjectDialogBool" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import StatusPanelExcludeObjectDialog from '@/components/panels/Status/ExcludeObjectDialog.vue'
import { mdiPrinter3dNozzle, mdiSelectionRemove } from '@mdi/js'
import ConfirmationDialog from '@/components/dialogs/ConfirmationDialog.vue'

export default defineComponent({
    name: 'StatusPanelExcludeObject',
    components: { ConfirmationDialog, StatusPanelExcludeObjectDialog },
    mixins: [BaseMixin],
    props: {
        showDialog: { type: Boolean, required: true },
    },
    emits: ['update:showDialog'],
    data() {
        return {
            mdiPrinter3dNozzle: mdiPrinter3dNozzle,
            mdiSelectionRemove: mdiSelectionRemove,

            boolShowExcludeObjectDialog: false,
            excludeObjectDialogName: '',
        }
    },
    computed: {
        showDialogPass: {
            get(): boolean {
                return this.showDialog
            },
            set(newVal: boolean) {
                this.$emit('update:showDialog', newVal)
            },
        },

        printing_objects() {
            return this.$store.state.printer.exclude_object?.objects ?? []
        },

        current_object() {
            return this.$store.state.printer.exclude_object?.current_object ?? null
        },

        excluded_objects() {
            return this.$store.state.printer.exclude_object?.excluded_objects ?? []
        },
    },
    methods: {
        updateExcludeObjectDialogName(newVal: string) {
            this.excludeObjectDialogName = newVal
        },

        updateExcludeObjectDialogBool(newVal: boolean) {
            this.boolShowExcludeObjectDialog = newVal
        },

        openCancelObjectDialog(objectName: string) {
            this.excludeObjectDialogName = objectName
            this.boolShowExcludeObjectDialog = true
        },

        cancelObject() {
            this.$socket.emit('printer.gcode.script', {
                script: 'EXCLUDE_OBJECT NAME=' + this.excludeObjectDialogName,
            })
        },
    },
})
</script>
