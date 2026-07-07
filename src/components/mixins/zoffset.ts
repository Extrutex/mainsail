import { defineComponent } from 'vue'

export default defineComponent({
    computed: {
        homing_origin(): number[] {
            return this.$store.state.printer?.gcode_move?.homing_origin ?? []
        },

        z_gcode_offset(): number {
            return this.homing_origin.length > 1 ? Math.round(this.homing_origin[2] * 1000) / 1000 : 0
        },

        commands(): any {
            return this.$store.state.printer.gcode?.commands ?? {}
        },

        settings(): any {
            return this.$store.state.printer.configfile?.settings ?? {}
        },

        kinematics(): string {
            return this.settings.printer?.kinematics ?? 'cartesian'
        },

        stepper_name(): string {
            if (this.kinematics === 'delta') return 'stepper_a'

            return 'stepper_z'
        },

        endstop_pin(): any {
            return this.settings[this.stepper_name]?.endstop_pin?.trim() ?? null
        },

        zOffset(): number {
            return this.$store.state.printer?.gcode_move?.homing_origin[2].toFixed(3)
        },

        isEndstopProbe(): boolean {
            // remove spaces and search for probe:z_virtual_endstop
            return this.endstop_pin.replaceAll(' ', '').search('probe:z_virtual_endstop') !== -1
        },

        existZOffsetApplyProbe(): boolean {
            return 'Z_OFFSET_APPLY_PROBE' in this.commands
        },

        existZOffsetApplyEndstop(): boolean {
            return 'Z_OFFSET_APPLY_ENDSTOP' in this.commands
        },

        showSaveButton(): boolean {
            // hide button when offset is 0
            if (this.z_gcode_offset === 0) return false

            // show button when z endstop is probe and probe gcode exists
            if (this.isEndstopProbe && this.existZOffsetApplyProbe) return true

            // show button when z endstop is endstop and endstop gcode exists
            return !this.isEndstopProbe && this.existZOffsetApplyEndstop
        },

        autoSaveZOffsetOption(): string {
            if (this.isEndstopProbe && this.existZOffsetApplyProbe) return 'Z_OFFSET_APPLY_PROBE'

            return 'Z_OFFSET_APPLY_ENDSTOP'
        },
    },
})
