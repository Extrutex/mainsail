<template>
    <div>
        <v-snackbar v-model="boolShowDialogRunning" :timeout="-1" :value="true" fixed right bottom>
            <div>{{ $t('Timelapse.TimelapseRendering') }}...</div>
            <v-progress-linear v-if="progress > 0" class="mt-2" :value="progress" indeterminate />
            <v-progress-linear v-if="progress === 0" class="mt-2" indeterminate />
        </v-snackbar>
        <v-snackbar v-model="boolShowDialogSuccess" :timeout="5000" :value="true" fixed right bottom>
            <div>
                {{ $t('Timelapse.TimelapseRenderingSuccessful') }}
                <br />
                <strong>{{ filename }}</strong>
            </div>
        </v-snackbar>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'

export default defineComponent({
    name: 'TheTimelapseRenderingSnackbar',
    components: {},
    mixins: [BaseMixin],
    computed: {
        boolShowDialogRunning() {
            return this.status === 'running'
        },
        boolShowDialogSuccess: {
            get() {
                return this.status === 'success'
            },
            setboolShowDialogSuccess(newVal) {
                if (!newVal) this.$store.dispatch('server/timelapse/resetSnackbar')
            },
        },
        status() {
            return this.$store.state.server.timelapse.rendering.status ?? ''
        },
        progress() {
            return this.$store.state.server.timelapse.rendering.progress ?? ''
        },
        filename() {
            return this.$store.state.server.timelapse.rendering.filename ?? ''
        },
    },
})
</script>
