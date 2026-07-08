<template>
    <form @submit.prevent="submit">
        <v-text-field
            v-model="value"
            :label="label"
            :suffix="unit"
            :error="invalidInput"
            :error-messages="inputErrors"
            :disabled="disabled"
            :step="step"
            :min="min"
            :max="max"
            :dec="dec"
            hide-spin-buttons
            hide-details="auto"
            variant="outlined"
            density="compact"
            class="d-flex align-top"
            @blur="value = target.toString()"
            @focus="$event.target.select()"
            @keydown="checkInvalidChars">
            <template v-if="defaultValue !== null" #append-inner>
                <v-icon @click="resetToDefault">{{ value !== defaultValue.toString() ? mdiRestart : '' }}</v-icon>
            </template>
            <template v-if="hasSpinner" #append>
                <div class="_spin_button_group">
                    <v-btn
                        :disabled="(value >= max && max !== null) || error || disabled"
                        class="mt-n3"
                        icon
                        variant="plain"
                        size="small"
                        @click="incrementValue">
                        <v-icon>{{ mdiChevronUp }}</v-icon>
                    </v-btn>
                    <v-btn
                        :disabled="value <= min || error || disabled"
                        class="mb-n3"
                        icon
                        variant="plain"
                        size="small"
                        @click="decrementValue">
                        <v-icon>{{ mdiChevronDown }}</v-icon>
                    </v-btn>
                </div>
            </template>
        </v-text-field>
    </form>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { mdiChevronDown, mdiChevronUp, mdiRestart } from '@mdi/js'
import { TranslateResult } from 'vue-i18n'

export default defineComponent({
    name: 'NumberInput',
    mixins: [BaseMixin],
    props: {
        // input field name and identifier
        label: { type: String as PropType<TranslateResult | string>, required: true },
        param: { type: String, required: true },
        // props defining incoming data
        target: { type: Number, required: true },
        defaultValue: { type: Number, required: false, default: null },
        // props for internal processing
        min: { type: Number, required: true },
        max: { type: Number as PropType<number | null>, default: null },
        dec: { type: Number, required: true },
        step: { type: Number, required: false, default: 1 },
        unit: { type: String, required: false },
        // spinner related props
        hasSpinner: { type: Boolean, required: false, default: false },
        spinnerFactor: { type: Number, required: false, default: 1 },
        // props for general internal behaviour
        disabled: { type: Boolean, required: false, default: false },
        outputErrorMsg: { type: Boolean, required: false, default: false },
    },
    emits: ['submit'],
    data() {
        return {
            mdiRestart: mdiRestart,
            mdiChevronUp: mdiChevronUp,
            mdiChevronDown: mdiChevronDown,

            value: '0',
            error: false,
            invalidChars: ['e', 'E', '+'] as string[],
        }
    },
    computed: {
        // this function only parse this.value, to escape an empty input
        inputValue(): number {
            if (this.value.toString() === '') return 0

            return parseFloat(this.value.replace(',', '.'))
        },

        invalidInput(): boolean {
            return this.inputErrors.length > 0
        },

        inputErrors() {
            if (!this.outputErrorMsg) return []

            const errors = []
            if (this.max === null && this.inputValue < this.min) {
                // "Must be grater or equal than {min}!"
                errors.push(this.$t('App.NumberInput.GreaterOrEqualError', { min: this.min }))
            }
            if (this.max !== null && (this.inputValue > this.max! || this.inputValue < this.min)) {
                // "Must be between {min} and {max}!"
                errors.push(this.$t('App.NumberInput.MustBeBetweenError', { min: this.min, max: this.max }))
            }

            return errors
        },
    },
    watch: {
        target(): void {
            this.value = this.target.toString()
        },
    },
    created(): void {
        this.value = this.target.toString()
    },
    methods: {
        incrementValue(): void {
            if (this.inputValue + this.step * this.spinnerFactor < this.max! || this.max === null) {
                this.value = (
                    Math.round((this.inputValue + this.step * this.spinnerFactor) * 10 ** this.dec) /
                    10 ** this.dec
                ).toString()
            } else this.value = this.max.toString()

            this.submit()
        },

        decrementValue(): void {
            if (this.inputValue - this.step * this.spinnerFactor > this.min) {
                this.value = (
                    Math.round((this.inputValue - this.step * this.spinnerFactor) * 10 ** this.dec) /
                    10 ** this.dec
                ).toString()
            } else this.value = this.min.toString()

            this.submit()
        },

        resetToDefault(): void {
            this.value = this.defaultValue?.toString()
            this.submit()
        },

        submit(): void {
            if (this.invalidInput) return
            this.$emit('submit', { name: this.param, value: this.inputValue })
        },

        // input validation //
        checkInvalidChars(event: KeyboardEvent): void {
            // add '-' to invalid characters if no negative input is allowed
            if (this.min >= 0) this.invalidChars.push('-')
            if (this.invalidChars.includes(event.key)) event.preventDefault()
        },
    },
})
</script>

<style scoped>
._spin_button_group {
    width: 24px;
    margin-top: -6px;
    margin-left: -6px;
    margin-bottom: -6px;
}

.v-input--has-state {
    margin-bottom: -18px !important;
}
</style>
