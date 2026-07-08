<template>
    <v-row>
        <v-col class="py-1">
            <label class="mt-1 d-inline-block">
                <span v-if="item.type === 'endstop'" class="mr-2">{{ $t('Machine.EndstopPanel.Endstop') }}</span>
                <b>{{ name }}</b>
            </label>
            <v-chip size="small" label class="float-right" :color="chipColor" text-color="white">{{ value }}</v-chip>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { convertName } from '@/plugins/helpers'
import type { EndstopItem } from '@/store/printer/types'

export default defineComponent({
    name: 'EndstopPanelItem',
    components: { Panel },
    mixins: [BaseMixin],
    props: {
        item: { type: Object },
    },
    computed: {
        name() {
            if (this.item.type === 'endstop') return this.item.name.toUpperCase()

            return convertName(this.item.name)
        },
        chipColor() {
            return this.item.value === 'open' ? 'green' : 'red'
        },
        value() {
            return this.item.value === 'open'
                ? this.$t('Machine.EndstopPanel.open')
                : this.$t('Machine.EndstopPanel.TRIGGERED')
        },
    },
})
</script>
