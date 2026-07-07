import { defineComponent } from 'vue'
import { parseNumber } from '@/plugins/helpers'
import { ExtruderConfigSettings, PrinterStateExtruder } from '@/store/printer/types'

export default defineComponent({
    computed: {
        extruders(): PrinterStateExtruder[] {
            return this.$store.getters['printer/getExtruders']
        },

        activeExtruder(): string {
            return this.$store.state.printer.toolhead?.extruder
        },

        activeExtruderSettings(): ExtruderConfigSettings | undefined {
            return this.$store.state.printer.configfile?.settings?.[this.activeExtruder]
        },

        filamentDiameter(): number {
            return parseNumber(this.activeExtruderSettings?.filament_diameter, 1.75)
        },

        nozzleDiameter(): number {
            return parseNumber(this.activeExtruderSettings?.nozzle_diameter, 0.4)
        },

        feedamount(): number {
            return parseFloat(this.$store.state.gui.control.extruder.feedamount)
        },

        feedrate(): number {
            return parseFloat(this.$store.state.gui.control.extruder.feedrate)
        },

        extrudeFactor(): number {
            return this.$store.state.printer?.gcode_move?.extrude_factor ?? 1
        },

        extrudePossible(): boolean {
            return this.$store.getters['printer/getExtrudePossible']
        },

        minExtrudeTemp(): number {
            return parseNumber(this.activeExtruderSettings?.min_extrude_temp, 170)
        },
    },
})
