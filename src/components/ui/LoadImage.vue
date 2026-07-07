<template>
    <div class="vue-load-image">
        <div v-show="status === 'loaded'" ref="imageWrapper" class="vue-load-image-wrapper">
            <slot name="image" />
        </div>
        <slot v-if="status === 'loading'" name="preloader" />
        <slot v-if="status === 'error'" name="error" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

/**
 * Drop-in replacement for the vue-load-image package (Vue 2 only).
 * Shows the preloader slot while the image in the image slot is loading
 * and the error slot when loading fails.
 */
export default defineComponent({
    name: 'VueLoadImage',
    data() {
        return {
            status: 'loading' as 'loading' | 'loaded' | 'error',
        }
    },
    mounted() {
        const img = (this.$refs.imageWrapper as HTMLElement | undefined)?.querySelector('img')
        if (!img) {
            this.status = 'loaded'
            return
        }

        if (img.complete && img.naturalWidth > 0) {
            this.status = 'loaded'
            return
        }

        img.addEventListener('load', () => (this.status = 'loaded'), { once: true })
        img.addEventListener('error', () => (this.status = 'error'), { once: true })
    },
})
</script>

<style scoped>
.vue-load-image-wrapper {
    display: contents;
}
</style>
