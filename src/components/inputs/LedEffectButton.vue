<template>
    <v-btn
        :color="buttonColor"
        :loading="isLoading"
        :disabled="printerIsPrintingOnly"
        class="text-uppercase"
        size="small"
        @click="toggleEffect">
        {{ name }}
    </v-btn>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'

interface LedEffectState {
    enabled: boolean
}

export default defineComponent({
    name: 'LedEffectButton',
    mixins: [BaseMixin],
    props: {
        name: { required: true, type: String },
    },
    computed: {
        ledEffectState(): LedEffectState | undefined {
            const printer = this.$store.state.printer ?? {}
            const objectKey = `led_effect ${this.name}`

            return printer[objectKey]
        },

        isEnabled() {
            return this.ledEffectState?.enabled ?? false
        },

        buttonColor() {
            return this.isEnabled ? 'success' : 'primary'
        },

        loadingKey() {
            return `led_effect_${this.name}`
        },

        isLoading() {
            return this.loadings.includes(this.loadingKey)
        },
    },
    methods: {
        toggleEffect() {
            let command = `SET_LED_EFFECT EFFECT="${this.name}"`
            if (this.isEnabled) command += ' STOP=1'

            this.$store.dispatch('server/addEvent', { message: command, type: 'command' })
            this.$socket.emit('printer.gcode.script', { script: command }, { loading: this.loadingKey })
        },
    },
})
</script>
