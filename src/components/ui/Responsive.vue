<template>
    <div>
        <div v-if="!noHide && !init" style="visibility: hidden">
            <slot :el="el"></slot>
        </div>

        <slot :el="el"></slot>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ResponsiveMixin from '@/components/mixins/responsive'

export default defineComponent({
    name: 'Responsive',
    mixins: [ResponsiveMixin],
    props: {
        noHide: { type: Boolean, default: false },
    },
    data() {
        return {
            init: false,
        }
    },
    mounted() {
        this.init = true
    },
})
</script>
