<template>
    <v-row>
        <v-col class="text-center py-0">
            <macro-prompt-button
                v-for="(button, index) in children"
                :key="'prompt_' + groupIndex + '_' + index"
                :event="button" />
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { ServerStateEventPrompt } from '@/store/server/types'

export default defineComponent({
    name: 'MacroPromptButtonGroup',
    mixins: [BaseMixin],
    props: {
        children: { type: Array as PropType<ServerStateEventPrompt[]>, required: true },
        groupIndex: { type: Number, required: true },
    },
})
</script>
