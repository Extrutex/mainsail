<template>
    <div>
        <v-row v-if="isMobile">
            <v-col>
                <status-panel />
                <template v-for="component in mobileLayout">
                    <component
                        :is="extractPanelName(component.name)"
                        :key="'dashboard-mobileLayout-' + component.name"
                        :panel-id="extractPanelId(component.name)"></component>
                </template>
            </v-col>
        </v-row>
        <v-row v-else-if="isTablet">
            <v-col cols="6">
                <status-panel />
                <template v-for="component in tabletLayout1">
                    <component
                        :is="extractPanelName(component.name)"
                        :key="'dashboard-tabletLayout1-' + component.name"
                        :panel-id="extractPanelId(component.name)"></component>
                </template>
            </v-col>
            <v-col cols="6">
                <template v-for="component in tabletLayout2">
                    <component
                        :is="extractPanelName(component.name)"
                        :key="'dashboard-tabletLayout2-' + component.name"
                        :panel-id="extractPanelId(component.name)"></component>
                </template>
            </v-col>
        </v-row>
        <v-row v-else-if="isDesktop">
            <v-col cols="5">
                <status-panel />
                <template v-for="component in desktopLayout1">
                    <component
                        :is="extractPanelName(component.name)"
                        :key="'dashboard-desktopLayout1-' + component.name"
                        :panel-id="extractPanelId(component.name)"></component>
                </template>
            </v-col>
            <v-col cols="7">
                <template v-for="component in desktopLayout2">
                    <component
                        :is="extractPanelName(component.name)"
                        :key="'dashboard-desktopLayout2-' + component.name"
                        :panel-id="extractPanelId(component.name)"></component>
                </template>
            </v-col>
        </v-row>
        <v-row v-else-if="isWidescreen">
            <v-col cols="3">
                <status-panel />
                <template v-for="component in widescreenLayout1">
                    <component
                        :is="extractPanelName(component.name)"
                        :key="'dashboard-desktopLayout1-' + component.name"
                        :panel-id="extractPanelId(component.name)"></component>
                </template>
            </v-col>
            <v-col cols="5">
                <template v-for="component in widescreenLayout2">
                    <component
                        :is="extractPanelName(component.name)"
                        :key="'dashboard-desktopLayout2-' + component.name"
                        :panel-id="extractPanelId(component.name)"></component>
                </template>
            </v-col>
            <v-col cols="4">
                <template v-for="component in widescreenLayout3">
                    <component
                        :is="extractPanelName(component.name)"
                        :key="'dashboard-desktopLayout3-' + component.name"
                        :panel-id="extractPanelId(component.name)"></component>
                </template>
            </v-col>
        </v-row>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AfcPanel from '@/components/panels/AfcPanel.vue'
import ExtruderControlPanel from '@/components/panels/ExtruderControlPanel.vue'
import DashboardMixin from '@/components/mixins/dashboard'
import KlippyStatePanel from '@/components/panels/KlippyStatePanel.vue'
import LedEffectsPanel from '@/components/panels/LedEffectsPanel.vue'
import MachineSettingsPanel from '@/components/panels/MachineSettingsPanel.vue'
import MacrogroupPanel from '@/components/panels/MacrogroupPanel.vue'
import MacrosPanel from '@/components/panels/MacrosPanel.vue'
import MiniconsolePanel from '@/components/panels/MiniconsolePanel.vue'
import MinSettingsPanel from '@/components/panels/MinSettingsPanel.vue'
import MiscellaneousPanel from '@/components/panels/MiscellaneousPanel.vue'
import NextgenDashboardPanel from '@/components/panels/NextgenDashboardPanel.vue'
import SpoolmanPanel from '@/components/panels/SpoolmanPanel.vue'
import MmuPanel from '@/components/panels/MmuPanel.vue'
import StatusPanel from '@/components/panels/StatusPanel.vue'
import ToolheadControlPanel from '@/components/panels/ToolheadControlPanel.vue'
import TemperaturePanel from '@/components/panels/TemperaturePanel.vue'
import WebcamPanel from '@/components/panels/WebcamPanel.vue'

export default defineComponent({
    name: 'PageDashboard',
    mixins: [DashboardMixin],
    components: {
        AfcPanel,
        ExtruderControlPanel,
        KlippyStatePanel,
        LedEffectsPanel,
        MachineSettingsPanel,
        MacrogroupPanel,
        MacrosPanel,
        MiniconsolePanel,
        MinSettingsPanel,
        MiscellaneousPanel,
        NextgenDashboardPanel,
        SpoolmanPanel,
        MmuPanel,
        StatusPanel,
        ToolheadControlPanel,
        TemperaturePanel,
        WebcamPanel,
    },
    computed: {
        mobileLayout(): any[] {
            return this.$store.getters['gui/getPanels']('mobile', 0, true)
        },

        tabletLayout1(): any[] {
            return this.$store.getters['gui/getPanels']('tablet', 1, true)
        },

        tabletLayout2(): any[] {
            return this.$store.getters['gui/getPanels']('tablet', 2, true)
        },

        desktopLayout1(): any[] {
            return this.$store.getters['gui/getPanels']('desktop', 1, true)
        },

        desktopLayout2(): any[] {
            return this.$store.getters['gui/getPanels']('desktop', 2, true)
        },

        widescreenLayout1(): any[] {
            return this.$store.getters['gui/getPanels']('widescreen', 1, true)
        },

        widescreenLayout2(): any[] {
            return this.$store.getters['gui/getPanels']('widescreen', 2, true)
        },

        widescreenLayout3(): any[] {
            return this.$store.getters['gui/getPanels']('widescreen', 3, true)
        },
    },
    methods: {
        extractPanelName(name: string): string {
            return name.split('_')[0] + '-panel'
        },

        extractPanelId(name: string): string | null {
            return name.split('_')[1] ?? null
        },
    },
})
</script>
