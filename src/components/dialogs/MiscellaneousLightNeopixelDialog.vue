<template>
    <v-dialog v-model="showDialog" width="400">
        <panel
            :title="outputName"
            :icon="mdiLightbulbOutline"
            card-class="miscellaneous-light-neopixel-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closePrompt">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>
                <template v-if="presets.length">
                    <v-row>
                        <v-col class="light-presets-container d-flex flex-wrap flex-row justify-center">
                            <miscellaneous-light-neopixel-dialog-preset
                                v-for="preset in presets"
                                :key="preset.id"
                                :preset="preset"
                                @update-color="updateColor" />
                        </v-col>
                    </v-row>
                    <v-divider class="my-3" />
                </template>
                <v-row>
                    <v-col class="text-center">
                        <color-picker
                            :color="colorRGB"
                            :options="colorPickerOptions"
                            @update:color="onColorRGBChanged" />
                        <color-picker
                            v-if="colorOrder.includes('W')"
                            :color="colorRGBW"
                            :options="colorPickerWhiteOptions"
                            class="mt-3"
                            @update:color="onColorWhiteChanged" />
                    </v-col>
                    <v-col>
                        <v-row v-if="colorOrder.includes('R')">
                            <v-col>
                                <number-input
                                    :label="$t('Panels.MiscellaneousPanel.Light.Red')"
                                    param="red"
                                    :target="targetRed"
                                    :default-value="defaultRed"
                                    :min="0"
                                    :max="255"
                                    :dec="1"
                                    :step="1"
                                    :output-error-msg="true"
                                    :has-spinner="true"
                                    @submit="onColorInput" />
                            </v-col>
                        </v-row>
                        <v-row v-if="colorOrder.includes('G')">
                            <v-col>
                                <number-input
                                    :label="$t('Panels.MiscellaneousPanel.Light.Green')"
                                    param="green"
                                    :target="targetGreen"
                                    :default-value="defaultGreen"
                                    :min="0"
                                    :max="255"
                                    :dec="1"
                                    :step="1"
                                    :has-spinner="true"
                                    @submit="onColorInput" />
                            </v-col>
                        </v-row>
                        <v-row v-if="colorOrder.includes('B')">
                            <v-col>
                                <number-input
                                    :label="$t('Panels.MiscellaneousPanel.Light.Blue')"
                                    param="blue"
                                    :target="targetBlue"
                                    :default-value="defaultBlue"
                                    :min="0"
                                    :max="255"
                                    :dec="1"
                                    :step="1"
                                    :has-spinner="true"
                                    @submit="onColorInput" />
                            </v-col>
                        </v-row>
                        <v-row v-if="colorOrder.includes('W')">
                            <v-col>
                                <number-input
                                    :label="$t('Panels.MiscellaneousPanel.Light.White')"
                                    param="white"
                                    :target="targetWhite"
                                    :default-value="defaultWhite"
                                    :min="0"
                                    :max="255"
                                    :dec="1"
                                    :step="1"
                                    :has-spinner="true"
                                    @submit="onColorInput" />
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>
            </v-card-text>
        </panel>
    </v-dialog>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import { mdiCloseThick, mdiLightbulbOutline } from '@mdi/js'
import BaseMixin from '@/components/mixins/base'
import { caseInsensitiveSort, convertName, debounce } from '@/plugins/helpers'
import type { ColorPickerProps } from '@jaames/iro/dist/ColorPicker.d'
import iro from '@jaames/iro'
import { IroColor } from '@irojs/iro-core'
import { GuiMiscellaneousStateEntry } from '@/store/gui/miscellaneous/types'
import MiscellaneousLightNeopixelDialogPreset from '@/components/dialogs/MiscellaneousLightNeopixelDialogPreset.vue'

interface ColorData {
    red: number
    green: number
    blue: number
    white: number

    [key: string]: number
}

export default defineComponent({
    name: 'MiscellaneousLightNeopixelDialog',
    components: { MiscellaneousLightNeopixelDialogPreset },
    mixins: [BaseMixin],
    props: {
        modelValue: { type: Boolean, default: false },
        type: { type: String, required: true },
        name: { type: String, required: true },
        group: { type: Object as PropType<GuiMiscellaneousStateEntry>, required: false, default: null },
        index: { type: Number, default: 1 },
    },
    emits: ['update:modelValue', 'update-color'],
    data() {
        return {
            mdiCloseThick: mdiCloseThick,
            mdiLightbulbOutline: mdiLightbulbOutline,
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
        outputName() {
            return convertName(this.name)
        },
        settings() {
            const settings = this.$store.state.printer.configfile.settings ?? {}

            const key = `${this.type.toLowerCase()} ${this.name.toLowerCase()}`
            return settings[key] ?? {}
        },
        guiEntry() {
            const entries = (this.$store.state.gui.miscellaneous.entries ?? {}) as GuiMiscellaneousStateEntry[]

            const result = Object.entries(entries).find(([, value]) => {
                return value.type === this.type && value.name === this.name
            })

            return result ? result[1] : null
        },
        presets() {
            if (!this.guiEntry?.presets) return []

            const presets = Object.entries(this.guiEntry.presets).map(([key, value]) => {
                return { ...value, id: key }
            })

            return caseInsensitiveSort(presets, 'name')
        },
        colorOrder() {
            if (this.type !== 'led') {
                const colorOrder = this.settings.color_order ?? []

                return colorOrder[0] ?? ''
            }

            const pins = ['red_pin', 'green_pin', 'blue_pin', 'white_pin']
            let colorOrder = ''
            pins.forEach((pin) => {
                if (pin in this.settings) colorOrder += pin.substring(0, 1).toUpperCase()
            })

            return colorOrder
        },
        defaultRed() {
            return Math.round((this.settings.initial_red ?? 0) * 255)
        },
        defaultGreen() {
            return Math.round((this.settings.initial_green ?? 0) * 255)
        },
        defaultBlue() {
            return Math.round((this.settings.initial_blue ?? 0) * 255)
        },
        defaultWhite() {
            return Math.round((this.settings.initial_white ?? 0) * 255)
        },
        targetRed() {
            return Math.round((this.current.red ?? 0) * 255)
        },
        targetGreen() {
            return Math.round((this.current.green ?? 0) * 255)
        },
        targetBlue() {
            return Math.round((this.current.blue ?? 0) * 255)
        },
        targetWhite() {
            return Math.round((this.current.white ?? 0) * 255)
        },
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
        colorPickerOptions() {
            const options: ColorPickerProps = {
                width: 200,
                margin: 15,
                layout: [],
            }
            const layout: ColorPickerProps['layout'] = []

            const existRed = this.colorOrder.includes('R')
            const existGreen = this.colorOrder.includes('G')
            const existBlue = this.colorOrder.includes('B')

            if (existRed && existGreen && existBlue) {
                options.layout = [
                    {
                        component: iro.ui.Wheel,
                    },
                    {
                        component: iro.ui.Slider,
                        options: {
                            sliderType: 'value',
                        },
                    },
                ]

                return options
            }

            if (existRed) {
                layout.push({
                    component: iro.ui.Slider,
                    options: {
                        sliderType: 'red',
                    },
                })
            }

            if (existGreen) {
                layout.push({
                    component: iro.ui.Slider,
                    options: {
                        sliderType: 'green',
                    },
                })
            }

            if (existBlue) {
                layout.push({
                    component: iro.ui.Slider,
                    options: {
                        sliderType: 'blue',
                    },
                })
            }

            options.layout = layout
            return options
        },
        colorPickerWhiteOptions() {
            const options: ColorPickerProps = {
                width: 200,
                margin: 15,
                layout: [
                    {
                        component: iro.ui.Slider,
                        options: {
                            sliderType: 'alpha',
                        },
                    },
                ],
            }

            return options
        },
        colorRGB() {
            const red = Math.round((this.current.red ?? 0) * 255)
            const green = Math.round((this.current.green ?? 0) * 255)
            const blue = Math.round((this.current.blue ?? 0) * 255)

            return `rgb(${red}, ${green}, ${blue})`
        },
        colorRGBW() {
            return `rgba(255, 255, 255, ${this.current.white ?? 0})`
        },
    },
    methods: {
        onColorRGBChanged: debounce(function (this: any, value: IroColor) {
            if (value.red === this.targetRed && value.green === this.targetGreen && value.blue === this.targetBlue)
                return

            const color: ColorData = {
                red: value.red,
                green: value.green,
                blue: value.blue,
                white: this.targetWhite,
            }

            this.updateColor(color)
        }, 500),
        onColorWhiteChanged: debounce(function (this: any, value: IroColor) {
            if (value.alpha === this.targetWhite) return

            const color: ColorData = {
                red: this.targetRed,
                green: this.targetGreen,
                blue: this.targetBlue,
                white: Math.round(value.alpha * 255),
            }

            this.updateColor(color)
        }, 500),
        onColorInput: debounce(function (this: any, payload: { name: string; value: number }) {
            const color: ColorData = {
                red: this.targetRed,
                green: this.targetGreen,
                blue: this.targetBlue,
                white: this.targetWhite,
            }

            // stop when the value is the same as the current value
            if (!(payload.name in color) || color[payload.name] === payload.value) return

            color[payload.name] = payload.value
            this.updateColor(color)
        }, 500),
        updateColor(colorData: ColorData) {
            const red = Math.round((colorData.red / 255) * 100) / 100
            const green = Math.round((colorData.green / 255) * 100) / 100
            const blue = Math.round((colorData.blue / 255) * 100) / 100
            const white = Math.round((colorData.white / 255) * 100) / 100

            this.$emit('update-color', red, green, blue, white)
        },
        closePrompt() {
            this.showDialog = false
        },
    },
})
</script>

<style scoped>
.light-presets-container {
    gap: 6px;
}

.light-presets-container :deep(> div) {
    width: 28px;
    height: 28px;
    border-radius: 4px;
    cursor: pointer;
}
</style>
