<template>
    <td class="text-no-wrap">{{ values.join(', ') }}</td>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'

export default defineComponent({
    name: 'GcodefilesPanelTableRowFileMetadataFilamentStrings',
    mixins: [BaseMixin],
    props: {
        item: { type: Object, required: true },
        column: { type: String, required: true },
    },
    computed: {
        value() {
            return this.item[this.column] ?? null
        },
        values() {
            return (this.value ?? '').replace(/"/g, '').split(';')
        },
    },
})
</script>
