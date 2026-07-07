<template>
    <viewer></viewer>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Viewer from '@/components/gcodeviewer/Viewer.vue'
import BaseMixin from '@/components/mixins/base'

export default defineComponent({
    name: 'PageGCodeViewer',
    components: { Viewer },
    mixins: [BaseMixin],
})
</script>
<style scoped></style>
