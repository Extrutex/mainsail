<template>
    <div ref="container" class="crosshair-container">
        <div class="line horizontal" :style="styleLines" />
        <div class="line vertical" :style="styleLines" />
        <div class="circle" :style="styleCircle" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { debounce } from '@/plugins/helpers'
import BaseMixin from '@/components/mixins/base'

export default defineComponent({
    name: 'WebcamWrapper',
    mixins: [BaseMixin],
    props: {
        webcam: { type: Object, required: true },
    },
    data() {
        return {
            clientHeight: 0,
            resizeObserver: null as ResizeObserver | null,
        }
    },
    computed: {
        container(): HTMLDivElement {
            return this.$refs.container as HTMLDivElement
        },
        color() {
            return this.webcam.extra_data?.nozzleCrosshairColor ?? '#ff0000'
        },
        styleLines() {
            return {
                backgroundColor: this.color,
            }
        },
        styleCircle() {
            const nozzleCrosshairSize = this.webcam.extra_data?.nozzleCrosshairSize ?? 0.1
            const size = this.clientHeight * nozzleCrosshairSize

            return {
                borderColor: this.color,
                width: `${size}px`,
                height: `${size}px`,
                marginLeft: `-${size / 2}px`,
                marginTop: `-${size / 2}px`,
            }
        },
    },
    mounted() {
        this.handleResize()

        this.resizeObserver = new ResizeObserver(() => this.handleResize())
        this.resizeObserver.observe(this.container)
    },
    beforeUnmount() {
        this.resizeObserver?.disconnect()
    },
    methods: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handleResize: debounce(function (this: any) {
            this.$nextTick(() => {
                this.clientHeight = this.container.clientHeight
            })
        }, 200),
    },
})
</script>

<style scoped>
.crosshair-container {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
}

.line {
    position: absolute;
    background-color: #ff0000;
}

.horizontal {
    height: 1px;
    top: 50%;
    left: 0;
    right: 0;
}

.vertical {
    left: 50%;
    top: 0;
    bottom: 0;
    width: 1px;
}

.circle {
    position: absolute;
    border: 1px solid #ff0000;
    border-radius: 50%;
    box-sizing: border-box;
    top: 50%;
    left: 50%;
}
</style>
