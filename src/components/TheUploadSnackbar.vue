<template>
    <v-snackbar v-if="show" :timeout="-1" :value="true" fixed right bottom>
        <span v-if="maxNumber > 1" class="mr-1">({{ currentNumber }}/{{ maxNumber }})</span>
        <strong>{{ $t('Editor.Uploading') + ' ' + filename }}</strong>
        <br />
        {{ percent }} % @ {{ speed }}/s
        <br />
        <v-progress-linear class="mt-2" :value="percent"></v-progress-linear>
        <template #action>
            <v-btn color="red" variant="text" v-bind="props" style="min-width: auto" @click="cancelUpload">
                <v-icon class="0">{{ mdiClose }}</v-icon>
            </v-btn>
        </template>
    </v-snackbar>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { mdiClose } from '@mdi/js'
import { formatFilesize } from '@/plugins/helpers'

export default defineComponent({
    name: 'TheUploadSnackbar',
    components: {},
    mixins: [BaseMixin],
    data() {
        return {
            mdiClose: mdiClose,
            formatFilesize: formatFilesize,
        }
    },
    computed: {
        show() {
            return this.$store.state.files.upload.show ?? false
        },
        cancelTokenSource() {
            return this.$store.state.files.upload.cancelTokenSource
        },
        filename() {
            return this.$store.state.files.upload.filename ?? ''
        },
        currentNumber() {
            return this.$store.state.files.upload.currentNumber ?? 0
        },
        maxNumber() {
            return this.$store.state.files.upload.maxNumber ?? 0
        },
        speed() {
            return formatFilesize(Math.round(this.$store.state.files.upload.speed ?? 0))
        },
        percent() {
            return Math.round(this.$store.state.files.upload.percent ?? 0)
        },
    },
    watch: {
        show(newVal: boolean) {
            const body = document.getElementsByTagName('body')[0]

            if (newVal) body.classList.add('fullscreenUpload--active')
            else body.classList.remove('fullscreenUpload--active')
        },
    },
    methods: {
        cancelUpload() {
            this.cancelTokenSource?.cancel()
            this.$store.dispatch('files/uploadSetShow', false)
            this.$store.dispatch('socket/removeLoading', { name: 'gcodeUpload' })
            this.$store.dispatch('socket/removeLoading', { name: 'configFileUpload' })
        },
    },
})
</script>
