<template>
    <span class="_currentState" :style="currentStateStyle" @click="clickButton"></span>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'

export default defineComponent({
    name: 'MiscellaneousLightNeopixelState',
    mixins: [BaseMixin],
    props: {
        type: { type: String, required: true },
        name: { type: String, required: true },
        index: { type: Number, required: true },
    },
    emits: ['click-button'],
    computed: {
        printerObject() {
            const printer = this.$store.state.printer ?? {}

            return printer[`${this.type} ${this.name}`] ?? {}
        },
        colorData() {
            return this.printerObject.color_data ?? []
        },
        current() {
            const data = this.colorData[this.index - 1] ?? []

            return {
                red: data[0] ?? null,
                green: data[1] ?? null,
                blue: data[2] ?? null,
                white: data[3] ?? null,
            }
        },
        currentStateStyle() {
            const red = Math.round((this.current.red ?? 0) * 255)
            const green = Math.round((this.current.green ?? 0) * 255)
            const blue = Math.round((this.current.blue ?? 0) * 255)
            const white = Math.round((this.current.white ?? 0) * 255)

            let output = `rgba(${red}, ${green}, ${blue})`

            if (red === 0 && green === 0 && blue === 0 && white > 0) {
                output = `rgb(${white}, ${white}, ${white})`
            }

            return { 'background-color': output }
        },
    },
    methods: {
        clickButton() {
            this.$emit('click-button')
        },
    },
})
</script>

<style scoped>
._currentState {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    border: 1px solid lightgray;
    cursor: pointer;
}
</style>
