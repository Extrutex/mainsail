import { defineComponent } from 'vue'
import { ServerPowerStateDevice } from '@/store/server/power/types'

type DateTimeFormatOptions = Intl.DateTimeFormatOptions

export default defineComponent({
    computed: {
        apiUrl(): boolean {
            return this.$store.getters['socket/getUrl']
        },

        hostUrl(): boolean {
            return this.$store.getters['socket/getHostUrl']
        },

        hostPort(): number {
            return parseInt(this.$store.state.socket.port ?? 80)
        },

        instancesDB() {
            return this.$store.state.instancesDB ?? 'moonraker'
        },

        socketIsConnected(): boolean {
            return this.$store.state.socket.isConnected ?? false
        },

        guiIsReady(): boolean {
            return this.$store.state.socket.initializationList.length === 0
        },

        klippyIsConnected(): boolean {
            return this.$store.state.server.klippy_connected ?? false
        },

        klipperState(): string {
            if (!this.klippyIsConnected) return 'disconnected'

            return this.$store.state.server.klippy_state ?? ''
        },

        klipperReadyForGui(): boolean {
            return this.socketIsConnected && this.klipperState === 'ready'
        },

        klipperAppName(): string {
            return this.$store.state.printer.app_name ?? 'Klipper'
        },

        printerIsPrinting(): boolean {
            return this.klipperReadyForGui && ['printing', 'paused'].includes(this.printer_state)
        },

        printerIsPrintingOnly(): boolean {
            return this.klipperReadyForGui && this.printer_state === 'printing'
        },

        printerPowerDevice(): string {
            const deviceName = this.$store.state.gui.uiSettings.powerDeviceName ?? null
            if (deviceName !== null) return deviceName

            const devices = this.$store.getters['server/power/getDevices'] ?? []
            return (
                devices.find((device: ServerPowerStateDevice) => device.device.toLowerCase() === 'printer')?.device ??
                'printer'
            )
        },

        isPrinterPowerOff(): boolean {
            const devices = this.$store.getters['server/power/getDevices'] ?? []
            if (devices.length === 0) return false

            const deviceIndex = devices.findIndex(
                (device: ServerPowerStateDevice) => device.device === this.printerPowerDevice
            )
            // stop if device is not found
            if (deviceIndex === -1) return false

            const device = devices[deviceIndex]
            // Printer is on, if device status is "on" or "error"
            if (device.status !== 'off') return false

            // if klippy is not connected (service shutdown) and device.status === off
            return !this.klippyIsConnected
        },

        loadings(): string[] {
            return this.$store.state.socket.loadings ?? []
        },

        printer_state(): string {
            const printer_state =
                this.$store.state.printer.print_stats?.state ?? this.$store.state.printer.idle_timeout?.state ?? ''
            const timelapse_pause = this.$store.state.printer['gcode_macro TIMELAPSE_TAKE_FRAME']?.is_paused ?? false
            return printer_state === 'paused' && timelapse_pause ? 'printing' : printer_state
        },

        isMobile(): boolean {
            return this.$vuetify.display.mobile
        },

        isTablet(): boolean {
            return this.$vuetify.display.smAndUp && !this.isDesktop && !this.isWidescreen
        },

        isDesktop(): boolean {
            return this.$vuetify.display.lgAndUp && !this.isWidescreen
        },

        isWidescreen(): boolean {
            return this.$vuetify.display.xl || this.$vuetify.display.xxl
        },

        viewport(): string {
            if (this.isMobile) return 'mobile'
            else if (this.isTablet) return 'tablet'
            else if (this.isDesktop) return 'desktop'
            else return 'widescreen'
        },

        isTouchDevice(): boolean {
            // ignore if browser reports maxTouchPoints === 256, can happen on Windows 10
            return 'ontouchstart' in window || (navigator.maxTouchPoints > 0 && navigator.maxTouchPoints !== 256)
        },

        isIOS(): boolean {
            return !!(
                navigator.userAgent.match(/(iPad|iPhone|iPod)/) ||
                (navigator.platform === 'MacIntel' && 'standalone' in navigator)
            )
        },

        moonrakerComponents(): string[] {
            return this.$store.state.server?.components ?? []
        },

        existGcodesRootDirectory(): boolean {
            const roots = this.$store.state.server.registered_directories

            return roots.findIndex((root: string) => root === 'gcodes') >= 0
        },

        spoolManagerUrl(): string | undefined {
            const baseurl = this.$store.state.server.config.config?.spoolman?.server ?? undefined
            if (!baseurl) return undefined

            try {
                const url = new URL(baseurl)
                if (['localhost', '127.0.0.1', '::1'].includes(url.hostname)) {
                    url.hostname = this.$store.state.socket.hostname
                }

                return url.toString()
            } catch {
                window.console.warn('[Spoolman]: SpoolManager URL is invalid:', baseurl)

                return undefined
            }
        },

        formatTimeOptions(): DateTimeFormatOptions {
            const format = this.$store.state.gui.general.timeFormat

            switch (format) {
                case '24hours':
                    return { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }

                case '12hours':
                    return { hour: '2-digit', minute: '2-digit', hourCycle: 'h12' }

                default:
                    return { timeStyle: 'short' }
            }
        },

        formatTimeWithSecondsOptions(): DateTimeFormatOptions {
            const format = this.$store.state.gui.general.timeFormat

            switch (format) {
                case '24hours':
                    return { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }

                case '12hours':
                    return { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h12' }

                default:
                    return { timeStyle: 'short' }
            }
        },

        browserLocale(): string {
            return navigator.language
        },

        hours12Format(): boolean {
            return this.$store.getters['gui/getHours12Format']
        },
    },
    methods: {
        formatDate(value: number | Date, format: string | null = null): string {
            if (format === null) format = this.$store.state.gui.general.dateFormat
            let tmp: Date | null = null

            try {
                tmp = value instanceof Date ? value : new Date(value)
            } catch {
                return 'UNKNOWN'
            }

            if (format === null) return tmp.toLocaleDateString(this.browserLocale, { dateStyle: 'medium' })
            if (format === 'iso') return tmp.toISOString().split('T')[0]
            if (format === 'short') return tmp.toLocaleDateString(this.browserLocale, { dateStyle: 'short' })

            let delimiter = '/'
            if (format.includes('-')) delimiter = '-'
            if (format.includes('.')) delimiter = '.'
            if (format.includes('. ')) delimiter = '. '

            const splits = format.split(delimiter)
            const output: string[] = []

            splits.forEach((part) => {
                // replace all dots is needed for kr-KO, because it ends only with a dot and not with '. '
                part = part.trim().toLowerCase().replaceAll('.', '')

                switch (part) {
                    case 'dd':
                        output.push(tmp?.getDate().toString().padStart(2, '0') ?? '00')
                        break
                    case 'd':
                        output.push(`${tmp?.getDate()}`)
                        break
                    case 'mm':
                        output.push(((tmp?.getMonth() ?? 0) + 1).toString().padStart(2, '0'))
                        break
                    case 'm':
                        output.push(`${(tmp?.getMonth() ?? 0) + 1}`)
                        break
                    case 'yyyy':
                        output.push(`${tmp?.getFullYear()}`)
                        break
                    case 'yy':
                        output.push(`${tmp?.getFullYear().toString().slice(-2)}`)
                        break
                    default:
                        output.push(part)
                }
            })

            if (format.endsWith('.')) return output.join(delimiter) + '.'

            return output.join(delimiter)
        },

        formatTime(value: number | Date, boolSeconds = false): string {
            let tmp

            try {
                tmp = value instanceof Date ? value : new Date(value)
            } catch {
                return 'UNKNOWN'
            }

            if (boolSeconds) return tmp.toLocaleTimeString(this.browserLocale, this.formatTimeWithSecondsOptions)

            return tmp.toLocaleTimeString(this.browserLocale, this.formatTimeOptions)
        },

        formatDateTime(value: number, boolSeconds = false): string {
            const date = this.formatDate(value)
            const time = this.formatTime(value, boolSeconds)

            return `${date} ${time}`
        },
    },
})
