<template>
    <v-menu :offset-y="true" :close-on-content-click="false" :title="$t('Panels.TemperaturePanel.SetupTemperatures')">
        <template #activator="{ props }">
            <v-btn icon tile v-bind="props">
                <v-icon size="small">{{ mdiCog }}</v-icon>
            </v-btn>
        </template>
        <v-list>
            <v-list-item class="minHeight36">
                <v-checkbox
                    v-model="boolTempchart"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.TemperaturePanel.ShowChart')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox
                    v-model="hideMcuHostSensors"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.TemperaturePanel.HideMcuHostSensors')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox
                    v-model="hideMonitors"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.TemperaturePanel.HideMonitors')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox
                    v-model="autoscaleTempchart"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.TemperaturePanel.AutoscaleChart')" />
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { mdiCog } from '@mdi/js'

export default defineComponent({
    name: 'TemperaturePanelSettings',
    mixins: [BaseMixin],
    data() {
        return {
            mdiCog: mdiCog,
        }
    },
    computed: {
        boolTempchart: {
            get(): boolean {
                return this.$store.state.gui.view.tempchart.boolTempchart ?? false
            },
            setboolTempchart(newVal: boolean) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.tempchart.boolTempchart', value: newVal })
            },
        },
        autoscaleTempchart: {
            get(): boolean {
                return this.$store.state.gui.view.tempchart.autoscale ?? false
            },
            setautoscaleTempchart(newVal: boolean) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.tempchart.autoscale', value: newVal })
            },
        },
        hideMcuHostSensors: {
            get(): boolean {
                return this.$store.state.gui.view.tempchart.hideMcuHostSensors ?? false
            },
            sethideMcuHostSensors(newVal: boolean) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.tempchart.hideMcuHostSensors', value: newVal })
            },
        },
        hideMonitors: {
            get(): boolean {
                return this.$store.state.gui.view.tempchart.hideMonitors ?? false
            },
            sethideMonitors(newVal: boolean) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.tempchart.hideMonitors', value: newVal })
            },
        },
    },
})
</script>
