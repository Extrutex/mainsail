<template>
    <div :class="'consoleTable ' + (isMini ? 'mini' : '')">
        <v-row v-if="events.length === 0" class="pa-0 ma-0">
            <v-col class="text-center py-3">{{ $t('Console.Empty') }}</v-col>
        </v-row>
        <template v-else>
            <console-table-entry
                v-for="(event, index) of events"
                :key="index"
                class="consoleTableRow"
                :event="event"
                @command-click="commandClick" />
        </template>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ServerStateEvent } from '@/store/server/types'
import ConsoleTableEntry from '@/components/console/ConsoleTableEntry.vue'

export default defineComponent({
    name: 'ConsoleTable',
    components: { ConsoleTableEntry },
    props: {
        events: { type: Array as PropType<ServerStateEvent[]>, required: true },
        isMini: { type: Boolean, required: false, default: false },
    },
    emits: ['command-click'],
    methods: {
        commandClick(msg: string) {
            this.$emit('command-click', msg)
        },
    },
})
</script>
