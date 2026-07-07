<template>
    <v-list-item class="minHeight30 pr-2">
        <v-list-item-title>
            <v-tooltip location="start">
                <template #activator="{ props }">
                    <span v-bind="props">{{ name }}</span>
                </template>
                <span>{{ state }} ({{ subState }})</span>
            </v-tooltip>
        </v-list-item-title>
        <template #append>
            <v-list-item-action class="my-0 d-flex flex-row" style="min-width: auto">
                <v-btn v-if="state === 'inactive'" icon size="small" @click="clickStart">
                    <v-icon size="small">{{ mdiPlay }}</v-icon>
                </v-btn>
                <v-btn v-else icon size="small" @click="clickRestart">
                    <v-icon size="small">{{ mdiRestart }}</v-icon>
                </v-btn>
                <v-btn icon size="small" :disabled="disableStopButton" :style="styleStopButton" @click="clickStop">
                    <v-icon size="small">{{ mdiStop }}</v-icon>
                </v-btn>
            </v-list-item-action>
        </template>
        <confirmation-dialog
            v-model="showRestartDialog"
            :title="dialogRestartTitle"
            :text="dialogRestartDescription"
            :action-button-text="$t('App.TopCornerMenu.Restart')"
            @action="serviceRestart" />
        <confirmation-dialog
            v-model="showStopDialog"
            :title="dialogStopTitle"
            :text="dialogStopDescription"
            :action-button-text="$t('App.TopCornerMenu.Stop')"
            @action="serviceStop" />
    </v-list-item>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { mdiPlay, mdiRestart, mdiStop } from '@mdi/js'
import { capitalize } from '@/plugins/helpers'
import ServiceMixins from '@/components/mixins/services'
import ConfirmationDialog from '@/components/dialogs/ConfirmationDialog.vue'

export default defineComponent({
    name: 'TopCornerMenuService',
    components: { ConfirmationDialog },
    mixins: [BaseMixin, ServiceMixins],
    props: {
        service: { type: String, required: true },
    },
    emits: ['close-menu'],
    data() {
        return {
            mdiPlay: mdiPlay,
            mdiRestart: mdiRestart,
            mdiStop: mdiStop,

            showRestartDialog: false,
            showStopDialog: false,
        }
    },
    computed: {
        name() {
            if (this.hideOtherInstances && this.service === this.klipperInstance) return 'Klipper'
            if (this.hideOtherInstances && this.service === this.moonrakerInstance) return 'Moonraker'

            return capitalize(this.service)
        },

        service_states() {
            return this.$store.state.server.system_info?.service_state ?? {}
        },

        state() {
            if (this.service in this.service_states) return this.service_states[this.service].active_state

            return null
        },

        subState() {
            if (this.service in this.service_states) return this.service_states[this.service].sub_state

            return null
        },

        dialogRestartTitle() {
            if (this.service === this.klipperInstance)
                return this.$t('App.TopCornerMenu.ConfirmationDialog.Title.KlipperRestart')

            return this.$t('App.TopCornerMenu.ConfirmationDialog.Title.ServiceRestart')
        },

        dialogStopTitle() {
            return this.$t('App.TopCornerMenu.ConfirmationDialog.Title.ServiceStop')
        },

        dialogRestartDescription() {
            if (this.service === this.klipperInstance)
                return this.$t('App.TopCornerMenu.ConfirmationDialog.Description.KlipperRestart')

            return this.$t('App.TopCornerMenu.ConfirmationDialog.Description.ServiceRestart')
        },

        dialogStopDescription() {
            if (this.service === this.klipperInstance)
                return this.$t('App.TopCornerMenu.ConfirmationDialog.Description.KlipperStop')

            return this.$t('App.TopCornerMenu.ConfirmationDialog.Description.ServiceStop')
        },

        disableStopButton() {
            return this.state === 'inactive' || this.service === this.moonrakerInstance
        },

        styleStopButton() {
            return this.service === this.moonrakerInstance ? 'visibility: hidden;' : ''
        },
    },
    methods: {
        clickStart() {
            this.$socket.emit('machine.services.start', { service: this.service })
            this.closeMenu()
        },

        clickRestart() {
            if (this.printerIsPrinting) {
                this.showRestartDialog = true
                return
            }

            this.serviceRestart()
        },

        clickStop() {
            if (this.printerIsPrinting) {
                this.showStopDialog = true
                return
            }

            this.serviceStop()
        },

        serviceRestart() {
            this.$socket.emit('machine.services.restart', { service: this.service })
            this.closeMenu()
        },

        serviceStop() {
            this.$socket.emit('machine.services.stop', { service: this.service })
            this.closeMenu()
        },

        closeMenu() {
            this.$emit('close-menu')
        },
    },
})
</script>
