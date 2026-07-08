<template>
    <v-dialog v-model="showDialog" persistent :width="400">
        <panel :title="titleText" :icon="mdiConnection" card-class="the-connection-dialog" :margin-bottom="false">
            <v-card-text v-if="connectingFailed" class="pt-5">
                <connection-status :moonraker="false" />
                <p class="text-center mt-3 mb-0">
                    {{ $t('ConnectionDialog.CannotConnectTo', { host: formatHostname }) }}
                </p>
                <p v-if="connectionFailedMessage" class="text-center mt-1 red--text">
                    {{ $t('ConnectionDialog.ErrorMessage', { message: connectionFailedMessage }) }}
                </p>
                <template v-if="counter > 2">
                    <v-divider class="my-3" />
                    <p>{{ $t('ConnectionDialog.CheckMoonrakerLog') }}</p>
                    <ul>
                        <li>~/printer_data/logs/moonraker.log</li>
                    </ul>
                    <v-divider class="mt-4 mb-5" />
                </template>
                <div class="text-center mt-3">
                    <v-btn v-if="helpButtonUrl" class="text--disabled mr-3" :href="helpButtonUrl" target="_blank">
                        <v-icon start>{{ mdiHelp }}</v-icon>
                        {{ $t('ConnectionDialog.Help') }}
                    </v-btn>
                    <v-btn class="primary--text" @click="reconnect">{{ $t('ConnectionDialog.TryAgain') }}</v-btn>
                </div>
            </v-card-text>
            <v-card-text v-else class="pt-5">
                <v-progress-linear :color="progressBarColor" indeterminate />
            </v-card-text>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'

import ThemeMixin from '@/components/mixins/theme'
import ConnectionStatus from '@/components/ui/ConnectionStatus.vue'
import { mdiConnection, mdiHelp } from '@mdi/js'

export default defineComponent({
    name: 'TheConnectingDialog',
    components: {
        ConnectionStatus,
    },
    mixins: [BaseMixin, ThemeMixin],
    data() {
        return {
            mdiConnection: mdiConnection,
            mdiHelp: mdiHelp,
            counter: 0,
        }
    },
    computed: {
        hostname() {
            return this.$store.state.socket.hostname
        },
        port() {
            return this.$store.state.socket.port
        },
        path() {
            return this.$store.state.socket.path
        },
        formatHostname() {
            return parseInt(this.port) !== 80 && this.port !== ''
                ? this.hostname + ':' + this.port + this.path
                : this.hostname + this.path
        },
        isConnecting() {
            return this.$store.state.socket.isConnecting
        },
        connectingFailed() {
            return this.$store.state.socket.connectingFailed
        },
        showDialog() {
            return true
        },
        titleText() {
            if (this.connectingFailed) return this.$t('ConnectionDialog.Failed', { host: this.formatHostname })
            if (this.isConnecting) return this.$t('ConnectionDialog.Connecting', { host: this.formatHostname })
            if (!this.guiIsReady) return this.$t('ConnectionDialog.Initializing')

            return this.formatHostname
        },
        connectionFailedMessage() {
            return this.$store.state.socket.connectionFailedMessage ?? null
        },
        helpButtonUrl() {
            if (!this.$store.state.socket.connectionFailedMessage) return null

            return `https://docs.mainsail.xyz/faq/mainsail_errors/connection-${this.connectionFailedMessage?.toLowerCase()}`
        },
    },
    methods: {
        reconnect() {
            this.counter++
            this.$store.dispatch('socket/setData', { connectingFailed: false })
            this.$socket.connect()
        },
    },
})
</script>
