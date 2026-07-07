<template>
    <v-container class="px-0 py-2">
        <v-row>
            <v-col class="pb-3">
                <v-list-subheader class="_filamentRunout-subheader">
                    <v-icon size="small" class="mr-2">{{ mdiPrinter3dNozzleAlert }}</v-icon>
                    <span>{{ convertName(name) }}</span>
                    <v-spacer />
                    <small :class="'mr-3 text-' + statusColor">{{ statusText }}</small>
                    <v-icon @click="changeSensor">
                        {{ enabled ? mdiToggleSwitch : mdiToggleSwitchOffOutline }}
                    </v-icon>
                </v-list-subheader>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { convertName } from '@/plugins/helpers'
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { mdiPrinter3dNozzleAlert, mdiToggleSwitch, mdiToggleSwitchOffOutline } from '@mdi/js'

export default defineComponent({
    name: 'FilamentSensor',
    mixins: [BaseMixin],
    props: {
        type: { type: String, required: true },
        name: { type: String, required: true },
        enabled: { type: Boolean, required: true },
        filament_detected: { type: Boolean, required: true },
        filament_diameter: { type: Number },
    },
    data() {
        return {
            /**
             * Icons
             */

            mdiToggleSwitch: mdiToggleSwitch,
            mdiToggleSwitchOffOutline: mdiToggleSwitchOffOutline,
            mdiPrinter3dNozzleAlert: mdiPrinter3dNozzleAlert,

            convertName: convertName,
        }
    },
    computed: {
        statusColor() {
            if (!this.enabled) return 'gray'
            else if (this.filament_detected) return 'success'

            return 'warning'
        },

        statusText() {
            if (this.filament_diameter !== undefined && this.filament_detected) {
                return this.filament_diameter.toPrecision(3) + 'mm'
            }
            if (this.filament_detected) return this.$t('Panels.MiscellaneousPanel.RunoutSensor.Detected')

            return this.$t('Panels.MiscellaneousPanel.RunoutSensor.Empty')
        },
    },
    methods: {
        changeSensor() {
            const gcodes = ['SET_FILAMENT_SENSOR SENSOR=' + this.name + ' ENABLE=' + (this.enabled ? 0 : 1)]
            if (this.type == 'hall_filament_width_sensor') {
                gcodes.push((this.enabled ? 'DIS' : 'EN') + 'ABLE_FILAMENT_WIDTH_SENSOR')
            }
            for (const gcode of gcodes) {
                this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
                this.$socket.emit('printer.gcode.script', { script: gcode })
            }
        },
    },
})
</script>

<style scoped>
._filamentRunout-subheader {
    height: auto;
}
</style>
