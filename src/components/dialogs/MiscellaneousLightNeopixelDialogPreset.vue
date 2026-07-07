<template>
    <v-tooltip location="top">
        <template #activator="{ props }">
            <div :style="presetStyle" v-bind="props" @click="usePreset" />
        </template>
        <span>{{ name }}</span>
    </v-tooltip>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { GuiMiscellaneousStateEntryPreset } from '@/store/gui/miscellaneous/types'

export default defineComponent({
    name: 'MiscellaneousLightNeopixelDialogPreset',
    mixins: [BaseMixin],
    props: {
        preset: { type: Object as PropType<GuiMiscellaneousStateEntryPreset>, required: true },
    },
    emits: ['update-color'],
    computed: {
        name() {
            return this.preset.name
        },
        presetStyle() {
            const red = this.preset.red ?? 0
            const green = this.preset.green ?? 0
            const blue = this.preset.blue ?? 0
            const white = this.preset.white ?? 0
            const RGBSum = red + green + blue

            if (RGBSum && white > 0) {
                return { backgroundColor: `rgb(${white}%, ${white}%, ${white}%)` }
            }

            return { backgroundColor: `rgb(${red}%, ${green}%, ${blue}%)` }
        },
    },
    methods: {
        usePreset() {
            const red = this.preset.red ?? 0
            const green = this.preset.green ?? 0
            const blue = this.preset.blue ?? 0
            const white = this.preset.white ?? 0

            this.$emit('update-color', { red, green, blue, white })
        },
    },
})
</script>
