<template>
    <settings-row :title="outputName" :sub-title="subTitle">
        <v-chip v-if="!(is_base ?? false)" label size="small">
            <v-icon v-if="sign === 'CCW'" size="small" start>{{ mdiRotateLeft }}</v-icon>
            <v-icon v-if="sign === 'CW'" size="small" start>{{ mdiRotateRight }}</v-icon>
            {{ adjust }}
        </v-chip>
        <v-chip v-else label size="small">{{ $t('ScrewsTiltAdjust.Base') }}</v-chip>
    </settings-row>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { mdiRotateLeft, mdiRotateRight, mdiCloseThick } from '@mdi/js'
import ControlMixin from '@/components/mixins/control'

interface ScrewsTiltAdjustResult {
    z: number
    sign?: string
    adjust?: string
    is_base: boolean
}

export default defineComponent({
    name: 'TheScrewsTiltAdjustDialogEntry',
    components: { SettingsRow },
    mixins: [BaseMixin, ControlMixin],
    props: {
        name: { type: String, required: true },
        result: { type: Object as PropType<ScrewsTiltAdjustResult>, required: true },
    },
    data() {
        return {
            mdiRotateLeft: mdiRotateLeft,
            mdiCloseThick: mdiCloseThick,
            mdiRotateRight: mdiRotateRight,
        }
    },
    computed: {
        settings() {
            return this.$store.state.printer.configfile?.settings?.screws_tilt_adjust ?? {}
        },
        outputName() {
            return this.settings[this.name + '_name'] ?? 'Unknown'
        },
        coordinates() {
            return this.settings[this.name] ?? [0, 0]
        },
        x() {
            return this.coordinates[0] ?? 0
        },
        y() {
            return this.coordinates[1] ?? 0
        },
        z() {
            return this.result.z.toFixed(3)
        },
        subTitle() {
            return `(X: ${this.x}, Y: ${this.y}, Z: ${this.z})`
        },
        sign() {
            return this.result.sign ?? ''
        },
        adjust() {
            return this.result.adjust ?? '00:00'
        },
        is_base() {
            return this.result.is_base ?? false
        },
    },
})
</script>
