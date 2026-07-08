import { defineComponent } from 'vue'

export default defineComponent({
    computed: {
        themeName(): string {
            return this.$store.getters['gui/theme']
        },

        theme() {
            return this.$store.getters['gui/getTheme']
        },

        themeMode(): string {
            return this.$store.state.gui.uiSettings.mode ?? 'dark'
        },

        fgColorHi(): string {
            return this.fgColor(0.8)
        },

        fgColorMid(): string {
            return this.fgColor(0.5)
        },

        fgColorLow(): string {
            return this.fgColor(0.2)
        },

        fgColorFaint(): string {
            return this.fgColor(0.1)
        },

        machineButtonCol(): string {
            return this.$vuetify.theme.current.dark ? 'grey darken-3' : 'grey lighten-1'
        },

        draggableBgStyle(): string {
            const col = this.$vuetify.theme.current.dark ? '#282828' : '#e7e7e7'
            return `background-color: ${col}`
        },

        progressBarColor(): string {
            return this.$vuetify.theme.current.dark ? 'white' : 'primary'
        },

        sidebarBgImage(): string {
            if (this.theme.sidebarBackground?.show) {
                if (this.theme.sidebarBackground?.light && this.themeMode === 'light')
                    return `/img/themes/sidebarBackground-${this.themeName}-light.png`

                return `/img/themes/sidebarBackground-${this.themeName}.png`
            }

            return this.$vuetify.theme.current.dark
                ? '/img/sidebar-background.svg'
                : '/img/sidebar-background-light.svg'
        },

        sidebarLogo(): string {
            const url = this.$store.getters['files/getSidebarLogo']
            if (url !== '' || this.themeName === 'mainsail') return url

            // if no theme is set, return empty string to load the default logo
            if (!(this.theme.logo?.show ?? false)) return ''

            // return light logo if theme is light and sidebarLogo is set to both
            if (this.theme.logo?.light && this.themeMode === 'light')
                return `/img/themes/sidebarLogo-${this.themeName}-light.svg`

            // return dark/generic theme logo
            return `/img/themes/sidebarLogo-${this.themeName}.svg`
        },

        mainBgImage(): string | null {
            const url = this.$store.getters['files/getMainBackground']
            if (url || this.themeName === 'mainsail') return url

            if (!this.theme.mainBackground?.show) return null

            if (this.theme.mainBackground?.light && this.themeMode === 'light')
                return `/img/themes/mainBackground-${this.themeName}-light.png`

            return `/img/themes/mainBackground-${this.themeName}.png`
        },

        themeCss(): string | null {
            if (!(this.theme.css ?? false)) return null

            return `/css/themes/${this.themeName}.css`
        },
    },
    methods: {
        fgColor(alpha: number = 1, dark: boolean = this.$vuetify.theme.current.dark): string {
            const base = dark ? 255 : 0
            return `rgba(${base}, ${base}, ${base}, ${alpha})`
        },

        bgColor(alpha: number = 1): string {
            return this.fgColor(alpha, !this.$vuetify.theme.current.dark)
        },
    },
})
