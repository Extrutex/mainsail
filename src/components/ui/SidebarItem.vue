<template>
    <div>
        <v-tooltip location="end" :open-delay="500" :disabled="navigationStyle !== 'iconsOnly'">
            <template #activator="{ props }">
                <v-list-item :to="to" :href="href" :target="target" :class="itemClass" v-bind="props">
                    <template #prepend>
                        <v-icon class="my-3 mr-3 menu-item-icon">{{ icon }}</v-icon>
                    </template>
                    <v-list-item-title class="menu-item-title">
                        {{ title }}
                    </v-list-item-title>
                </v-list-item>
            </template>
            <span>{{ title }}</span>
        </v-tooltip>
        <v-divider v-if="borderBottom" class="my-1" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { NaviPoint } from '@/components/mixins/navigation'

export default defineComponent({
    name: 'SidebarItem',
    mixins: [BaseMixin],
    props: {
        item: { type: Object as PropType<NaviPoint>, required: true },
    },
    computed: {
        navigationStyle() {
            return this.$store.state.gui.uiSettings.navigationStyle
        },

        icon() {
            return this.item.icon
        },

        title() {
            return this.item.title
        },

        to() {
            return this.item.to ?? undefined
        },

        href() {
            return this.item.href ?? undefined
        },

        target() {
            return this.item.target ?? undefined
        },

        borderBottom() {
            return this.item.to === '/allPrinters'
        },

        isActive(): boolean {
            if (this.item.target === '_blank' || !this.item.to) return false

            return this.$route.path === this.item.to
        },

        itemClass() {
            return {
                'small-list-item': true,
                'active-nav-item': this.isActive,
            }
        },
    },
})
</script>

<style scoped>
.small-list-item {
    height: var(--sidebar-menu-item-height);
}

.active-nav-item {
    border-right: 4px solid rgb(var(--v-theme-primary));
}

.menu-item-icon {
    opacity: 0.85;
}

.menu-item-title {
    line-height: 30px;
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    opacity: 0.85;
}
</style>
