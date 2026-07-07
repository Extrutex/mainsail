<template>
    <v-menu
        v-model="boolMenu"
        :location="isMobile ? 'bottom' : 'bottom end'"
        :close-on-content-click="false"
        origin="center center"
        transition="slide-y-transition"
        :min-width="isMobile ? '100%' : undefined">
        <template #activator="{ props }">
            <v-btn icon tile class="minwidth-0" v-bind="props">
                <v-badge
                    :content="notifications.length <= 9 ? notifications.length : '9+'"
                    :model-value="notifications.length > 0"
                    :color="colorBadge">
                    <v-icon>{{ boolMenu ? mdiBell : mdiBellOutline }}</v-icon>
                </v-badge>
            </v-btn>
        </template>
        <v-card variant="flat" :min-width="300" :max-width="isMobile ? undefined : 400">
            <template v-if="notifications.length">
                <overlay-scrollbars-component class="announcement-menu__scrollbar">
                    <v-card-text>
                        <template v-for="(entry, index) in notifications" :key="entry.id">
                            <notification-menu-entry
                                :entry="entry"
                                :class="index < notifications.length - 1 ? '' : 'mb-0'"
                                :parent-state="boolMenu" />
                        </template>
                    </v-card-text>
                </overlay-scrollbars-component>
                <template v-if="notifications.length > 1">
                    <v-divider />
                    <v-card-actions>
                        <v-spacer />
                        <v-btn variant="text" color="primary" class="mr-2" @click="dismissAll">
                            <v-icon start>{{ mdiCloseBoxMultipleOutline }}</v-icon>
                            {{ $t('App.Notifications.DismissAll') }}
                        </v-btn>
                    </v-card-actions>
                </template>
            </template>
            <v-card-text v-else class="text-center">
                <span class="text-disabled">{{ $t('App.Notifications.NoNotification') }}</span>
            </v-card-text>
        </v-card>
    </v-menu>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import NotificationMenuEntry from '@/components/notifications/NotificationMenuEntry.vue'
import { mdiBell, mdiBellOutline, mdiCloseBoxMultipleOutline } from '@mdi/js'
import { GuiNotificationStateEntry } from '@/store/gui/notifications/types'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

export default defineComponent({
    name: 'TheNotificationMenu',
    components: { NotificationMenuEntry, OverlayScrollbarsComponent },
    mixins: [BaseMixin],
    data() {
        return {
            mdiBell: mdiBell,
            mdiBellOutline: mdiBellOutline,
            mdiCloseBoxMultipleOutline: mdiCloseBoxMultipleOutline,

            boolMenu: false,
        }
    },
    computed: {
        notifications(): GuiNotificationStateEntry[] {
            return this.$store.getters['gui/notifications/getNotifications'] ?? []
        },

        existsCriticalAnnouncements(): boolean {
            return (
                this.notifications.filter((entry: GuiNotificationStateEntry) => entry.priority === 'critical').length >
                0
            )
        },

        existsHighAnnouncements(): boolean {
            return this.notifications.filter((entry: GuiNotificationStateEntry) => entry.priority === 'high').length > 0
        },

        countNormalAnnouncements(): number {
            return this.notifications.filter((entry: GuiNotificationStateEntry) => entry.priority === 'normal').length
        },

        colorBadge(): string {
            if (this.existsCriticalAnnouncements) return 'error'
            if (this.existsHighAnnouncements) return 'warning'

            return 'primary'
        },
    },
    methods: {
        dismissAll() {
            this.notifications.forEach(async (entry: GuiNotificationStateEntry) => {
                if (entry.id.startsWith('announcement')) {
                    await this.$store.dispatch('gui/notifications/close', { id: entry.id })
                }

                await this.$store.dispatch('gui/notifications/dismiss', { id: entry.id, type: 'reboot', time: null })
            })
        },
    },
})
</script>

<style scoped>
.announcement-menu__scrollbar {
    max-height: 500px;
}
</style>
