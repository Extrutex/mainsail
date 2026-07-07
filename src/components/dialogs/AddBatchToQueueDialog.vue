<template>
    <v-dialog v-model="showDialog" :max-width="400" @click:outside="closeDialog" @keydown.esc="closeDialog">
        <panel
            :title="$t('Files.AddToQueue')"
            card-class="gcode-files-add-to-queue-dialog"
            :icon="mdiPlaylistPlus"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>

            <v-form v-model="isValid" @submit.prevent="addBatchToQueueAction">
                <v-card-text>
                    <v-text-field
                        ref="inputField"
                        v-model="input"
                        :label="$t('Files.Count')"
                        required
                        hide-spin-buttons
                        type="number"
                        :rules="rules.count">
                        <template #append>
                            <div class="_spin_button_group">
                                <v-btn class="mt-n3" icon variant="plain" size="small" @click="input++">
                                    <v-icon>{{ mdiChevronUp }}</v-icon>
                                </v-btn>
                                <v-btn
                                    :disabled="input <= 1"
                                    class="mb-n3"
                                    icon
                                    variant="plain"
                                    size="small"
                                    @click="input--">
                                    <v-icon>{{ mdiChevronDown }}</v-icon>
                                </v-btn>
                            </div>
                        </template>
                    </v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn variant="text" @click="closeDialog">{{ $t('Buttons.Cancel') }}</v-btn>
                    <v-btn color="primary" variant="text" type="submit" :disabled="!isValid">
                        {{ $t('Files.AddToQueue') }}
                    </v-btn>
                </v-card-actions>
            </v-form>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { FocusableRef } from '@/types/vuetify'
import BaseMixin from '@/components/mixins/base'
import { mdiChevronDown, mdiChevronUp, mdiPlaylistPlus, mdiCloseThick } from '@mdi/js'

export default defineComponent({
    name: 'AddBatchToQueueDialog',
    mixins: [BaseMixin],
    props: {
        modelValue: { type: Boolean, default: false },
        showToast: { type: Boolean, default: false },
        filename: { type: String, required: true },
    },
    emits: ['update:modelValue'],
    data() {
        return {
            mdiChevronDown: mdiChevronDown,
            mdiChevronUp: mdiChevronUp,
            mdiPlaylistPlus: mdiPlaylistPlus,
            mdiCloseThick: mdiCloseThick,
            isValid: false,
            // because of the text field, the input is always a string
            input: '1' as string,
        }
    },
    computed: {
        showDialog: {
            get(): boolean {
                return this.modelValue
            },
            set(newVal: boolean) {
                this.$emit('update:modelValue', newVal)
            },
        },
        rules() {
            return {
                count: [
                    (value: string) => !!value || this.$t('JobQueue.InvalidCountEmpty'),
                    (value: string) => parseInt(value, 10) > 0 || this.$t('JobQueue.InvalidCountGreaterZero'),
                ],
            }
        },
    },
    methods: {
        async addBatchToQueueAction() {
            const array = Array(parseInt(this.input)).fill(this.filename)

            await this.$store.dispatch('server/jobQueue/addToQueue', array)

            if (this.showToast)
                this.$toast.info(this.$t('History.AddToQueueSuccessful', { filename: this.filename }).toString())

            this.closeDialog()
        },
        closeDialog() {
            this.showDialog = false
        },
        resetFormState() {
            this.input = '1'
        },
    },
    watch: {
        showDialog(newVal: boolean) {
            if (!newVal) return

            this.resetFormState()
            setTimeout(() => {
                ;(this.$refs.inputField as FocusableRef)?.focus()
            })
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
</style>
