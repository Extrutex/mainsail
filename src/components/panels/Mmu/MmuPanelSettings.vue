<template>
    <v-menu location="bottom end" :close-on-content-click="false">
        <template #activator="{ props }">
            <v-btn icon tile v-bind="props">
                <v-icon size="small">{{ mdiCog }}</v-icon>
            </v-btn>
        </template>
        <v-list>
            <v-list-item v-if="hasMmuEncoder || hasSyncFeedback" class="minHeight36">
                <v-checkbox
                    v-model="showClogDetection"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.MmuPanel.ShowClogTangleDetection')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox v-model="showTtgMap" class="mt-0" hide-details :label="$t('Panels.MmuPanel.ShowTtgMap')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox
                    v-model="showDetails"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.MmuPanel.ShowDetails')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox
                    v-model="largeFilamentStatus"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.MmuPanel.LargeFilamentStatus')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox
                    v-model="showUnavailableSpoolColor"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.MmuPanel.ShowUnavailableSpoolColor')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox v-model="showName" class="mt-0" hide-details :label="$t('Panels.MmuPanel.ShowName')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox v-model="showLogos" class="mt-0" hide-details :label="$t('Panels.MmuPanel.ShowLogos')" />
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import MmuMixin from '@/components/mixins/mmu'
import { mdiCog } from '@mdi/js'

export default defineComponent({
    name: 'MmuPanelSettings',
    mixins: [BaseMixin, MmuMixin],
    data() {
        return {
            mdiCog: mdiCog,
        }
    },
    computed: {
        showClogDetection: {
            get(): boolean {
                return this.$store.state.gui.view.mmu.showClogDetection
            },
            set(newVal: boolean) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.mmu.showClogDetection', value: newVal })
            },
        },

        showTtgMap: {
            get(): boolean {
                return this.$store.state.gui.view.mmu.showTtgMap
            },
            set(newVal: boolean) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.mmu.showTtgMap', value: newVal })
            },
        },

        showDetails: {
            get(): boolean {
                return this.$store.state.gui.view.mmu.showDetails
            },
            set(newVal: boolean) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.mmu.showDetails', value: newVal })
            },
        },

        largeFilamentStatus: {
            get(): boolean {
                return this.$store.state.gui.view.mmu.largeFilamentStatus
            },
            set(newVal: boolean) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.mmu.largeFilamentStatus', value: newVal })
            },
        },

        showLogos: {
            get(): boolean {
                return this.$store.state.gui.view.mmu.showLogos
            },
            set(newVal: boolean) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.mmu.showLogos', value: newVal })
            },
        },

        showName: {
            get(): boolean {
                return this.$store.state.gui.view.mmu.showName
            },
            set(newVal: boolean) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.mmu.showName', value: newVal })
            },
        },

        showUnavailableSpoolColor: {
            get(): boolean {
                return this.$store.state.gui.view.mmu.showUnavailableSpoolColor
            },
            set(newVal: boolean) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.mmu.showUnavailableSpoolColor', value: newVal })
            },
        },
    },
})
</script>
