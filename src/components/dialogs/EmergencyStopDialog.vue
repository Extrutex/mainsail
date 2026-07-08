<template>
    <v-dialog v-model="showDialog" width="400" persistent>
        <panel
            :title="$t('EmergencyStopDialog.EmergencyStop')"
            toolbar-color="error"
            card-class="emergency-stop-dialog"
            :icon="mdiAlertOctagonOutline"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closePrompt">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>{{ $t('EmergencyStopDialog.AreYouSure') }}</v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" @click="closePrompt">{{ $t('Buttons.No') }}</v-btn>
                <v-btn color="error" variant="text" @click="emergencyStop">{{ $t('Buttons.Yes') }}</v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'

import { mdiAlertOctagonOutline, mdiCloseThick } from '@mdi/js'

export default defineComponent({
    name: 'EmergencyStopDialog',
    components: { Panel },
    mixins: [BaseMixin],
    props: {
        modelValue: { type: Boolean },
    },
    emits: ['update:modelValue'],
    data() {
        return {
            mdiAlertOctagonOutline: mdiAlertOctagonOutline,
            mdiCloseThick: mdiCloseThick,
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
    },
    methods: {
        emergencyStop() {
            this.$socket.emit('printer.emergency_stop', {}, { loading: 'topbarEmergencyStop' })

            this.closePrompt()
        },
        closePrompt() {
            this.showDialog = false
        },
    },
})
</script>

<style scoped></style>
