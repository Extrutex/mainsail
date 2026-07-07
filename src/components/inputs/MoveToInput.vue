<template>
    <form @submit.prevent="submit">
        <v-text-field
            v-model="position"
            :label="`[ ${label} ]`"
            :suffix="suffix"
            :disabled="disabled"
            :step="step"
            :readonly="readonly"
            hide-details="auto"
            type="number"
            hide-spin-buttons
            variant="outlined"
            reverse
            density="compact"
            @blur="onBlur"
            @focus="!readonly ? $event.target.select() : {}"></v-text-field>
    </form>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'

export default defineComponent({
    name: 'MoveToInput',
    components: {},
    mixins: [BaseMixin],
    props: {
        modelValue: { type: String },
        currentPos: { type: String, required: true },
        label: { type: String, required: false },
        suffix: { type: String, required: false },
        step: { type: Number, required: false, default: 1 },
        disabled: { type: Boolean, required: false },
        readonly: { type: Boolean, required: false },
    },
    emits: ['update:modelValue', 'submit'],
    computed: {
        position: {
            get(): string {
                return this.modelValue ?? ''
            },
            set(newVal: string) {
                this.$emit('update:modelValue', newVal)
            },
        },
    },
    methods: {
        onBlur() {
            if (this.position !== this.currentPos) {
                this.position = this.currentPos
            }
        },

        submit(): void {
            this.$emit('submit')
        },
    },
})
</script>
