<template>
    <div>
        <v-card flat>
            <v-card-text>
                <settings-row :title="$t('Settings.GCodeViewerTab.ShowAxes')">
                    <v-switch v-model="showAxes" class="mt-0" hide-details></v-switch>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.GCodeViewerTab.BackgroundColor')">
                    <v-menu :close-on-content-click="false" bottom left location="bottom">
                        <template #activator="{ props }">
                            <v-btn :color="backgroundColor" class="minwidth-0 px-5" size="small" v-bind="props"></v-btn>
                        </template>
                        <v-color-picker
                            :value="backgroundColor"
                            hide-mode-switch
                            mode="rgba"
                            @update:color="updateColorValue('backgroundColor', $event)"></v-color-picker>
                    </v-menu>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.GCodeViewerTab.GridColor')">
                    <v-menu :close-on-content-click="false" bottom left location="bottom">
                        <template #activator="{ props }">
                            <v-btn :color="gridColor" class="minwidth-0 px-5" size="small" v-bind="props"></v-btn>
                        </template>
                        <v-color-picker
                            :value="gridColor"
                            hide-mode-switch
                            mode="rgba"
                            @update:color="updateColorValue('gridColor', $event)"></v-color-picker>
                    </v-menu>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.GCodeViewerTab.ProgressColor')">
                    <v-menu :close-on-content-click="false" bottom left location="bottom">
                        <template #activator="{ props }">
                            <v-btn :color="progressColor" class="minwidth-0 px-5" size="small" v-bind="props"></v-btn>
                        </template>
                        <v-color-picker
                            :value="progressColor"
                            hide-mode-switch
                            mode="rgba"
                            @update:color="updateColorValue('progressColor', $event)"></v-color-picker>
                    </v-menu>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.GCodeViewerTab.ExtruderColor')">
                    <v-row no-gutters>
                        <v-menu
                            v-for="(extruderColor, index) in extruderColors"
                            :key="index"
                            :close-on-content-click="false"
                            bottom
                            left
                            location="bottom">
                            <template #activator="{ props }">
                                <v-col align="right" class="mt-1" cols="12">
                                    <span class="mr-2">{{ index }}</span>
                                    <v-btn
                                        :color="extruderColors[index]"
                                        class="minwidth-0 px-5"
                                        size="small"
                                        v-bind="props"></v-btn>
                                </v-col>
                            </template>
                            <v-color-picker
                                :value="extruderColors[index]"
                                hide-mode-switch
                                mode="rgba"
                                @update:color="colorsUpdated($event, index)"></v-color-picker>
                        </v-menu>
                    </v-row>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.GCodeViewerTab.MinFeed')">
                    <v-menu :close-on-content-click="false" bottom left location="bottom">
                        <template #activator="{ props }">
                            <v-btn
                                :color="minFeedColor"
                                class="minwidth-0 px-5 mr-3"
                                size="small"
                                v-bind="props"></v-btn>
                        </template>
                        <v-color-picker
                            :value="minFeedColor"
                            hide-mode-switch
                            mode="rgba"
                            @update:color="updateColorValue('minFeedColor', $event)"></v-color-picker>
                    </v-menu>
                    <v-text-field
                        v-model="minFeed"
                        :rules="[(v) => v > 0 || 'Minimum speed is 1']"
                        density="compact"
                        hide-details="auto"
                        variant="outlined"
                        suffix="mm/s"
                        type="number"
                        hide-spin-buttons
                        @blur="feedBlur"></v-text-field>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.GCodeViewerTab.MaxFeed')">
                    <v-menu :close-on-content-click="false" bottom left location="bottom">
                        <template #activator="{ props }">
                            <v-btn
                                :color="maxFeedColor"
                                class="minwidth-0 px-5 mr-3"
                                size="small"
                                v-bind="props"></v-btn>
                        </template>
                        <v-color-picker
                            :value="maxFeedColor"
                            hide-mode-switch
                            mode="rgba"
                            @update:color="updateColorValue('maxFeedColor', $event)"></v-color-picker>
                    </v-menu>
                    <v-text-field
                        v-model="maxFeed"
                        :rules="[(v) => v > 0 || 'Minimum speed is 1']"
                        density="compact"
                        hide-details="auto"
                        variant="outlined"
                        suffix="mm/s"
                        type="number"
                        hide-spin-buttons
                        @blur="feedBlur"></v-text-field>
                </settings-row>
            </v-card-text>
        </v-card>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { Debounce } from 'vue-debounce-decorator'

import { debounce, clearColorObject, ColorPickerValue } from '@/plugins/helpers'

export default defineComponent({
    name: 'SettingsGCodeViewerTab',
    components: { SettingsRow },
    mixins: [BaseMixin],
    computed: {
        showAxes: {
            get(): boolean {
                return this.$store.state.gui.gcodeViewer.showAxes
            },
            set(newVal: boolean) {
                this.$store.dispatch('gui/saveSetting', { name: 'gcodeViewer.showAxes', value: newVal })
            },
        },
        extruderColors(): Array<string> {
            return this.$store.state.gui.gcodeViewer.extruderColors
        },
        backgroundColor: {
            get(): string {
                return this.$store.state.gui.gcodeViewer.backgroundColor
            },
            set(newVal: string) {
                this.$store.dispatch('gui/saveSetting', { name: 'gcodeViewer.backgroundColor', value: newVal })
            },
        },
        gridColor: {
            get(): string {
                return this.$store.state.gui.gcodeViewer.gridColor
            },
            set(newVal: string) {
                this.$store.dispatch('gui/saveSetting', { name: 'gcodeViewer.gridColor', value: newVal })
            },
        },
        progressColor: {
            get(): string {
                return this.$store.state.gui.gcodeViewer.progressColor
            },
            set(newVal: string) {
                this.$store.dispatch('gui/saveSetting', { name: 'gcodeViewer.progressColor', value: newVal })
            },
        },
        minFeed: {
            get(): number {
                return this.$store.state.gui.gcodeViewer.minFeed
            },
            set(newVal: number) {
                this.$store.dispatch('gui/saveSetting', { name: 'gcodeViewer.minFeed', value: newVal })
            },
        },
        maxFeed: {
            get(): number {
                return this.$store.state.gui.gcodeViewer.maxFeed
            },
            set(newVal: number) {
                this.$store.dispatch('gui/saveSetting', { name: 'gcodeViewer.maxFeed', value: newVal })
            },
        },
        minFeedColor: {
            get(): string {
                return this.$store.state.gui.gcodeViewer.minFeedColor
            },
            set(newVal: string) {
                this.$store.dispatch('gui/saveSetting', { name: 'gcodeViewer.minFeedColor', value: newVal })
            },
        },
        maxFeedColor: {
            get(): string {
                return this.$store.state.gui.gcodeViewer.maxFeedColor
            },
            set(newVal: string) {
                this.$store.dispatch('gui/saveSetting', { name: 'gcodeViewer.maxFeedColor', value: newVal })
            },
        },
    },
    methods: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        colorsUpdated: debounce(function (this: any, value: ColorPickerValue, index: number) {
            const colors = [...this.extruderColors]
            colors[index] = clearColorObject(value)
            this.$store.dispatch('gui/saveSetting', { name: 'gcodeViewer.extruderColors', value: colors })
        }, 500),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updateColorValue: debounce(function (this: any, colorElement: string, newVal: ColorPickerValue) {
            this[colorElement] = clearColorObject(newVal)
        }, 500),
        feedBlur(): void {
            if (this.minFeed < 1) this.minFeed = 1
            if (this.maxFeed < this.minFeed) this.maxFeed = this.minFeed + 1
        },
    },
})
</script>
