<template>
    <v-card
        :class="'panel ' + cardClass + ' ' + (marginBottom ? 'mb-3 mb-md-6' : '') + ' ' + (!expand ? 'expanded' : '')"
        :loading="loading">
        <v-toolbar
            flat
            density="compact"
            :color="toolbarColor"
            :class="getToolbarClass"
            :height="panelToolbarHeight"
            class="panel-toolbar"
            :style="additionalStyle">
            <slot name="buttons-left" />
            <v-toolbar-title class="d-flex align-center">
                <slot v-if="hasIconSlot" name="icon" />
                <v-icon v-if="icon !== null && !hasIconSlot" start>{{ icon }}</v-icon>
                <span v-if="title" class="subheading">{{ title }}</span>
            </v-toolbar-title>
            <slot name="buttons-title" />
            <v-spacer />
            <v-toolbar-items v-show="hasButtonsSlot || collapsible">
                <div v-if="expand || !hideButtonsOnCollapse" class="d-flex align-center">
                    <slot name="buttons" />
                </div>
                <v-btn v-if="collapsible" icon class="btn-collapsible" :ripple="true" @click="expand = !expand">
                    <v-icon :class="expand ? '' : 'icon-rotate-90'">{{ mdiChevronDown }}</v-icon>
                </v-btn>
            </v-toolbar-items>
        </v-toolbar>
        <v-expand-transition>
            <div v-show="expand || !collapsible">
                <slot />
            </div>
        </v-expand-transition>
    </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { panelToolbarHeight } from '@/store/variables'
import { mdiChevronDown } from '@mdi/js'
import { TranslateResult } from 'vue-i18n'

export default defineComponent({
    name: 'Panel',
    mixins: [BaseMixin],
    props: {
        icon: { type: String as PropType<string | null>, default: null },
        title: { type: String as PropType<string | TranslateResult>, required: true, default: '' },
        collapsible: { type: Boolean, default: false },
        cardClass: { type: String, required: true },
        toolbarColor: { type: String, default: '' },
        toolbarClass: { type: String, default: '' },
        loading: { type: Boolean, default: false },
        marginBottom: { type: Boolean, default: true },
        hideButtonsOnCollapse: { type: Boolean, default: false },
    },
    data() {
        return {
            mdiChevronDown: mdiChevronDown,
            panelToolbarHeight: panelToolbarHeight,
        }
    },
    computed: {
        expand: {
            get(): boolean {
                return this.$store.getters['gui/getPanelExpand'](this.cardClass, this.viewport)
            },
            set(newVal: boolean) {
                this.$store.dispatch('gui/saveExpandPanel', {
                    name: this.cardClass,
                    value: newVal,
                    viewport: this.viewport,
                })
            },
        },

        hasIconSlot() {
            return !!this.$slots.icon
        },

        hasButtonsSlot() {
            return !!this.$slots.buttons
        },

        getToolbarClass() {
            let output = this.toolbarClass

            if (this.collapsible) output += ' collapsible'

            return output
        },

        additionalStyle() {
            return this.$vuetify.theme.current.dark ? '' : 'border-bottom: 1px solid #A8A8A8'
        },
    },
})
</script>

<style scoped>
.expanded header.v-toolbar {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
}

.btn-collapsible > * {
    will-change: transform;
    transition: transform 500ms;
}
.icon-rotate-90 {
    transform: rotate(90deg);
}

.panel-toolbar {
    overflow-y: hidden;
}

:deep(.panel-toolbar .v-btn) {
    height: 100% !important;
    max-height: none;
}
</style>

<style>
.v-card.panel .v-toolbar__content {
    padding-right: 0;
}
.v-card.panel .v-toolbar__content .subheading {
    user-select: none;
}
.panel-toolbar .v-btn.v-btn--icon {
    width: var(--panel-toolbar-icon-btn-width) !important;
}
</style>
