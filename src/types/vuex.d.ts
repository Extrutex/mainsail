import { Store } from 'vuex'

declare module 'vue' {
    interface ComponentCustomProperties {
        // Vuex 3 typed $store as Store<any>; keep that behavior for now.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        $store: Store<any>
    }
}

export {}
