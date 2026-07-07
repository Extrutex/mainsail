<style scoped></style>

<template>
    <div>
        <v-dialog :model-value="showDialog" width="900" persistent :fullscreen="isMobile">
            <panel
                :title="$t('Panels.StatusPanel.ExcludeObject.ExcludeObject')"
                :icon="mdiSelectionRemove"
                card-class="exclude-object-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="hideDialog">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-container>
                    <v-row>
                        <v-col cols="12" sm="6" class="pb-0 pb-sm-3">
                            <status-panel-exclude-object-dialog-map
                                :hover-name="hoverName"
                                @update:name="updateExcludeObjectDialogName"
                                @update:bool="updateExcludeObjectDialogBool"></status-panel-exclude-object-dialog-map>
                        </v-col>
                        <v-col cols="12" sm="6" class="pt-0 pt-sm-3">
                            <status-panel-exclude-object-dialog-list
                                v-model:exclude-object-dialog-name="passName"
                                :exclude-object-dialog-bool="excludeObjectDialogBool"
                                :hover-name="hoverName"
                                @update:name="updateExcludeObjectDialogName"
                                @update:hover-name="updateHoverObjectDialogName"
                                @update:bool="updateExcludeObjectDialogBool"></status-panel-exclude-object-dialog-list>
                        </v-col>
                    </v-row>
                </v-container>
            </panel>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import StatusPanelExcludeObjectDialogMap from '@/components/panels/Status/ExcludeObjectDialogMap.vue'
import StatusPanelExcludeObjectDialogList from '@/components/panels/Status/ExcludeObjectDialogList.vue'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick, mdiSelectionRemove } from '@mdi/js'

export default defineComponent({
    name: 'StatusPanelExcludeObjectDialog',
    components: { Panel, StatusPanelExcludeObjectDialogList, StatusPanelExcludeObjectDialogMap },
    mixins: [BaseMixin],
    props: {
        showDialog: { type: Boolean, required: true },
        excludeObjectDialogBool: { type: Boolean, required: true },
        excludeObjectDialogName: { type: String, required: true },
    },
    emits: ['update:showDialog', 'update:name', 'update:bool'],
    data() {
        return {
            hoverName: '',

            mdiSelectionRemove: mdiSelectionRemove,
            mdiCloseThick: mdiCloseThick,
        }
    },
    computed: {
        passName: {
            get(): string {
                return this.excludeObjectDialogName
            },
            set(newVal: string) {
                this.$emit('update:name', newVal)
            },
        },
    },
    methods: {
        hideDialog() {
            this.$emit('update:showDialog', false)
        },

        updateExcludeObjectDialogBool(newVal: boolean) {
            this.$emit('update:bool', newVal)
        },

        updateExcludeObjectDialogName(newVal: string) {
            this.$emit('update:name', newVal)
        },

        updateHoverObjectDialogName(newVal: string) {
            this.hoverName = newVal
        },
    },
})
</script>
