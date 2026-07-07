import { defineComponent } from 'vue'
import { GuiConsoleStateFilter } from '@/store/gui/console/types'

export default defineComponent({
    computed: {
        helplist(): { command: string; help: string }[] {
            const commands: { [key: string]: { help?: string } } = this.$store.state.printer.gcode?.commands ?? {}
            const helplist: { command: string; help: string }[] = []

            for (const [key, values] of Object.entries(commands)) {
                helplist.push({ command: key, help: values.help ?? '' })
            }

            return helplist
        },

        consoleDirection(): string {
            return this.$store.state.gui.console.direction ?? 'table'
        },

        hideWaitTemperatures: {
            get(): boolean {
                return this.$store.state.gui.console.hideWaitTemperatures
            },
            set(newVal: boolean) {
                this.$store.dispatch('gui/saveSetting', { name: 'console.hideWaitTemperatures', value: newVal })
            },
        },

        hideTlCommands: {
            get(): boolean {
                return this.$store.state.gui.console.hideTlCommands
            },
            set(newVal: boolean) {
                this.$store.dispatch('gui/saveSetting', { name: 'console.hideTlCommands', value: newVal })
            },
        },

        customFilters(): any {
            return this.$store.state.gui.console.consolefilters ?? {}
        },

        autoscroll: {
            get(): boolean {
                return this.$store.state.gui.console.autoscroll ?? true
            },
            set(newVal: boolean) {
                this.$store.dispatch('gui/saveSetting', { name: 'console.autoscroll', value: newVal })
            },
        },

        rawOutput: {
            get(): boolean {
                return this.$store.state.gui.console.rawOutput ?? false
            },
            set(newVal: boolean) {
                this.$store.dispatch('gui/saveSetting', { name: 'console.rawOutput', value: newVal })
            },
        },

        lastCommands(): string[] {
            return this.$store.state.gui.gcodehistory.entries ?? []
        },
    },
    methods: {
        toggleFilter(id: string | number, filter: GuiConsoleStateFilter): void {
            this.$store.dispatch('gui/console/filterUpdate', { id, values: filter })
        },

        clearConsole() {
            this.$store.dispatch('gui/console/clear')
        },
    },
})
