<template>
    <v-icon v-if="item.isDirectory">{{ mdiFolder }}</v-icon>
    <v-tooltip
        v-else-if="smallThumbnailUrl"
        top
        content-class="tooltip__content-opacity1"
        :color="bigThumbnailTooltipColor"
        :disabled="!bigThumbnailUrl">
        <template #activator="{ props }">
            <vue-load-image>
                <template #image><img :src="smallThumbnailUrl" width="32" height="32" :alt="item.filename" v-bind="props" /></template>
                <template #preloader><div>
                    <v-progress-circular indeterminate color="primary" />
                </div></template>
                <template #error><div>
                    <v-icon>{{ mdiFile }}</v-icon>
                </div></template>
            </vue-load-image>
        </template>
        <span>
            <img :src="bigThumbnailUrl" width="250" :alt="item.filename" />
        </span>
    </v-tooltip>
    <v-icon v-else>{{ mdiFile }}</v-icon>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { FileStateGcodefile } from '@/store/files/types'
import { mdiFile, mdiFolder } from '@mdi/js'
import { defaultBigThumbnailBackground, thumbnailBigMin, thumbnailSmallMax, thumbnailSmallMin } from '@/store/variables'
import { escapePath } from '@/plugins/helpers'

export default defineComponent({
    name: 'GcodefilesThumbnail',
    mixins: [BaseMixin],
    props: {
        item: { type: Object },
    },
    data() {
        return {
            mdiFile: mdiFile,
            mdiFolder: mdiFolder,
        }
    },
    computed: {
        bigThumbnailBackground() {
            return this.$store.state.gui.uiSettings.bigThumbnailBackground ?? defaultBigThumbnailBackground
        },
        bigThumbnailTooltipColor() {
            if (defaultBigThumbnailBackground.toLowerCase() === this.bigThumbnailBackground.toLowerCase()) {
                return undefined
            }

            return this.bigThumbnailBackground
        },
        fileTimestamp() {
            return typeof this.item.modified.getTime === 'function' ? this.item.modified.getTime() : 0
        },
        thumbnails() {
            return this.item.thumbnails ?? []
        },
        subdirectory() {
            if (!this.item.full_filename.includes('/')) return null

            return escapePath(this.item.full_filename.substring(0, this.item.full_filename.lastIndexOf('/')))
        },
        smallThumbnail() {
            return this.thumbnails.find(
                (thumbnail) =>
                    thumbnail.width >= thumbnailSmallMin &&
                    thumbnail.width <= thumbnailSmallMax &&
                    thumbnail.height >= thumbnailSmallMin &&
                    thumbnail.height <= thumbnailSmallMax
            )
        },
        smallThumbnailUrl() {
            if (this.smallThumbnail === undefined || !('relative_path' in this.smallThumbnail)) return null

            return this.buildUrl(this.smallThumbnail.relative_path)
        },
        bigThumbnail() {
            return this.thumbnails.find((thumbnail) => thumbnail.width >= thumbnailBigMin)
        },
        bigThumbnailUrl() {
            if (this.bigThumbnail === undefined || !('relative_path' in this.bigThumbnail)) return null

            return this.buildUrl(this.bigThumbnail.relative_path)
        },
    },
    methods: {
        buildUrl(relativePath: string) {
            const baseArray = [this.apiUrl, 'server/files/gcodes']
            if (this.subdirectory !== null) {
                let subdirectory = this.subdirectory
                if (subdirectory.startsWith('/')) subdirectory = subdirectory.substring(1)

                baseArray.push(subdirectory)
            }
            baseArray.push(escapePath(relativePath))
            const baseUrl = baseArray.join('/')

            return `${baseUrl}?timestamp=${this.fileTimestamp}`
        },
    },
})
</script>
