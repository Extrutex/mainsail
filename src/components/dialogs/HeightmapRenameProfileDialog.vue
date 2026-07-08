<template>
    <v-dialog v-model="showDialog" persistent :max-width="400" @keydown.esc="closeDialog">
        <panel
            :title="$t('Heightmap.RenameBedMeshProfile')"
            :icon="mdiGrid"
            card-class="heightmap-rename-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>
                <v-text-field
                    ref="input"
                    v-model="newName"
                    :label="$t('Heightmap.Name')"
                    required
                    :rules="rules"
                    @update:error="onUpdateError"
                    @keyup.enter="renameProfile" />
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" @click="closeDialog">{{ $t('Buttons.Cancel') }}</v-btn>
                <v-btn :disabled="isInvalidName" color="primary" variant="text" @click="renameProfile">
                    {{ $t('Heightmap.Rename') }}
                </v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import type { FocusableRef } from '@/types/vuetify'
import BaseMixin from '@/components/mixins/base'
import { mdiCloseThick, mdiGrid } from '@mdi/js'

export default defineComponent({
    name: 'HeightmapRenameProfileDialog',
    mixins: [BaseMixin],
    props: {
        modelValue: { type: Boolean },
        name: { type: String, required: true },
    },
    emits: ['update:modelValue'],
    data() {
        return {
            mdiCloseThick: mdiCloseThick,
            mdiGrid: mdiGrid,
            isInvalidName: false,
            newName: '',
            rules: [
                (value: string) => !!value || this.$t('Heightmap.InvalidNameEmpty'),
                (value: string) => value !== 'default' || this.$t('Heightmap.InvalidNameReserved'),
                (value: string) =>
                    !this.profileNames.includes(value) ||
                    value === this.name ||
                    this.$t('Heightmap.InvalidNameAlreadyExists'),

                // eslint-disable-next-line no-control-regex
                (value: string) =>
                    value === value.replace(/[^\x00-\x7F]/g, '') || this.$t('Heightmap.InvalidNameAscii'),
            ],
        }
    },
    computed: {
        showDialog: {
            get(): boolean {
                return this.modelValue
            },
            set(value: boolean) {
                this.$emit('update:modelValue', value)
            },
        },
        input(): FocusableRef {
            return this.$refs.input as FocusableRef
        },
        profileNames() {
            return Object.keys(this.$store.state.printer.bed_mesh?.profiles ?? {})
        },
    },
    watch: {
        showDialog(newVal: boolean) {
            if (!newVal) return

            this.newName = this.name

            setTimeout(() => {
                this.input?.focus()
            })
        },
    },
    methods: {
        renameProfile() {
            if (this.name === this.newName) {
                this.closeDialog()
                return
            }

            const gcode = `BED_MESH_PROFILE SAVE="${this.newName}"\nBED_MESH_PROFILE REMOVE="${this.name}"`

            this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
            this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'bedMeshRename' })

            this.closeDialog()
        },
        closeDialog() {
            this.showDialog = false
        },
        onUpdateError(hasError: boolean) {
            this.isInvalidName = hasError
        },
    },
})
</script>
