<template>
    <v-alert v-if="message" :icon="mdiAlert" :type="type" class="mt-3 align-content-center" density="compact" text>
        <v-row>
            <v-col class="grow text-format">{{ message }}</v-col>
            <v-col class="shrink py-0 align-content-center">
                <v-btn icon @click="clearMessage">
                    <v-icon size="small">{{ mdiClose }}</v-icon>
                </v-btn>
            </v-col>
        </v-row>
    </v-alert>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import AfcMixin from '@/components/mixins/afc'
import { mdiAlert, mdiClose } from '@mdi/js'

export default defineComponent({
    name: 'AfcPanelMessage',
    mixins: [BaseMixin, AfcMixin],
    data() {
        return {
            mdiAlert: mdiAlert,
            mdiClose: mdiClose,
        }
    },
    computed: {
        type() {
            const type = this.afc.message?.type ?? 'error'
            const possibleTypes = ['info', 'warning', 'success', 'error']

            if (!possibleTypes.includes(type)) {
                window.console.warn(`AfcPanelMessage: Invalid message type "${type}" detected. Defaulting to "error".`)
                return 'error'
            }

            return type
        },
        message() {
            return this.afc.message?.message ?? ''
        },
    },
    methods: {
        clearMessage() {
            const gcode = `AFC_CLEAR_MESSAGE`

            this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
            this.$socket.emit('printer.gcode.script', { script: gcode })
        },
    },
})
</script>

<style scoped>
.text-format {
    white-space: break-spaces;
    font-family: 'Roboto Mono', monospace;
    font-size: 0.875rem;
}
</style>
