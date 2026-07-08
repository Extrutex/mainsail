import { WebSocketClient } from '@/plugins/webSocketClient'

declare module 'vue' {
    interface ComponentCustomProperties {
        $socket: WebSocketClient
    }
}

export {}
