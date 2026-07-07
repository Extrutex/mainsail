<style scoped>
.btn-collapsible > * {
    will-change: transform;
    transition: transform 500ms;
}

.icon-rotate-n90 {
    transform: rotate(-90deg);
}
</style>

<template>
    <div>
        <div class="px-3 d-flex align-center">
            <v-btn class="px-0 btn-collapsible" variant="plain" size="small" :ripple="false" @click="expand = !expand">
                <v-icon size="small" :class="!expand ? 'icon-rotate-n90' : ''">
                    {{ expand ? iconExpanded : iconCollapsed }}
                </v-icon>
                <span class="pl-1">{{ title }}</span>
            </v-btn>
            <v-divider class="ml-3"></v-divider>
        </div>
        <v-expand-transition>
            <div v-show="expand">
                <slot></slot>
            </div>
        </v-expand-transition>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { mdiChevronDown } from '@mdi/js'

export default defineComponent({
    name: 'SubPanel',
    mixins: [BaseMixin],
    props: {
        iconExpanded: { type: String as PropType<string | null>, required: false, default: mdiChevronDown },
        iconCollapsed: { type: String as PropType<string | null>, required: false, default: mdiChevronDown },
        title: { type: String, required: true, default: '' },
        subPanelClass: { type: String, required: true },
    },
    computed: {
        expand: {
            get(): boolean {
                return this.$store.getters['gui/getPanelExpand'](this.subPanelClass, this.viewport)
            },
            set(newVal: boolean) {
                this.$store.dispatch('gui/saveExpandPanel', {
                    name: this.subPanelClass,
                    value: newVal,
                    viewport: this.viewport,
                })
            },
        },
    },
})
</script>
