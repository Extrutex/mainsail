<template>
    <v-menu :offset-y="true" :close-on-content-click="false" :title="$t('Panels.AfcPanel.Settings')" left>
        <template #activator="{ props }">
            <v-btn icon tile v-bind="props">
                <v-icon size="small">{{ mdiCog }}</v-icon>
            </v-btn>
        </template>
        <v-list>
            <v-list-item class="minHeight36">
                <v-checkbox
                    v-model="showFilamentName"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.AfcPanel.ShowFilamentName')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox
                    v-model="showLaneInfinite"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.AfcPanel.ShowLaneInfinite')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox
                    v-model="showUnitIcons"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.AfcPanel.ShowUnitIcons')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox
                    v-model="showTd1Color"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.AfcPanel.ShowTd1Color')" />
            </v-list-item>
            <v-divider />
            <afc-panel-settings-extruder v-for="extruder in afcExtruders" :key="extruder" :name="extruder" />
            <afc-panel-settings-unit v-for="unit in afcUnits" :key="unit" :name="unit" />
        </v-list>
    </v-menu>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import AfcMixin from '@/components/mixins/afc'
import { mdiCog } from '@mdi/js'

export default defineComponent({
    name: 'AfcPanelSettings',
    mixins: [BaseMixin, AfcMixin],
    data() {
        return {
            mdiCog: mdiCog,
        }
    },
    computed: {
        showFilamentName: {
            get(): boolean {
                return this.$store.state.gui.view.afc?.showFilamentName ?? true
            },
            setshowFilamentName(value: boolean) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.afc.showFilamentName', value })
            },
        },
        showLaneInfinite: {
            get(): boolean {
                return this.$store.state.gui.view.afc?.showLaneInfinite ?? true
            },
            setshowLaneInfinite(value: boolean) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.afc.showLaneInfinite', value })
            },
        },
        showUnitIcons: {
            get(): boolean {
                return this.$store.state.gui.view.afc?.showUnitIcons ?? true
            },
            setshowUnitIcons(value: boolean) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.afc.showUnitIcons', value })
            },
        },
        showTd1Color: {
            get(): boolean {
                return this.$store.state.gui.view.afc?.showTd1Color ?? true
            },
            setshowTd1Color(value: boolean) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.afc.showTd1Color', value })
            },
        },
    },
})
</script>
