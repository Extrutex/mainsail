<template>
    <v-row :class="entryStyle">
        <v-col cols="auto" class="pr-0 text-disabled console-time">{{ entryFormatTime }}</v-col>
        <v-col
            v-if="!rawOutput"
            :class="messageClass"
            style="min-width: 0"
            @click.capture="commandClick"
            v-html="event.formatMessage" />
        <v-col v-else :class="messageClass" style="min-width: 0" @click.capture="commandClick" v-text="event.message" />
    </v-row>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ServerStateEvent } from '@/store/server/types'
import BaseMixin from '@/components/mixins/base'

export default defineComponent({
    name: 'ConsoleTableEntry',
    mixins: [BaseMixin],
    props: {
        event: { type: Object as PropType<ServerStateEvent>, required: true },
    },
    emits: ['command-click'],
    computed: {
        entryStyle(): string[] {
            const classes = ['ma-0', 'flex-nowrap']
            classes.push(this.$store.state.gui.console.entryStyle ?? 'default')
            if (['action', 'debug'].includes(this.event.type)) classes.push('text-disabled')

            return classes
        },

        entryFormatTime(): string {
            return this.formatTime(this.event.date.getTime(), true)
        },

        messageClass(): string[] {
            const classes = ['console-message']

            if (['action', 'debug'].includes(this.event.type)) classes.push('text-disabled')
            else if (this.event.message.startsWith('!! ')) classes.push('text-error')

            return classes
        },

        rawOutput(): boolean {
            return this.$store.state.gui.console.rawOutput ?? false
        },
    },
    methods: {
        commandClick(event: Event) {
            const eventTarget = event.target as Element
            if (eventTarget.localName === 'a' && eventTarget.className.indexOf('command') !== -1) {
                const command = eventTarget.innerHTML.replace(/<br>/g, '\n')

                this.$emit('command-click', command)
            }
        },
    },
})
</script>

<style scoped>
.consoleTableRow {
    font-family: 'Roboto Mono', monospace;
    font-size: 0.95em;
    white-space: pre-wrap;

    &.default {
        .v-col {
            padding-top: 8px !important;
            padding-bottom: 8px !important;
        }

        & + .consoleTableRow .v-col {
            border-top: 1px solid rgba(255, 255, 255, 0.12);
        }
    }

    &.compact {
        .v-col {
            padding-top: 2px !important;
            padding-bottom: 2px !important;
        }
    }
}

html.theme--light .consoleTableRow.default + .consoleTableRow .v-col {
    border-top: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
