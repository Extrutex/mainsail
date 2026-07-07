import type { Directive } from 'vue'

type VisibilityCallback = (isVisible: boolean, entry: IntersectionObserverEntry) => void

const observers = new WeakMap<HTMLElement, IntersectionObserver>()

/**
 * Drop-in replacement for the vue-observe-visibility directive (Vue 2).
 * Usage: v-observe-visibility="callback" — callback(isVisible, entry).
 */
export const observeVisibility: Directive<HTMLElement, VisibilityCallback> = {
    mounted(el, binding) {
        if (typeof binding.value !== 'function') return

        const observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                binding.value(entry.isIntersecting, entry)
            }
        })
        observer.observe(el)
        observers.set(el, observer)
    },
    unmounted(el) {
        observers.get(el)?.disconnect()
        observers.delete(el)
    },
}
