<template>
    <v-btn
        :disabled="printerIsPrintingOnly"
        density="compact"
        class="flex-grow-1 px-0"
        :style="buttonStyle"
        @click="changeTool">
        <span v-if="color != null" class="_extruderColorState mr-1" :style="dotStyle" />
        {{ name.toUpperCase() }}
    </v-btn>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import ControlMixin from '@/components/mixins/control'
import { ServerSpoolmanStateSpool } from '@/store/server/spoolman/types'

export default defineComponent({
    name: 'ExtruderControlPanel',
    components: {},
    mixins: [BaseMixin, ControlMixin],
    props: {
        name: { type: String },
    },
    computed: {
        macro() {
            const objectName = Object.keys(this.$store.state.printer).find(
                (key) => key.toLowerCase() === `gcode_macro ${this.name?.toLowerCase()}`
            )
            if (!objectName) return undefined

            return this.$store.state.printer[objectName] ?? {}
        },
        active() {
            return this.macro?.active ?? false
        },
        color() {
            if (this.spool) {
                return this.spool.filament?.color_hex ?? '000000'
            }

            const color = this.macro?.color ?? this.macro?.colour ?? null
            if (color === '' || color === 'undefined') return null

            return color
        },
        spoolId() {
            return this.macro?.spool_id ?? null
        },
        spool() {
            const spools = this.$store.state.server.spoolman.spools ?? []

            return spools.find((spool: ServerSpoolmanStateSpool) => spool.id === this.spoolId) ?? null
        },
        primaryColor(): string {
            return this.$store.state.gui.uiSettings.primary
        },
        primaryTextColor(): string {
            const splits = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(this.primaryColor)
            if (splits) {
                const r = parseInt(splits[1], 16) * 0.2126
                const g = parseInt(splits[2], 16) * 0.7152
                const b = parseInt(splits[3], 16) * 0.0722
                const perceivedLightness = (r + g + b) / 255

                return perceivedLightness > 0.7 ? '#222' : '#fff'
            }

            return '#ffffff'
        },
        warningColor(): string {
            return this.$vuetify?.theme?.currentTheme?.warning?.toString() ?? '#ff8300'
        },
        buttonStyle() {
            let backgroundColor = ''
            if (this.active) {
                backgroundColor = this.homedAxes.includes('xyz') ? this.primaryColor : this.warningColor
            }

            const textColor = this.active ? this.primaryTextColor : ''

            return {
                color: textColor,
                'background-color': backgroundColor,
            }
        },
        dotStyle() {
            return {
                'border-color': this.active ? this.primaryTextColor : '',
                'background-color': '#' + this.color,
            }
        },
    },
    methods: {
        changeTool() {
            this.doSend(this.name.toUpperCase())
        },
    },
})
</script>

<style lang="scss" scoped>
._extruderColorState {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    border: 1px solid lightgray;
}
</style>
