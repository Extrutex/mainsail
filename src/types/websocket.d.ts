import { WebSocketClient } from '@/plugins/webSocketClient'

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $socket: WebSocketClient
    }
}

export {}
