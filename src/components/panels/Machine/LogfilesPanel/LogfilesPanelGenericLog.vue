<template>
    <v-col v-if="exists" :class="classes">
        <v-btn :href="href" block class="primary--text" @click="downloadLog">
            <v-icon class="mr-2">{{ mdiDownload }}</v-icon>
            {{ name }}
        </v-btn>
    </v-col>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { FileStateFile } from '@/store/files/types'
import { mdiDownload } from '@mdi/js'

export default defineComponent({
    name: 'LogfilesPanel',
    components: {},
    mixins: [BaseMixin],
    props: {
        name: { type: String, required: true },
    },
    data() {
        return {
            mdiDownload: mdiDownload,
        }
    },
    computed: {
        logfiles() {
            return this.$store.getters['files/getDirectory']('logs')?.childrens ?? []
        },
        filename() {
            return this.name + '.log'
        },
        exists(): boolean {
            if (['klippy', 'moonraker'].includes(this.name)) return true

            return this.logfiles.findIndex((log: FileStateFile) => log.filename === this.filename) !== -1
        },
        href() {
            let path = '/server/files/logs/'
            if (['klippy', 'moonraker'].includes(this.name)) path = '/server/files/'

            return this.apiUrl + path + this.filename
        },
        classes() {
            const output = ['col-12', 'pt-0']

            if (this.klipperState !== 'ready') {
                output.push('col-md-6')
                output.push('mt-md-3')
            } else {
                output.push('col-md-12')
            }

            return output
        },
    },
    methods: {
        downloadLog(event: MouseEvent) {
            event.preventDefault()

            const target = event.target as HTMLElement | null
            const href = target?.closest('a')?.href ?? ''
            if (href) window.open(href)
        },
    },
})
</script>
