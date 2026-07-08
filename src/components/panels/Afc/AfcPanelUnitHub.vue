<template>
    <div class="ml-3">
        <v-tooltip top>
            <template #activator="{ props }">
                <span v-bind="props" class="sensor-status rounded-circle d-inline-block mr-2" :class="sensorClass" />
            </template>
            <span>{{ sensorOutput }}</span>
        </v-tooltip>
        <span class="text-body-1">{{ $t('Panels.AfcPanel.Hub') }}</span>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import AfcMixin from '@/components/mixins/afc'

export default defineComponent({
    name: 'AfcPanelUnitHub',
    mixins: [BaseMixin, AfcMixin],
    props: {
        name: { type: String, required: true },
    },
    computed: {
        hub() {
            return this.getAfcHubObject(this.name)
        },
        sensorStatus() {
            return this.hub.state ?? false
        },
        sensorOutput() {
            const status = this.sensorStatus ? this.$t('Panels.AfcPanel.Detected') : this.$t('Panels.AfcPanel.Empty')

            return `${this.name} ${this.$t('Panels.AfcPanel.HubLoad')} - ${status}`
        },
        sensorClass() {
            return {
                success: this.sensorStatus,
                error: !this.sensorStatus,
            }
        },
    },
})
</script>

<style scoped>
.sensor-status {
    width: 10px;
    height: 10px;
}
</style>
