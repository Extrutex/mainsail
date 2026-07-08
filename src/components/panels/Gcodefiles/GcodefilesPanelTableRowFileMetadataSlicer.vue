<template>
    <td class="text-no-wrap">
        {{ item.slicer }}
        <template v-if="item.slicer_version">
            <br />
            <small>{{ item.slicer_version }}</small>
        </template>
    </td>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'

export default defineComponent({
    name: 'GcodefilesPanelTableRowFileMetadataSlicer',
    mixins: [BaseMixin],
    props: {
        item: { type: Object, required: true },
    },
})
</script>
