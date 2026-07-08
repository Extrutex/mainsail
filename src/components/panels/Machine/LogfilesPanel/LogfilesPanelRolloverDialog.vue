<template>
    <v-dialog v-model="showDialog" persistent width="400" :fullscreen="isMobile">
        <panel
            :title="$t('Machine.LogfilesPanel.Rollover')"
            card-class="machine_rollover_logfiles-dialog"
            :icon="mdiFileSyncOutline"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>
                <v-row>
                    <v-col>
                        <p class="mb-0">{{ $t('Machine.LogfilesPanel.RolloverDescription') }}</p>
                    </v-col>
                </v-row>
                <v-row class="mt-0">
                    <v-col>
                        <v-checkbox
                            v-for="log in rolloverLogfiles"
                            :key="log"
                            v-model="selectedRolloverLogs"
                            :label="capitalize(log)"
                            :value="log"
                            hide-details
                            class="mt-0" />
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" @click="closeDialog">
                    {{ $t('Buttons.Cancel') }}
                </v-btn>
                <v-btn color="primary" variant="text" @click="btnRolloverLogs">
                    {{ $t('Machine.LogfilesPanel.Accept') }}
                </v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick, mdiFileSyncOutline } from '@mdi/js'
import { rolloverLogfiles } from '@/store/variables'
import { capitalize } from '@/plugins/helpers'

export default defineComponent({
    name: 'LogfilesPanelRolloverDialog',
    components: { Panel },
    mixins: [BaseMixin],
    props: {
        modelValue: { type: Boolean },
    },
    emits: ['update:modelValue'],
    data() {
        return {
            mdiCloseThick: mdiCloseThick,
            mdiFileSyncOutline: mdiFileSyncOutline,
            rolloverLogfiles: rolloverLogfiles,
            capitalize: capitalize,
            selectedRolloverLogs: [] as string[],
        }
    },
    computed: {
        showDialog: {
            get(): boolean {
                return this.modelValue
            },
            set(value: boolean) {
                this.$emit('update:modelValue', value)
            },
        },
        loadingRolloverLogs() {
            return this.loadings.filter((log) => log?.startsWith('rolloverLog_')).length > 0
        },
    },
    watch: {
        loadingRolloverLogs(newVal: boolean) {
            if (newVal) this.closeDialog()
        },
    },
    methods: {
        btnRolloverLogs() {
            if (this.selectedRolloverLogs.length === 0) return

            this.selectedRolloverLogs.forEach((name) => {
                this.$socket.emit(
                    'server.logs.rollover',
                    { application: name },
                    { loading: 'rolloverLog_' + name, action: 'files/rolloverLog' }
                )
            })

            this.selectedRolloverLogs = []
        },
        closeDialog() {
            this.showDialog = false
        },
    },
})
</script>
