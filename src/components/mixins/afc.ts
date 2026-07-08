import { defineComponent } from 'vue'
import { ServerSpoolmanStateSpool } from '@/store/server/spoolman/types'

export default defineComponent({
    computed: {
        afcExists(): boolean {
            return 'AFC' in this.$store.state.printer
        },

        afc() {
            return this.$store.state.printer.AFC ?? {}
        },

        afcExtruders(): string[] {
            return this.afc.extruders ?? []
        },

        afcHubs(): string[] {
            return this.afc.hubs ?? []
        },

        afcUnits(): string[] {
            return this.afc.units ?? []
        },

        afcLanes(): string[] {
            return this.afc.lanes ?? []
        },

        afcLoadedSpools(): { lane: string; spoolId: number }[] {
            if (this.afcLanes.length === 0) return []

            const spoolIds: { lane: string; spoolId: number }[] = []
            this.afcLanes.forEach((name) => {
                const lane = this.getAfcLaneObject(name)
                if (!lane || !lane.spool_id) return

                spoolIds.push({
                    lane: name,
                    spoolId: lane.spool_id,
                })
            })

            return spoolIds
        },

        afcErrorState(): boolean {
            return this.afc.error_state ?? false
        },

        afcCurrentLane() {
            const current = this.afc.current_load ?? this.afc.current_lane ?? null
            if (current === null) return null

            return this.getAfcLaneObject(current)
        },

        afcCurrentBuffer() {
            const name = this.afcCurrentLane?.buffer ?? null
            if (name === null) return null

            return this.getAfcBufferObject(name)
        },

        afcCurrentState(): string {
            return this.afc.current_state ?? ''
        },

        afcMapList(): string[] {
            const lanes = this.afc.lanes ?? []

            const mapList = []
            for (const laneName of lanes) {
                const lane = this.getAfcLaneObject(laneName)
                if (lane === null) continue

                mapList.push(lane.map)
            }

            return mapList.sort()
        },

        afcExistsSpoolman(): boolean {
            return this.$store.state.server.components.includes('spoolman')
        },

        afcShowFilamentName(): boolean {
            return this.$store.state.gui.view.afc?.showFilamentName ?? false
        },

        afcShowLaneInfinite(): boolean {
            return this.$store.state.gui.view.afc?.showLaneInfinite ?? true
        },

        afcShowUnitIcons(): boolean {
            return this.$store.state.gui.view.afc?.showUnitIcons ?? true
        },

        afcHiddenExtruders(): string[] {
            return this.$store.state.gui.view.afc?.hiddenExtruders ?? []
        },

        afcHiddenUnits(): string[] {
            return this.$store.state.gui.view.afc?.hiddenUnits ?? []
        },

        afcCurrentToolchange() {
            return this.afc.current_toolchange ?? undefined
        },
    },
    methods: {
        getPrinterObject(key: string) {
            const printer = this.$store.state.printer ?? {}
            return printer[key] ?? null
        },

        getPrinterSettings(key: string) {
            const settings = this.$store.state.printer.configfile?.settings ?? {}

            return settings[key.toLowerCase()] ?? null
        },

        getAfcLaneObject(lane: string) {
            const key_stepper = `AFC_stepper ${lane}`
            const key_lane = `AFC_lane ${lane}`
            return this.getPrinterObject(key_stepper) ?? this.getPrinterObject(key_lane) ?? {}
        },

        getAfcLaneSettings(lane: string) {
            const key_stepper = `AFC_stepper ${lane}`
            const key_lane = `AFC_lane ${lane}`
            return this.getPrinterSettings(key_stepper) ?? this.getPrinterSettings(key_lane) ?? {}
        },

        getAfcLaneFilament(laneName: string): { color: string; name: string; type: string; weight: number } {
            const lane = this.getAfcLaneObject(laneName)
            const spoolId = lane?.spool_id ?? 0
            const spools = this.$store.state.server.spoolman?.spools || []
            const spool = spools.find((spool: ServerSpoolmanStateSpool) => spool.id === spoolId) || null

            return {
                color: lane?.color ?? '#000000',
                name: spool?.filament?.name ?? '--',
                type: lane?.material ?? '--',
                weight: lane?.weight ?? 0,
            }
        },

        getAfcExtruderObject(extruder: string) {
            const key_extruder = `AFC_extruder ${extruder}`
            return this.getPrinterObject(key_extruder) ?? {}
        },

        getAfcExtruderSettings(extruder: string) {
            const key = `AFC_extruder ${extruder}`
            return this.getPrinterSettings(key) ?? {}
        },

        getAfcBufferObject(buffer: string) {
            const key_buffer = `AFC_buffer ${buffer}`
            return this.getPrinterObject(key_buffer)
        },

        getAfcHubObject(hub: string) {
            const key = `AFC_hub ${hub}`
            return this.getPrinterObject(key) ?? {}
        },
    },
})
