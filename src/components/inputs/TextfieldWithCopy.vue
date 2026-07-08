<template>
    <v-text-field
        :class="cssClassName"
        readonly
        density="compact"
        variant="outlined"
        hide-details
        :label="label"
        :model-value="value">
        <template #append-inner>
            <v-icon @click="copy">{{ mdiContentCopy }}</v-icon>
            <v-tooltip
                v-model="isShowTooltip"
                open-on-click
                :open-on-hover="false"
                :attach="'.' + cssClassName"
                :target="[50, 0]">
                <span>{{ $t('App.TextfieldWithCopy.Copied') }}</span>
            </v-tooltip>
        </template>
    </v-text-field>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { mdiContentCopy } from '@mdi/js'
import { copyToClipboard } from '@/plugins/helpers'
import { v4 as uuidv4 } from 'uuid'

export default defineComponent({
    name: 'TextfieldWithCopy',
    mixins: [BaseMixin],
    props: {
        label: { type: String, required: true },
        value: { type: String, required: true },
    },
    data() {
        return {
            mdiContentCopy: mdiContentCopy,

            isShowTooltip: false,
            cssClassName: '',
        }
    },
    mounted() {
        this.cssClassName = `textfield-with-copy-${uuidv4()}`
    },
    methods: {
        copy() {
            copyToClipboard(this.value)

            this.isShowTooltip = true
            setTimeout(() => (this.isShowTooltip = false), 2000)
        },
    },
})
</script>
<style scoped>
:deep(.v-overlay__content) {
    top: 4px !important;
    left: auto !important;
    right: 46px;
}
</style>
