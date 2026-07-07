<template>
    <v-tooltip location="top" :disabled="!showTooltip">
        <template #activator="{ props }">
            <v-btn
                ref="button"
                block
                :size="btnSize"
                color="secondary"
                :disabled="disabled"
                :loading="btnLoading"
                v-bind="props"
                @click="sendCommand">
                <v-icon :start="!showTooltip">{{ icon }}</v-icon>
                <template v-if="!showTooltip">{{ text }}</template>
            </v-btn>
        </template>
        <span>{{ text }}</span>
    </v-tooltip>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { ComponentPublicInstance, PropType } from 'vue'
import BaseMixin from '@/components/mixins/base'
import MmuMixin from '@/components/mixins/mmu'

export default defineComponent({
    name: 'MmuControlsButton',
    mixins: [BaseMixin, MmuMixin],
    props: {
        disabled: { type: Boolean, required: true },
        icon: { type: String, required: true },
        text: { type: String, required: true },
        command: { type: String, required: true },
        size: { type: String as PropType<'small' | 'large'>, default: 'small' },
    },
    data() {
        return {
            showTooltip: false,
        }
    },
    computed: {
        largeFilamentStatus(): boolean {
            return this.$store.state.gui.view.mmu.largeFilamentStatus ?? false
        },

        btnSizeSmall() {
            return this.size === 'small'
        },

        btnSizeLarge() {
            return this.size === 'large'
        },

        btnSize() {
            if (this.btnSizeSmall) return 'small'
            if (this.btnSizeLarge) return 'large'

            return 'default'
        },

        btnLoading() {
            return this.loadings.includes(this.command.toLowerCase())
        },
    },
    methods: {
        calcBtnSize() {
            const button = this.$refs.button as ComponentPublicInstance | undefined
            const width = button?.$el.clientWidth ?? undefined

            if (width === undefined || width > 130) {
                this.showTooltip = false
                return
            }

            this.showTooltip = true
        },

        sendCommand() {
            this.doSend(this.command, this.command.toLowerCase())
        },
    },
    watch: {
        largeFilamentStatus() {
            this.calcBtnSize()
        },
    },
    mounted() {
        this.calcBtnSize()
        window.addEventListener('resize', this.calcBtnSize)
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.calcBtnSize)
    },
})
</script>
