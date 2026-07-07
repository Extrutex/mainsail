<template>
    <div>
        <v-btn :disabled="isLoading" @click="handleClick">
            <v-icon start>{{ mdiCheck }}</v-icon>
            {{ $t('Common.Save') }}
        </v-btn>
    </div>
</template>

<script lang="ts">
/**
 * Canonical example of the Vue 3 Options API component structure.
 * This file serves as a reference for AI agents - do not delete.
 *
 * Option order:
 * 1. name
 * 2. components
 * 3. mixins
 * 4. props
 * 5. emits
 * 6. data()
 * 7. computed
 * 8. watch
 * 9. Lifecycle hooks (created, mounted, beforeUnmount, ...)
 * 10. methods
 */
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { mdiCheck } from '@mdi/js'

export default defineComponent({
    name: 'VueComponentExample',
    mixins: [BaseMixin],
    props: {
        title: { type: String, required: true },
        initialCount: { type: Number, default: 0 },
    },
    emits: ['click'],
    data() {
        return {
            // Icons
            mdiCheck: mdiCheck,

            isLoading: false,
            count: 0,
        }
    },
    computed: {
        formattedTitle(): string {
            return this.title.toUpperCase()
        },

        isValid(): boolean {
            return this.count > 0 && !this.isLoading
        },
    },
    watch: {
        initialCount: {
            immediate: true,
            handler(newVal: number) {
                this.count = newVal
            },
        },
    },
    mounted() {
        window.addEventListener('resize', this.onResize)
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.onResize)
    },
    methods: {
        handleClick(): void {
            this.isLoading = true
            this.$emit('click')
        },

        onResize(): void {
            // handle resize
        },
    },
})
</script>
