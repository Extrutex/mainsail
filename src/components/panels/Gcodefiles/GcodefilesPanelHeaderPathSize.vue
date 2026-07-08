<template>
    <v-row>
        <v-col cols="12" class="py-2 d-flex align-center">
            <span>
                <b class="mr-1">{{ $t('Files.CurrentPath') }}:</b>
                <path-navigation
                    :path="currentPath"
                    :base-directory-label="'/gcodes'"
                    :on-segment-click="clickPathNavGoToDirectory" />
            </span>
            <v-spacer />
            <v-tooltip v-if="disk_usage !== null" top>
                <template #activator="{ props }">
                    <span v-bind="props">
                        <b>{{ $t('Files.FreeDisk') }}:</b>
                        {{ formatFilesize(disk_usage.free) }}
                    </span>
                </template>
                <span>
                    {{ $t('Files.Used') }}: {{ formatFilesize(disk_usage.used) }}
                    <br />
                    {{ $t('Files.Free') }}: {{ formatFilesize(disk_usage.free) }}
                    <br />
                    {{ $t('Files.Total') }}: {{ formatFilesize(disk_usage.total) }}
                </span>
            </v-tooltip>
        </v-col>
    </v-row>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import GcodefilesMixin from '@/components/mixins/gcodefiles'
import { formatFilesize } from '@/plugins/helpers'

export default defineComponent({
    name: 'GcodefilesPanelHeaderPathSize',
    mixins: [BaseMixin, GcodefilesMixin],
    data() {
        return {
            formatFilesize: formatFilesize,
        }
    },
    computed: {
        directory() {
            return this.$store.getters['files/getDirectory']('gcodes' + this.currentPath)
        },
        disk_usage() {
            return this.directory?.disk_usage ?? { used: 0, free: 0, total: 0 }
        },
    },
    methods: {
        clickPathNavGoToDirectory(segment: { location: string }) {
            this.currentPath = segment.location
        },
    },
})
</script>

<style scoped></style>
