<template>
    <v-card-text class="py-3 bt-1">
        <settings-row :title="$t('Dialogs.StartPrint.Timelapse')" :dense="true">
            <v-switch v-model="timelapseEnabled" hide-details class="mt-0" />
        </settings-row>
    </v-card-text>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'

export default defineComponent({
    name: 'StartPrintDialogTimelapse',
    mixins: [BaseMixin],
    computed: {
        timelapseEnabled: {
            get(): boolean {
                return this.$store.state.server.timelapse?.settings?.enabled ?? false
            },
            set(newVal: boolean) {
                this.$socket.emit(
                    'machine.timelapse.post_settings',
                    { enabled: newVal },
                    { action: 'server/timelapse/initSettings' }
                )
            },
        },
    },
})
</script>
