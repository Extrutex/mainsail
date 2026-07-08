<template>
    <v-dialog v-model="showDialog" width="400" :fullscreen="isMobile">
        <panel card-class="confirm-top-corner-menu-dialog" :icon="iconToUse" :title="title" :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="close">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>{{ text }}</v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" @click="close">{{ cancelButtonComputed }}</v-btn>
                <v-btn variant="text" :color="actionButtonColor" @click="action">{{ actionButtonText }}</v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import Panel from '@/components/ui/Panel.vue'
import BaseMixin from '@/components/mixins/base'
import { mdiAlert, mdiCloseThick } from '@mdi/js'

export default defineComponent({
    name: 'ConfirmationDialog',
    components: { Panel },
    mixins: [BaseMixin],
    props: {
        modelValue: { type: Boolean, default: false },
        title: { type: String, required: true },
        text: { type: String, required: true },
        actionButtonText: { type: String, required: true },
        cancelButtonText: { type: String, default: '' },
        actionButtonColor: { type: String, default: 'error' },
        icon: { type: String as PropType<string | null>, default: null },
    },
    emits: ['update:modelValue', 'action'],
    data() {
        return {
            mdiAlert: mdiAlert,
            mdiCloseThick: mdiCloseThick,
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

        iconToUse() {
            return this.icon ?? this.mdiAlert
        },

        cancelButtonComputed(): string {
            return this.cancelButtonText || this.$t('Buttons.Cancel').toString()
        },
    },
    methods: {
        action() {
            this.$emit('action')
            this.showDialog = false
        },

        close() {
            this.showDialog = false
        },
    },
})
</script>
