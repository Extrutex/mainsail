<template>
    <responsive :breakpoints="{ small: (el) => el.width <= 350 }">
        <template #default="{ el }">
            <v-container>
                <v-row>
                    <v-col class="pa-0">
                        <v-subheader class="_subheadline">{{ subheadline }}</v-subheader>
                    </v-col>
                </v-row>
                <pressure-advance-settings :extruder="extruderStepper" :is-small="el.is.small" />
            </v-container>
        </template>
    </responsive>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import Responsive from '@/components/ui/Responsive.vue'
import { capitalize } from '@/plugins/helpers'

export default defineComponent({
    name: 'ExtruderStepperPressureAdvanceSettings',
    components: { Responsive },
    mixins: [BaseMixin],
    props: {
        extruderStepper: { type: String, required: true },
    },
    computed: {
        name() {
            return this.extruderStepper.substring('extruder_stepper '.length)
        },
        subheadline() {
            if (this.motionQueue) {
                return `${capitalize(this.name)} (${this.$t('Panels.ExtruderControlPanel.PressureAdvanceSettings.SyncedWithExtruder', { extruder: this.motionQueue })})`
            }

            return capitalize(this.name)
        },
        extruderStepperObject() {
            return this.$store.state.printer?.[this.extruderStepper] ?? undefined
        },
        motionQueue() {
            return this.extruderStepperObject?.motion_queue ?? ''
        },
    },
})
</script>

<style scoped>
._subheadline {
    height: auto;
}
</style>
