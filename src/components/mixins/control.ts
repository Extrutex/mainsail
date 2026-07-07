import { defineComponent } from 'vue'

export default defineComponent({
    computed: {
        absolute_coordinates(): boolean {
            return this.$store.state.printer?.gcode_move?.absolute_coordinates ?? true
        },

        enableXYHoming(): boolean {
            return this.$store.state.gui.control.enableXYHoming
        },

        feedrateXY(): number {
            return this.$store.state.gui.control?.feedrateXY ?? 100
        },

        feedrateZ(): number {
            return this.$store.state.gui.control?.feedrateZ ?? 10
        },

        existsQGL(): boolean {
            return this.$store.getters['printer/existsQGL']
        },

        existsZtilt(): boolean {
            return this.$store.getters['printer/existsZtilt']
        },

        existsBedTilt(): boolean {
            return this.$store.getters['printer/existsBedTilt']
        },

        existsBedScrews(): boolean {
            return this.$store.getters['printer/existsBedScrews']
        },

        existsDeltaCalibrate(): boolean {
            return this.$store.getters['printer/existsDeltaCalibrate']
        },

        existsScrewsTilt(): boolean {
            return this.$store.getters['printer/existsScrewsTilt']
        },

        existsFirmwareRetraction(): boolean {
            return this.$store.getters['printer/existsFirmwareRetraction']
        },

        colorQuadGantryLevel(): string {
            const status = this.$store.state.printer.quad_gantry_level?.applied ?? true

            return status ? 'primary' : 'warning'
        },

        colorZTilt(): string {
            let status = true

            // normal Klipper z_tilt
            if ('z_tilt' in this.$store.state.printer) {
                status = this.$store.state.printer.z_tilt?.applied
            }
            // check Kalico next gen z_tilt
            else if ('z_tilt_ng' in this.$store.state.printer) {
                status = this.$store.state.printer.z_tilt_ng?.applied
            }

            return status ? 'primary' : 'warning'
        },

        defaultActionButton(): string {
            return this.$store.getters['gui/getDefaultControlActionButton']
        },

        actionButton(): string {
            const button = this.$store.state.gui.control.actionButton ?? this.defaultActionButton

            if (
                (button === 'qgl' && !this.$store.getters['printer/existsQGL']) ||
                (button === 'ztilt' && !this.$store.getters['printer/existsZTilt'])
            ) {
                return this.defaultActionButton
            }

            return button
        },

        /**
         * Axes home states
         */

        homedAxes(): string {
            return this.$store.state.printer?.toolhead?.homed_axes ?? ''
        },

        xAxisHomed(): boolean {
            return this.homedAxes.includes('x')
        },

        yAxisHomed(): boolean {
            return this.homedAxes.includes('y')
        },

        zAxisHomed(): boolean {
            return this.homedAxes.includes('z')
        },

        macros(): any {
            return this.$store.getters['printer/getMacros']
        },

        toolchangeMacros(): string[] {
            const sortToolchangeMacros = (a: string, b: string) => {
                const numberA = parseInt(a.slice(1))
                const numberB = parseInt(b.slice(1))

                return numberA - numberB
            }

            const commands = this.$store.state.printer.gcode?.commands ?? null
            if (commands) {
                return Object.keys(commands)
                    .filter((gcode) => gcode.match(/^T\d+/))
                    .sort(sortToolchangeMacros)
            }

            return Object.keys(this.$store.state.printer)
                .filter((gcode) => gcode.toLowerCase().match(/^gcode_macro t\d+/))
                .map((gcode) => gcode.slice(gcode.indexOf(' ') + 1))
                .sort(sortToolchangeMacros)
        },

        existsClientLinearMoveMacro(): boolean {
            const macros = this.$store.state.printer?.gcode?.commands ?? {}

            return '_CLIENT_LINEAR_MOVE' in macros
        },
    },
    methods: {
        doHome() {
            this.$store.dispatch('server/addEvent', { message: 'G28', type: 'command' })
            this.$socket.emit('printer.gcode.script', { script: 'G28' }, { loading: 'homeAll' })
        },

        doHomeX() {
            this.$store.dispatch('server/addEvent', { message: 'G28 X', type: 'command' })
            this.$socket.emit('printer.gcode.script', { script: 'G28 X' }, { loading: 'homeX' })
        },

        doHomeY() {
            this.$store.dispatch('server/addEvent', { message: 'G28 Y', type: 'command' })
            this.$socket.emit('printer.gcode.script', { script: 'G28 Y' }, { loading: 'homeY' })
        },

        doHomeXY() {
            this.$store.dispatch('server/addEvent', { message: 'G28 X Y', type: 'command' })
            this.$socket.emit('printer.gcode.script', { script: 'G28 X Y' }, { loading: 'homeXY' })
        },

        doHomeZ() {
            this.$store.dispatch('server/addEvent', { message: 'G28 Z', type: 'command' })
            this.$socket.emit('printer.gcode.script', { script: 'G28 Z' }, { loading: 'homeZ' })
        },

        doQGL() {
            this.$store.dispatch('server/addEvent', { message: 'QUAD_GANTRY_LEVEL', type: 'command' })
            this.$socket.emit('printer.gcode.script', { script: 'QUAD_GANTRY_LEVEL' }, { loading: 'qgl' })
        },

        doZtilt() {
            this.$store.dispatch('server/addEvent', { message: 'Z_TILT_ADJUST', type: 'command' })
            this.$socket.emit('printer.gcode.script', { script: 'Z_TILT_ADJUST' }, { loading: 'zTilt' })
        },

        doSendMove(gcode: string, feedrate: number) {
            let command =
                `SAVE_GCODE_STATE NAME=_ui_movement\n` +
                `G91\n` +
                `G1 ${gcode} F${feedrate * 60}\n` +
                `RESTORE_GCODE_STATE NAME=_ui_movement`

            if (this.existsClientLinearMoveMacro) {
                gcode = gcode
                    .split(' ')
                    .map((part) => {
                        const axis = part.slice(0, 1)
                        const value = parseFloat(part.slice(1))

                        return `${axis}=${value}`
                    })
                    .join(' ')

                command = `_CLIENT_LINEAR_MOVE ${gcode} F=${feedrate * 60}`
            }

            this.doSend(command)
        },

        doSend(gcode: string): void {
            this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
            this.$socket.emit('printer.gcode.script', { script: gcode })
        },
    },
})
