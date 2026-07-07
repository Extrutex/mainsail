<template>
    <v-list-item class="px-0" :lines="twoLine ? 'two' : 'one'">
        <v-list-item-title class="text-primary font-weight-bold cursor-pointer" @click="onCommand">
            {{ command }}
        </v-list-item-title>
        <v-list-item-subtitle v-if="description" class="text-wrap">{{ description }}</v-list-item-subtitle>
    </v-list-item>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'

export default defineComponent({
    name: 'CommandHelpModalEntry',
    mixins: [BaseMixin],
    props: {
        command: { type: String, required: true },
    },
    emits: ['click-on-command'],
    computed: {
        commands(): { [key: string]: { help?: string } } {
            return this.$store.state.printer.gcode?.commands ?? {}
        },

        commandObject(): { help?: string } {
            return this.commands[this.command] ?? {}
        },

        description(): string | null {
            return this.commandObject.help ?? null
        },

        twoLine(): boolean {
            return this.description !== null
        },
    },
    methods: {
        onCommand() {
            this.$emit('click-on-command', this.command)
        },
    },
})
</script>
