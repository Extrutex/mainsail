<template>
    <panel card-class="heightmap-map-panel" :title="$t('Heightmap.Heightmap')" :icon="mdiGrid">
        <template #buttons>
            <v-btn
                icon
                tile
                class="d-none d-sm-flex"
                :disabled="printerIsPrinting"
                :color="homedAxes.includes('xyz') ? 'primary' : 'warning'"
                :loading="loadings.includes('homeAll')"
                :title="$t('Heightmap.TitleHomeAll')"
                :ripple="true"
                @click="homePrinter">
                <v-icon>{{ mdiHome }}</v-icon>
            </v-btn>
            <v-btn
                v-if="is_active"
                variant="text"
                tile
                class="d-none d-sm-flex"
                :loading="loadings.includes('bedMeshClear')"
                :title="$t('Heightmap.TitleClear')"
                @click="clearBedMesh">
                {{ $t('Heightmap.Clear') }}
            </v-btn>
            <v-btn
                variant="text"
                tile
                class="d-none d-sm-flex"
                :loading="loadings.includes('bedMeshCalibrate')"
                :disabled="printerIsPrinting"
                :title="$t('Heightmap.TitleCalibrate')"
                @click="calibrateDialog = true">
                {{ $t('Heightmap.Calibrate') }}
            </v-btn>
        </template>
        <v-card-text class="d-sm-none text-center pb-0">
            <v-item-group tile class="v-btn-toggle" name="controllers">
                <v-btn
                    variant="text"
                    size="small"
                    class="px-2 minwidth-0"
                    :disabled="printerIsPrinting"
                    :color="homedAxes.includes('xyz') ? 'primary' : 'warning'"
                    :loading="loadings.includes('homeAll')"
                    :title="$t('Heightmap.TitleHomeAll')"
                    @click="homePrinter">
                    <v-icon :color="homedAxes.includes('xyz') ? 'primary' : 'warning'" size="small">
                        {{ mdiHome }}
                    </v-icon>
                </v-btn>
                <v-btn
                    v-if="bed_mesh"
                    variant="text"
                    size="small"
                    class="px-2 minwidth-0"
                    color="primary"
                    :loading="loadings.includes('bedMeshClear')"
                    :title="$t('Heightmap.TitleClear')"
                    @click="clearBedMesh">
                    {{ $t('Heightmap.Clear') }}
                </v-btn>
                <v-btn
                    variant="text"
                    size="small"
                    class="px-2 minwidth-0"
                    color="primary"
                    :loading="loadings.includes('bedMeshCalibrate')"
                    :disabled="printerIsPrinting"
                    :title="$t('Heightmap.TitleCalibrate')"
                    @click="calibrateDialog = true">
                    {{ $t('Heightmap.Calibrate') }}
                </v-btn>
            </v-item-group>
        </v-card-text>
        <template v-if="!is_active">
            <v-card-text class="text-center py-3 font-italic">
                {{ $t('Heightmap.NoBedMeshHasBeenLoadedYet') }}
            </v-card-text>
        </template>
        <template v-else>
            <v-card-text class="py-0 px-0">
                <v-row>
                    <v-col class="">
                        <heightmap-chart
                            :show-probed="showProbed"
                            :show-mesh="showMesh"
                            :show-flat="showFlat"
                            :wireframe="wireframe"
                            :scale-gradient="scaleGradient"
                            :scale-z-max="scaleZMax" />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12" sm="auto" class="pt-0 pb-0 pl-lg-6 d-flex justify-center justify-sm-start">
                        <v-switch v-model="scaleGradient" :label="$t('Heightmap.ScaleGradient')" class="mt-0 ml-5" />
                    </v-col>
                    <v-col class="d-flex justify-center pt-0 pb-6 pb-lg-3">
                        <v-checkbox
                            v-model="showProbed"
                            :label="$t('Heightmap.Probed')"
                            hide-details
                            class="mx-3 mt-0" />
                        <v-checkbox v-model="showMesh" :label="$t('Heightmap.Mesh')" hide-details class="mx-3 mt-0" />
                        <v-checkbox v-model="showFlat" :label="$t('Heightmap.Flat')" hide-details class="mx-3 mt-0" />
                        <v-checkbox
                            v-model="wireframe"
                            :label="$t('Heightmap.Wireframe')"
                            hide-details
                            class="mx-3 mt-0" />
                    </v-col>
                </v-row>
            </v-card-text>
            <v-divider />
            <v-card-text class="pt-0 pb-3">
                <v-row>
                    <v-col>
                        <v-slider
                            v-model="scaleZMax"
                            :label="$t('Heightmap.ScaleZMax')"
                            :min="heightmapRangeLimit[0]"
                            :max="heightmapRangeLimit[1]"
                            :step="0.1"
                            ticks="always"
                            class="mt-4"
                            hide-details />
                    </v-col>
                </v-row>
            </v-card-text>
        </template>
        <heightmap-calibrate-mesh-dialog v-model="calibrateDialog" />
    </panel>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { mdiGrid, mdiHome } from '@mdi/js'
import ControlMixin from '@/components/mixins/control'
import BedmeshMixin from '@/components/mixins/bedmesh'
import HeightmapCalibrateMeshDialog from '@/components/dialogs/HeightmapCalibrateMeshDialog.vue'

export default defineComponent({
    name: 'HeightmapChartPanel',
    components: { HeightmapCalibrateMeshDialog },
    mixins: [BaseMixin, ControlMixin, BedmeshMixin],
    data() {
        return {
            mdiGrid: mdiGrid,
            mdiHome: mdiHome,
            calibrateDialog: false,
        }
    },
    computed: {
        showProbed: {
            get(): boolean {
                return this.$store.state.gui.view.heightmap.probed ?? true
            },
            set(newVal) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.heightmap.probed', value: newVal })
            },
        },
        showMesh: {
            get(): boolean {
                return this.$store.state.gui.view.heightmap.mesh ?? true
            },
            set(newVal) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.heightmap.mesh', value: newVal })
            },
        },
        showFlat: {
            get(): boolean {
                return this.$store.state.gui.view.heightmap.flat ?? true
            },
            set(newVal) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.heightmap.flat', value: newVal })
            },
        },
        wireframe: {
            get(): boolean {
                return this.$store.state.gui.view.heightmap.wireframe ?? true
            },
            set(newVal) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.heightmap.wireframe', value: newVal })
            },
        },
        scaleGradient: {
            get(): boolean {
                return this.$store.state.gui.view.heightmap.scaleGradient ?? false
            },
            set(newVal) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.heightmap.scaleGradient', value: newVal })
            },
        },
        scaleZMax: {
            get(): number {
                return this.$store.state.gui.view.heightmap.scaleZMax ?? 0.5
            },
            set(newVal) {
                this.$store.dispatch('gui/saveSetting', { name: 'view.heightmap.scaleZMax', value: newVal })
            },
        },
        heightmapRangeLimit(): number[] {
            const minRange = Math.round(Math.max(Math.abs(this.min), Math.abs(this.max)) * 10) / 10
            const maxRange = Math.max(minRange, 1)

            return [minRange, maxRange]
        },
    },
    methods: {
        homePrinter(): void {
            const gcode = 'G28'

            this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
            this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'homeAll' })
        },
        clearBedMesh(): void {
            const gcode = 'BED_MESH_CLEAR'

            this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
            this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'bedMeshClear' })
        },
    },
})
</script>
