type EventHandler = (payload?: unknown) => void

class EventBusClass {
    private handlers: Record<string, EventHandler[]> = {}

    on(event: string, handler: EventHandler): void {
        if (!(event in this.handlers)) this.handlers[event] = []
        this.handlers[event].push(handler)
    }

    off(event: string, handler: EventHandler): void {
        const list = this.handlers[event] ?? []
        const index = list.indexOf(handler)
        if (index !== -1) list.splice(index, 1)
    }

    emit(event: string, payload?: unknown): void {
        for (const handler of this.handlers[event] ?? []) handler(payload)
    }

    // Vue 2 instance API compatibility
    $on(event: string, handler: EventHandler): void {
        this.on(event, handler)
    }

    $off(event: string, handler: EventHandler): void {
        this.off(event, handler)
    }

    $emit(event: string, payload?: unknown): void {
        this.emit(event, payload)
    }
}

export const EventBus = new EventBusClass()

export const CLOSE_CONTEXT_MENU = 'close-context-menu'
