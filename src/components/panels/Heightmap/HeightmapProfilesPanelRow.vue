<template>
    <v-row class="rowProfile">
        <v-col class="pl-6">
            <span
                :class="{ 'font-weight-bold': is_active, currentMeshName: is_active, 'cursor-pointer': true }"
                @click="clickOnName">
                {{ name }}
            </span>
        </v-col>
        <v-col cols="auto" class="text-center d-flex align-center justify-center pr-6">
            <v-tooltip top color="rgba(0,0,0,0.8)">
                <template #activator="{ props }">
                    <small v-bind="props">{{ variance }}</small>
                </template>
                <span>
                    max: {{ max }}
                    <br />
                    min: {{ min }}
                </span>
            </v-tooltip>
        </v-col>
        <v-col cols="auto" class="py-0 d-flex flex-row align-center justify-end">
            <v-btn
                v-if="!is_active"
                variant="text"
                tile
                class="px-2 minwidth-0"
                :loading="isLoadingLoad"
                style="height: 48px; width: 48px"
                @click="loadProfile">
                <v-icon>{{ mdiProgressUpload }}</v-icon>
            </v-btn>
            <v-btn
                v-else
                variant="text"
                tile
                class="px-2 minwidth-0"
                :loading="isLoadingLoad"
                style="height: 48px; width: 48px"
                @click="showRename = true">
                <v-icon>{{ mdiPencil }}</v-icon>
            </v-btn>
            <v-btn
                variant="text"
                tile
                class="px-2 minwidth-0"
                style="height: 48px; width: 48px"
                :loading="isLoadingRemove"
                :title="$t('Heightmap.DeleteBedMeshProfile')"
                @click="showRemove = true">
                <v-icon>{{ mdiDelete }}</v-icon>
            </v-btn>
        </v-col>
        <confirmation-dialog
            v-model="showRemove"
            :icon="mdiGrid"
            :title="$t('Heightmap.BedMeshRemove')"
            :text="$t('Heightmap.DoYouReallyWantToDelete', { name })"
            :action-button-text="$t('Buttons.Delete')"
            :cancel-button-text="$t('Buttons.Cancel')"
            @action="removeProfile" />
        <heightmap-rename-profile-dialog v-model="showRename" :name="name" />
    </v-row>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { mdiDelete, mdiGrid, mdiPencil, mdiProgressUpload } from '@mdi/js'
import BaseMixin from '@/components/mixins/base'
import { PrinterStateBedMeshProfile } from '@/store/printer/types'
import HeightmapRenameProfileDialog from '@/components/dialogs/HeightmapRenameProfileDialog.vue'
import ConfirmationDialog from '@/components/dialogs/ConfirmationDialog.vue'

export default defineComponent({
    name: 'HeightmapProfilesPanelRow',
    components: { HeightmapRenameProfileDialog, ConfirmationDialog },
    mixins: [BaseMixin],
    props: {
        name: { type: String, required: true },
        profile: { type: Object, required: true },
    },
    data() {
        return {
            mdiDelete: mdiDelete,
            mdiGrid: mdiGrid,
            mdiPencil: mdiPencil,
            mdiProgressUpload: mdiProgressUpload,
            showRemove: false,
            showRename: false,
        }
    },
    computed: {
        points() {
            const points: number[] = []

            for (let i = 0; i < this.profile.points.length; i++) {
                for (let j = 0; j < this.profile.points[i].length; j++) {
                    points.push(this.profile.points[i][j])
                }
            }

            return points
        },
        min() {
            return Math.round(Math.min(...this.points) * 1000) / 1000
        },
        max() {
            return Math.round(Math.max(...this.points) * 1000) / 1000
        },
        variance() {
            return Math.abs(this.min - this.max).toFixed(3)
        },
        is_active() {
            const currentProfile = this.$store.state.printer.bed_mesh?.profile_name ?? ''

            return currentProfile === this.name
        },
        loadingNameLoad() {
            return `bedMeshLoad_${this.name}`
        },
        loadingNameRemove() {
            return `bedMeshRemove_${this.name}`
        },
        isLoadingLoad() {
            return this.loadings.includes(this.loadingNameLoad)
        },
        isLoadingRemove() {
            return this.loadings.includes(this.loadingNameRemove)
        },
    },
    methods: {
        clickOnName() {
            if (this.is_active) {
                this.showRename = true
                return
            }

            this.loadProfile()
        },
        loadProfile(): void {
            const gcode = `BED_MESH_PROFILE LOAD="${this.name}"`

            this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
            this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: this.loadingNameLoad })
        },
        removeProfile(): void {
            const gcode = `BED_MESH_PROFILE REMOVE="${this.name}"`

            this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
            this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: this.loadingNameRemove })
        },
    },
})
</script>

<style scoped>
.currentMeshName {
    color: var(--v-primary-base);
}
</style>
