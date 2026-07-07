import 'regenerator-runtime' // async polyfill used by the gcodeviewer
import 'resize-observer-polyfill' // polyfill needed by the responsive class detection
import { createApp } from 'vue'
import App from '@/App.vue'
import vuetify from '@/plugins/vuetify'
import i18n, { setAndLoadLocale } from '@/plugins/i18n'
import store from '@/store'
import router from '@/plugins/router'
import { WebSocketPlugin } from '@/plugins/webSocketClient'
// local replacement for the vue-observe-visibility directive
import { observeVisibility } from './directives/observe-visibility'
// local replacement for the vue-load-image component
import VueLoadImage from '@/components/ui/LoadImage.vue'
//vue-toast-notifications
import ToastPlugin from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'
//overlayscrollbars
import 'overlayscrollbars/overlayscrollbars.css'
// Directives
import { longpress } from './directives/longpress'
import { responsiveClass } from './directives/responsive-class'

// Echarts
import ECharts from 'vue-echarts'
import { use } from 'echarts/core'

// import ECharts modules manually to reduce bundle size
import { SVGRenderer } from 'echarts/renderers'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { DatasetComponent, GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'

import { defaultMode } from './store/variables'

use([SVGRenderer, LineChart, BarChart, LegendComponent, PieChart, DatasetComponent, GridComponent, TooltipComponent])

const app = createApp(App)

app.use(store)
app.use(router)
app.use(i18n)
app.use(vuetify)

app.use(ToastPlugin, {
    duration: 3000,
})

app.directive('observe-visibility', observeVisibility)
app.directive('longpress', longpress)
app.directive('responsive-class', responsiveClass)

app.component('VueLoadImage', VueLoadImage)
app.component('EChart', ECharts)

const initLoad = async () => {
    try {
        // get base url. by default, it is '/'
        const base = import.meta.env.BASE_URL ?? '/'

        //load config.json
        const res = await fetch(`${base}config.json`)
        const file = (await res.json()) as Record<string, unknown>

        window.console.debug('Loaded config.json')

        await store.dispatch('importConfigJson', file)
        const locale = (file.defaultLocale ?? 'en') as string
        await setAndLoadLocale(locale)

        // Handle mode outside store init and before vue mount for consistency in dialog
        const mode = file.defaultMode ?? defaultMode
        vuetify.theme.global.name.value = mode !== 'light' ? 'dark' : 'light'
    } catch (e) {
        window.console.error('Failed to load config.json')
        window.console.error(e)
    }

    const url = store.getters['socket/getWebsocketUrl']
    app.use(WebSocketPlugin, { url, store })
    if (store?.state?.instancesDB === 'moonraker') app.config.globalProperties.$socket.connect()
}

initLoad().then(() => app.mount('#app'))
