<template>
    <div>
        <div ref="picker"></div>
    </div>
</template>

<script lang="ts">
import { defineComponent, markRaw } from 'vue'
import type { PropType } from 'vue'
import BaseMixin from '@/components/mixins/base'
import iro from '@jaames/iro'
import { IroColor } from '@irojs/iro-core'
import { ColorPickerProps, IroColorPicker as IroCP } from '@jaames/iro/dist/ColorPicker.d'

export default defineComponent({
    name: 'ColorPicker',
    mixins: [BaseMixin],
    props: {
        color: { type: [Object, String] as PropType<IroColor | string>, default: '#ffffff' },
        options: { type: Object as PropType<ColorPickerProps>, default: () => ({}) },
    },
    emits: ['change', 'update:color'],
    data() {
        return {
            colorPicker: null as IroCP | null,
        }
    },
    computed: {
        internalOptions(): ColorPickerProps {
            return {
                ...this.options,
                color: this.color,
                borderWidth: 2,
                sliderSize: 16,
            }
        },
    },
    watch: {
        color: {
            handler(value: string) {
                if (this.colorPicker && this.colorPicker.color.rgbString !== value) {
                    this.colorPicker.color.rgbString = value
                }
            },
            deep: true,
        },
    },
    mounted() {
        this.colorPicker = markRaw(iro.ColorPicker(this.$refs.picker as HTMLElement, this.internalOptions))
        this.colorPicker.on('color:change', this.onColorChange)
    },
    beforeUnmount() {
        this.colorPicker?.off('color:change', this.onColorChange)
    },
    methods: {
        emitColorChange(color: IroColor) {
            this.$emit('change', color)
            this.$emit('update:color', color)
        },

        onColorChange(color: IroColor) {
            this.emitColorChange(color)
        },
    },
})
</script>

<style scoped></style>
