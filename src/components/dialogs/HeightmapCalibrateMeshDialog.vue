<template>
    <v-dialog v-model="showDialog" persistent :max-width="400" @keydown.esc="closeDialog">
        <panel
            :title="$t('Heightmap.BedMeshCalibrate')"
            :icon="mdiGrid"
            card-class="heightmap-calibrate-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>
                <v-text-field
                    ref="input"
                    v-model="name"
                    :label="$t('Heightmap.Name')"
                    required
                    :rules="rules"
                    @update:error="
                        (newVal) => {
                            isInvalidName = newVal
                        }
                    "
                    @keyup.enter="calibrateMesh" />
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" @click="closeDialog">{{ $t('Buttons.Cancel') }}</v-btn>
                <v-btn :disabled="isInvalidName" color="primary" variant="text" @click="calibrateMesh">
                    {{ $t('Heightmap.Calibrate') }}
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
    },
    emits: ['update:modelValue'],
    data() {
        return {
            mdiCloseThick: mdiCloseThick,
            mdiGrid: mdiGrid,
            isInvalidName: false,
            name: '',
            rules: [
                (value: string) => !!value || this.$t('Heightmap.InvalidNameEmpty'),

                (value: string) =>
                    // eslint-disable-next-line no-control-regex
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
    },
    watch: {
        showDialog(newVal: boolean) {
            if (!newVal) return

            this.name = 'default'
            setTimeout(() => {
                this.input?.focus()
            })
        },
    },
    methods: {
        calibrateMesh(): void {
            const gcode = `BED_MESH_CALIBRATE PROFILE="${this.name}"`

            this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
            this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'bedMeshCalibrate' })

            this.closeDialog()
        },
        closeDialog() {
            this.showDialog = false
        },
    },
})
</script>
