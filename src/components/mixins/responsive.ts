import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import BaseMixin from './base'
import throttle from 'lodash.throttle'

export type ResponsiveElement = {
    is: {
        [key: string]: boolean
    }
}

export default defineComponent({
    mixins: [BaseMixin],
    props: {
        breakpoints: {
            type: Object as PropType<{ [key: string]: (el: DOMRect) => boolean }>,
            default: undefined,
        },
    },
    data() {
        return {
            observer: undefined as ResizeObserver | undefined,
            el: {
                is: {},
            } as ResponsiveElement,
        }
    },
    mounted() {
        if (this.breakpoints) {
            this.$nextTick(() => {
                this.observer = new ResizeObserver(throttle(this.onResize, 50))
                if (this.$el instanceof Element) {
                    this.observer.observe(this.$el)
                }
            })
        }
    },
    beforeUnmount() {
        if (this.$el instanceof Element) {
            this.observer?.unobserve(this.$el)
        }
    },
    methods: {
        onResize(entries: ResizeObserverEntry[]) {
            if (entries[0].contentRect.height === 0 && entries[0].contentRect.width === 0) {
                return
            }

            const cr = entries[0].contentRect
            const conds = this.breakpoints ?? {}
            for (const breakpoint in conds) {
                this.el.is[breakpoint] = conds[breakpoint](cr)
            }
        },
    },
})
