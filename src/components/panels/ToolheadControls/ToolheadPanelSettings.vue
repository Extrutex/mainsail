<template>
    <v-menu :offset-y="true" :left="true" :close-on-content-click="false">
        <template #activator="{ props }">
            <v-btn icon tile v-bind="props">
                <v-icon size="small">{{ mdiCog }}</v-icon>
            </v-btn>
        </template>
        <v-list>
            <v-list-item class="minHeight36">
                <v-checkbox
                    v-model="showPosition"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.ToolheadControlPanel.PositionOutput')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox
                    v-model="showCoordinates"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.ToolheadControlPanel.CoordinateFields')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox
                    v-model="showControl"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.ToolheadControlPanel.ControlButtons')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox
                    v-model="showZOffset"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.ToolheadControlPanel.ZOffset')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox
                    v-model="showSpeedFactor"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.ToolheadControlPanel.SpeedFactor')" />
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { mdiCog } from '@mdi/js'

export default defineComponent({
    name: 'ToolheadPanelSettings',
    mixins: [BaseMixin],
    data() {
        return {
            mdiCog: mdiCog,
        }
    },
    computed: {
        showPosition: {
            get(): boolean {
                return this.$store.state.gui.view.toolhead.showPosition ?? true
            },
            set(newVal: boolean) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.toolhead.showPosition', value: newVal })
            },
        },
        showCoordinates: {
            get(): boolean {
                return this.$store.state.gui.view.toolhead.showCoordinates ?? true
            },
            set(newVal: boolean) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.toolhead.showCoordinates', value: newVal })
            },
        },
        showControl: {
            get(): boolean {
                return this.$store.state.gui.view.toolhead.showControl ?? true
            },
            set(newVal: boolean) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.toolhead.showControl', value: newVal })
            },
        },
        showZOffset: {
            get(): boolean {
                return this.$store.state.gui.view.toolhead.showZOffset ?? true
            },
            set(newVal: boolean) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.toolhead.showZOffset', value: newVal })
            },
        },
        showSpeedFactor: {
            get(): boolean {
                return this.$store.state.gui.view.toolhead.showSpeedFactor ?? true
            },
            set(newVal: boolean) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.toolhead.showSpeedFactor', value: newVal })
            },
        },
    },
})
</script>
