<template>
    <div style="height: 100%">
        <v-menu v-if="presets.length" :offset-y="true" left>
            <template #activator="{ props }">
                <v-btn
                    variant="text"
                    tile
                    color="primary"
                    v-bind="props"
                    :disabled="['printing', 'paused'].includes(printer_state)"
                    class="pa-1">
                    <span class="d-none ml-1 d-md-block">{{ $t('Panels.TemperaturePanel.Presets') }}</span>
                    <v-icon class="d-md-none">{{ mdiFire }}</v-icon>
                    <v-icon>{{ mdiMenuDown }}</v-icon>
                </v-btn>
            </template>
            <v-list density="compact" class="py-0">
                <v-list-item v-for="(preset, index) of presets" :key="index" link @click="preheat(preset)">
                    <div class="d-flex align-center _preset-title">
                        <v-icon size="small" class="mr-1">{{ mdiFire }}</v-icon>
                        <span style="padding-top: 2px">{{ preset.name }}</span>
                    </div>
                </v-list-item>
            </v-list>
            <v-divider class="_fix_transparency" />
            <v-list density="compact" class="py-0">
                <v-list-item link @click="btnCoolDown">
                    <div class="d-flex align-center _preset-title">
                        <v-icon size="small" color="primary" class="mr-1">{{ mdiSnowflake }}</v-icon>
                        <span class="primary--text">{{ $t('Panels.TemperaturePanel.Cooldown') }}</span>
                    </div>
                </v-list-item>
            </v-list>
        </v-menu>
        <v-btn
            v-else
            :icon="$vuetify.display.smAndDown"
            :variant="$vuetify.display.mdAndUp ? 'text' : undefined"
            tile
            color="primary"
            @click="btnCoolDown">
            <v-icon size="small">{{ mdiSnowflake }}</v-icon>
            <span class="d-none ml-1 d-md-inline">{{ $t('Panels.TemperaturePanel.Cooldown') }}</span>
        </v-btn>
        <confirmation-dialog
            v-model="showCoolDownDialog"
            :icon="mdiSnowflake"
            :title="$t('CoolDownDialog.CoolDown')"
            :text="$t('CoolDownDialog.AreYouSure')"
            :action-button-text="$t('Buttons.Yes')"
            :action-button-color="'primary'"
            :cancel-button-text="$t('Buttons.No')"
            @action="cooldown" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { GuiPresetsStatePreset } from '@/store/gui/presets/types'
import { mdiFire, mdiMenuDown, mdiSnowflake } from '@mdi/js'
import ConfirmationDialog from '@/components/dialogs/ConfirmationDialog.vue'

export default defineComponent({
    name: 'TemperaturePanelPresets',
    components: { ConfirmationDialog },
    mixins: [BaseMixin],
    data() {
        return {
            mdiFire: mdiFire,
            mdiMenuDown: mdiMenuDown,
            mdiSnowflake: mdiSnowflake,
            showCoolDownDialog: false,
        }
    },
    computed: {
        presets(): GuiPresetsStatePreset[] {
            return this.$store.getters['gui/presets/getPresets'] ?? []
        },
        cooldownGcode(): string {
            return this.$store.getters['gui/presets/getCooldownGcode']
        },
        confirmOnCoolDown(): boolean {
            return this.$store.state.gui.uiSettings.confirmOnCoolDown
        },
    },
    methods: {
        preheat(preset: GuiPresetsStatePreset): void {
            for (const [name, attributes] of Object.entries(preset.values)) {
                if (attributes.bool) {
                    const splits = name.split(' ')
                    const printerObject = splits[0]
                    const printerObjectName = splits[1] ?? splits[0]

                    // set default heater command
                    let command = 'SET_HEATER_TEMPERATURE'
                    let commandAttribute = 'HEATER'

                    // override command for temperature_fan
                    if (printerObject === 'temperature_fan') {
                        command = 'SET_TEMPERATURE_FAN_TARGET'
                        commandAttribute = 'TEMPERATURE_FAN'
                    }

                    // build gcode
                    const gcode = `${command} ${commandAttribute}=${printerObjectName} TARGET=${attributes.value}`

                    this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
                    this.$socket.emit('printer.gcode.script', { script: gcode })
                }
            }

            if (preset.gcode !== '') {
                setTimeout(() => {
                    this.$store.dispatch('server/addEvent', { message: preset.gcode, type: 'command' })
                    this.$socket.emit('printer.gcode.script', { script: preset.gcode })
                }, 100)
            }
        },
        btnCoolDown(): void {
            if (this.confirmOnCoolDown) {
                this.showCoolDownDialog = true
                return
            }

            this.cooldown()
        },
        cooldown(): void {
            this.$store.dispatch('server/addEvent', { message: this.cooldownGcode, type: 'command' })
            this.$socket.emit('printer.gcode.script', { script: this.cooldownGcode })
        },
    },
})
</script>

<style scoped>
._preset-title {
    font-size: 0.8125rem;
    font-weight: 500;
}

/*
workaround for fixing a transparency issue
which is assumingly a vuetify bug
*/
._fix_transparency {
    background-color: #1e1e1e;
}
</style>
