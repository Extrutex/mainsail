<template>
    <panel
        v-if="klipperReadyForGui"
        :icon="mdiLedStrip"
        :title="$t('Panels.LedEffectsPanel.Headline')"
        :collapsible="true"
        card-class="led-effects-panel">
        <template #buttons>
            <v-tooltip location="start">
                <template #activator="{ props }">
                    <v-btn
                        v-bind="props"
                        icon
                        tile
                        :loading="isLoadingAllEffects"
                        :disabled="printerIsPrintingOnly"
                        @click="stopAllEffects">
                        <v-icon>{{ mdiStop }}</v-icon>
                    </v-btn>
                </template>
                <span>{{ $t('Panels.LedEffectsPanel.StopAll') }}</span>
            </v-tooltip>
        </template>
        <v-card-text class="py-2">
            <v-row>
                <v-col class="text-center">
                    <led-effect-button
                        v-for="name in ledEffects"
                        :key="'led_effect_' + name"
                        :name="name"
                        class="mx-1 my-1" />
                </v-col>
            </v-row>
        </v-card-text>
    </panel>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '../mixins/base'
import Panel from '@/components/ui/Panel.vue'
import LedEffectButton from '@/components/inputs/LedEffectButton.vue'
import { mdiLedStrip, mdiStop } from '@mdi/js'

const STOP_LED_EFFECTS_COMMAND = 'STOP_LED_EFFECTS'

export default defineComponent({
    name: 'LedEffectsPanel',
    components: { LedEffectButton, Panel },
    mixins: [BaseMixin],
    data() {
        return {
            mdiLedStrip: mdiLedStrip,
            mdiStop: mdiStop,
        }
    },
    computed: {
        ledEffects() {
            const prefix = 'led_effect '
            const prefixLength = prefix.length

            return Object.keys(this.$store.state.printer)
                .filter((prop) => prop.toLowerCase().startsWith(prefix))
                .map((prop) => prop.slice(prefixLength))
                .filter((name) => !name.startsWith('_'))
                .sort((a, b) => a.localeCompare(b))
        },

        isLoadingAllEffects() {
            return this.loadings.includes(STOP_LED_EFFECTS_COMMAND)
        },
    },
    methods: {
        stopAllEffects() {
            this.$store.dispatch('server/addEvent', { message: STOP_LED_EFFECTS_COMMAND, type: 'command' })
            this.$socket.emit(
                'printer.gcode.script',
                { script: STOP_LED_EFFECTS_COMMAND },
                { loading: STOP_LED_EFFECTS_COMMAND }
            )
        },
    },
})
</script>
