<template>
    <v-menu :offset-y="true" :left="true" :close-on-content-click="false">
        <template #activator="{ props }">
            <v-btn icon tile v-bind="props">
                <v-icon size="small">{{ mdiCog }}</v-icon>
            </v-btn>
        </template>
        <v-list>
            <v-list-item v-if="toolchangeMacros.length" class="minHeight36">
                <v-checkbox
                    v-model="showTools"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.ExtruderControlPanel.Tools')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox
                    v-model="showExtrusionFactor"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.ExtruderControlPanel.ExtrusionFactor')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox
                    v-model="showPressureAdvance"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.ExtruderControlPanel.PressureAdvance')" />
            </v-list-item>
            <v-list-item v-if="existsFirmwareRetraction" class="minHeight36">
                <v-checkbox
                    v-model="showFirmwareRetraction"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.ExtruderControlPanel.FirmwareRetraction')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox
                    v-model="showExtruderControl"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.ExtruderControlPanel.ExtruderControl')" />
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { mdiCog } from '@mdi/js'
import ControlMixin from '@/components/mixins/control'

export default defineComponent({
    name: 'ExtruderPanelSettings',
    mixins: [BaseMixin, ControlMixin],
    data() {
        return {
            mdiCog: mdiCog,
        }
    },
    computed: {
        showTools: {
            get(): boolean {
                return this.$store.state.gui.view.extruder.showTools ?? true
            },
            setshowTools(newVal: boolean) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.extruder.showTools', value: newVal })
            },
        },
        showExtrusionFactor: {
            get(): boolean {
                return this.$store.state.gui.view.extruder.showExtrusionFactor ?? true
            },
            setshowExtrusionFactor(newVal: boolean) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.extruder.showExtrusionFactor', value: newVal })
            },
        },
        showPressureAdvance: {
            get(): boolean {
                return this.$store.state.gui.view.extruder.showPressureAdvance ?? true
            },
            setshowPressureAdvance(newVal: boolean) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.extruder.showPressureAdvance', value: newVal })
            },
        },
        showFirmwareRetraction: {
            get(): boolean {
                return this.$store.state.gui.view.extruder.showFirmwareRetraction ?? true
            },
            setshowFirmwareRetraction(newVal: boolean) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.extruder.showFirmwareRetraction', value: newVal })
            },
        },
        showExtruderControl: {
            get(): boolean {
                return this.$store.state.gui.view.extruder.showExtruderControl ?? true
            },
            setshowExtruderControl(newVal: boolean) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.extruder.showExtruderControl', value: newVal })
            },
        },
    },
})
</script>
