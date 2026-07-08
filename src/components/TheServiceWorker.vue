<template>
    <v-dialog v-model="showDialog" persistent max-width="400" class="mx-0">
        <panel
            :title="$t('App.TheServiceWorker.TitleNeedUpdate')"
            card-class="service-worker-dialog"
            :margin-bottom="false">
            <v-card-text>
                <p>{{ $t('App.TheServiceWorker.DescriptionNeedUpdate') }}</p>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" color="primary" @click="update">{{ $t('App.TheServiceWorker.Update') }}</v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'

export default defineComponent({
    name: 'TheServiceWorker',
    mixins: [BaseMixin],
    data() {
        return {
            showDialog: false,
            updateSW: null as ((reloadPage?: boolean | undefined) => Promise<void>) | null,
        }
    },
    async mounted() {
        const { registerSW } = await import('virtual:pwa-register')
        this.updateSW = registerSW({
            immediate: true,
            onOfflineReady: this.onOfflineReady,
            onNeedRefresh: this.onNeedRefresh,
            onRegistered: this.onRegistered,
            onRegisterError: this.onRegisterError,
        })
    },
    methods: {
        onOfflineReady() {
            window.console.info('PWA is offline ready')
        },
        onNeedRefresh() {
            window.console.warn('PWA needs to refresh')
            this.showDialog = true
        },
        onRegistered() {
            window.console.debug('PWA is registered')
        },
        onRegisterError(error: Error) {
            window.console.error('PWA registration error:', error)
        },
        update() {
            this.updateSW?.(true)
            this.showDialog = false
        },
    },
})
</script>
