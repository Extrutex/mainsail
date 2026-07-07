<template>
    <v-row>
        <v-col>
            <p class="mb-0">{{ text }}</p>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { ServerStateEventPromptContent } from '@/store/server/types'

export default defineComponent({
    name: 'MacroPromptText',
    mixins: [BaseMixin],
    props: {
        event: { type: Object as PropType<ServerStateEventPromptContent>, required: true },
    },
    computed: {
        text() {
            return this.event.message
        },
    },
})
</script>
