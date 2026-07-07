<template>
    <v-dialog v-model="showDialog" max-width="400">
        <panel
            :title="$t('JobQueue.ChangeCount')"
            :icon="mdiCounter"
            card-class="jobqueue-change-count-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>

            <v-card-text>
                <v-text-field
                    ref="inputField"
                    v-model="count"
                    :label="$t('JobQueue.Count')"
                    required
                    :rules="countInputRules"
                    hide-spin-buttons
                    type="number"
                    @keyup.enter="update">
                    <template #append>
                        <div class="_spin_button_group">
                            <v-btn class="mt-n3" icon variant="plain" size="small" @click="count++">
                                <v-icon>{{ mdiChevronUp }}</v-icon>
                            </v-btn>
                            <v-btn
                                :disabled="count <= 1"
                                class="mb-n3"
                                icon
                                variant="plain"
                                size="small"
                                @click="count--">
                                <v-icon>{{ mdiChevronDown }}</v-icon>
                            </v-btn>
                        </div>
                    </template>
                </v-text-field>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" @click="closeDialog">{{ $t('Buttons.Cancel') }}</v-btn>
                <v-btn color="primary" variant="text" @click="update">{{ $t('JobQueue.ChangeCount') }}</v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import type { FocusableRef } from '@/types/vuetify'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick, mdiChevronUp, mdiChevronDown, mdiCounter } from '@mdi/js'
import { ServerJobQueueStateJob } from '@/store/server/jobQueue/types'

export default defineComponent({
    name: 'JobqueueEntryChangeCountDialog',
    components: { Panel },
    mixins: [BaseMixin],
    props: {
        modelValue: { type: Boolean, default: false },
        job: { type: Object as PropType<ServerJobQueueStateJob>, required: true },
    },
    emits: ['update:modelValue'],
    data() {
        return {
            mdiCloseThick: mdiCloseThick,
            mdiChevronUp: mdiChevronUp,
            mdiChevronDown: mdiChevronDown,
            mdiCounter: mdiCounter,
            count: 1,
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
        countInputRules() {
            return [
                (value: string) => !!value || this.$t('JobQueue.InvalidCountEmpty'),
                (value: string) => parseInt(value) > 0 || this.$t('JobQueue.InvalidCountGreaterZero'),
            ]
        },
    },
    methods: {
        update() {
            this.$store.dispatch('server/jobQueue/changeCount', {
                job_id: this.job.job_id,
                count: this.count,
            })

            this.closeDialog()
        },
        closeDialog() {
            this.showDialog = false
        },
    },
    watch: {
        showDialog(newVal: boolean) {
            if (!newVal) return

            this.count = (this.job.combinedIds?.length ?? 0) + 1
            setTimeout(() => {
                ;(this.$refs.inputField as FocusableRef).focus()
            })
        },
    },
})
</script>
