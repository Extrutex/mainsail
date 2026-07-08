<template>
    <div v-if="bigThumbnailUrl" class="d-flex align-center justify-center min-height-200">
        <v-img
            :src="bigThumbnailUrl"
            :max-width="maxThumbnailWidth"
            class="d-inline-block"
            :style="bigThumbnailStyle" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { FileStateGcodefile } from '@/store/files/types'
import { defaultBigThumbnailBackground, thumbnailBigMin } from '@/store/variables'
import { escapePath } from '@/plugins/helpers'

export default defineComponent({
    name: 'StartPrintDialogThumbnail',
    mixins: [BaseMixin],
    props: {
        file: { type: Object as PropType<FileStateGcodefile>, required: true },
        currentPath: { type: String, required: true, default: '' },
    },
    computed: {
        bigThumbnailBackground() {
            return this.$store.state.gui.uiSettings.bigThumbnailBackground ?? defaultBigThumbnailBackground
        },
        bigThumbnailStyle() {
            if (defaultBigThumbnailBackground.toLowerCase() === this.bigThumbnailBackground.toLowerCase()) {
                return {}
            }

            return { backgroundColor: this.bigThumbnailBackground }
        },
        thumbnails() {
            return this.file.thumbnails ?? []
        },
        bigThumbnail() {
            return this.thumbnails.find((thumbnail) => thumbnail.width >= thumbnailBigMin)
        },
        currentPathWithoutSlash() {
            if (this.currentPath.startsWith('/')) return this.currentPath.substring(1)

            return this.currentPath
        },
        fileTimestamp() {
            return typeof this.file.modified.getTime === 'function' ? this.file.modified.getTime() : 0
        },
        bigThumbnailUrl() {
            if (this.bigThumbnail === undefined || !('relative_path' in this.bigThumbnail)) return null
            const baseArray = [this.apiUrl, 'server/files/gcodes']
            if (this.currentPathWithoutSlash) baseArray.push(escapePath(this.currentPathWithoutSlash))
            baseArray.push(escapePath(this.bigThumbnail.relative_path))
            const baseUrl = baseArray.join('/')

            return `${baseUrl}?timestamp=${this.fileTimestamp}`
        },
        maxThumbnailWidth() {
            return this.bigThumbnail?.width ?? 400
        },
    },
})
</script>

<style scoped>
.min-height-200 {
    min-height: 200px;
}
</style>
