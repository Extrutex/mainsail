<template>
    <v-alert v-if="bypassState" type="warning" class="mt-3" density="compact" text>
        {{ $t('Panels.AfcPanel.BypassActive') }}
    </v-alert>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import AfcMixin from '@/components/mixins/afc'

export default defineComponent({
    name: 'AfcPanelBypass',
    mixins: [BaseMixin, AfcMixin],
    computed: {
        bypassState() {
            return this.afc.bypass_state ?? false
        },
    },
})
</script>
