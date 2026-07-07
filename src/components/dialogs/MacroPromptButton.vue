<template>
    <v-btn :color="color" class="ma-2" @click="sendCommand">{{ text }}</v-btn>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { ServerStateEventPrompt } from '@/store/server/types'

export default defineComponent({
    name: 'MacroPromptButton',
    mixins: [BaseMixin],
    props: {
        event: { type: Object as PropType<ServerStateEventPrompt>, required: true },
    },
    computed: {
        splits() {
            return this.event.message.split('|')
        },
        text() {
            return this.splits[0]
        },
        command() {
            return this.splits[1] ?? this.text
        },
        color() {
            return this.splits[2] ?? ''
        },
    },
    methods: {
        sendCommand() {
            this.$store.dispatch('server/addEvent', { message: this.command, type: 'command' })
            this.$socket.emit('printer.gcode.script', { script: this.command })
        },
    },
})
</script>
