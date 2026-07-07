import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import 'vuetify/styles'

export default createVuetify({
    components,
    directives,
    theme: {
        defaultTheme: 'dark',
        variations: {
            colors: ['primary'],
            lighten: 1,
            darken: 2,
        },
        themes: {
            dark: {
                dark: true,
                colors: {
                    primary: '#2196f3',
                },
            },
            light: {
                dark: false,
                colors: {
                    primary: '#2196f3',
                },
            },
        },
    },
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: { mdi },
    },
    display: {
        mobileBreakpoint: 768,
    },
})
