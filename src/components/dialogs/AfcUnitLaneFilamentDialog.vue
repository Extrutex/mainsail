<template>
    <v-dialog v-model="showDialog" width="400">
        <panel
            :title="$t('Panels.AfcPanel.FilamentForLane', { name })"
            :icon="afcIconLogo"
            card-class="afc-unit-lane-filament-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text class="pb-0">
                <settings-row
                    :title="$t('Panels.AfcPanel.Material')"
                    :sub-title="$t('Panels.AfcPanel.MaterialSubtitle')">
                    <v-text-field
                        v-model="material"
                        placeholder="ABS"
                        density="compact"
                        variant="outlined"
                        hide-details />
                </settings-row>
                <v-divider class="my-3" />
                <settings-row :title="$t('Panels.AfcPanel.Weight')" :sub-title="$t('Panels.AfcPanel.WeightSubtitle')">
                    <v-text-field
                        v-model="weight"
                        placeholder="1000"
                        density="compact"
                        variant="outlined"
                        type="number"
                        :min="0"
                        :step="1"
                        hide-details />
                </settings-row>
                <v-divider class="my-3" />
                <v-color-picker
                    mode="hexa"
                    :modes="['hexa']"
                    :model-value="color"
                    class="mx-auto"
                    @update:model-value="setColor" />
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" color="disabled" @click="closeDialog">{{ $t('Buttons.Cancel') }}</v-btn>
                <v-btn :disabled="disableSetBtn" color="primary" variant="text" @click="setSpool">
                    {{ $t('Panels.AfcPanel.SetSpool') }}
                </v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick } from '@mdi/js'
import AfcMixin from '@/components/mixins/afc'
import { afcIconLogo } from '@/plugins/afcIcons'
import { debounce } from '@/plugins/helpers'

export default defineComponent({
    name: 'AfcUnitLaneFilamentDialog',
    components: { Panel },
    mixins: [BaseMixin, AfcMixin],
    props: {
        modelValue: { type: Boolean, default: false },
        name: { type: String, required: true },
    },
    emits: ['update:modelValue'],
    data() {
        return {
            afcIconLogo: afcIconLogo,
            mdiCloseThick: mdiCloseThick,
            color: '#000000',
            material: '',
            weight: 0,
        }
    },
    computed: {
        showDialog: {
            get(): boolean {
                return this.modelValue
            },
            set(newVal: boolean) {
                this.$emit('update:modelValue', newVal)
            },
        },

        lane() {
            return this.getAfcLaneObject(this.name)
        },

        currentColor() {
            return this.lane.color || '#000000'
        },

        currentMaterial() {
            return this.lane.material ?? ''
        },

        currentWeight() {
            return Math.round(this.lane.weight ?? 0)
        },

        disableSetBtn() {
            return !this.material || !this.weight || !this.color
        },
    },
    methods: {
        setColor: debounce(function (this: any, newColor: string) {
            // only store the hex part without alpha (like the old `color.hex` value)
            this.color = newColor.slice(0, 7)
        }, 500),

        setSpool() {
            const gcode = []

            if (this.color !== this.currentColor) {
                const cleanedColor = this.color.replace('#', '')
                gcode.push(`SET_COLOR LANE=${this.name} COLOR=${cleanedColor}`)
            }
            if (this.material !== this.currentMaterial) {
                gcode.push(`SET_MATERIAL LANE=${this.name} MATERIAL=${this.material}`)
            }
            if (this.weight !== this.currentWeight) {
                gcode.push(`SET_WEIGHT LANE=${this.name} WEIGHT=${this.weight}`)
            }

            this.doSend(gcode.join('\n'))
            this.closeDialog()
        },

        doSend(gcode: string) {
            this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
            this.$socket.emit('printer.gcode.script', { script: gcode })
        },

        closeDialog() {
            this.showDialog = false
        },
    },
    watch: {
        showDialog(newValue: boolean) {
            if (!newValue) return

            this.color = this.currentColor
            this.material = this.currentMaterial
            this.weight = this.currentWeight
        },
    },
})
</script>
