<template>
    <div>
        <h3 class="text-h5 mb-3">{{ title }}</h3>
        <settings-row
            :title="$t('Panels.AfcPanel.SettingsDialog.BowdenLength')"
            :sub-title="$t('Panels.AfcPanel.SettingsDialog.BowdenLengthDescription')">
            <number-input
                label="afc_bowden_length"
                param="LENGTH"
                :target="currentLength"
                :default-value="settingsLength"
                :output-error-msg="true"
                :has-spinner="true"
                :spinner-factor="1"
                :step="1"
                :min="0"
                :max="null"
                :dec="0"
                unit="mm"
                class="w-100"
                @submit="setBowdenLength" />
        </settings-row>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import AfcMixin from '@/components/mixins/afc'
import { convertName } from '@/plugins/helpers'

export default defineComponent({
    name: 'AfcSettingsDialogHub',
    mixins: [BaseMixin, AfcMixin],
    props: {
        name: { type: String, required: true },
    },
    computed: {
        title() {
            const name = convertName(`Hub ${this.name}`)

            return this.$t('Panels.AfcPanel.SettingsDialog.SettingsForTitle', { name })
        },

        afcSettingsHub() {
            const settings = this.$store.state.printer.configfile?.settings ?? {}
            const name = `AFC_hub ${this.name}`.toLowerCase()

            return settings[name] || {}
        },

        set() {
            return this.afcSettingsHub.afc_bowden_length || 0
        },

        printerObject() {
            const printer = this.$store.state.printer ?? {}
            const key = `AFC_hub ${this.name}`

            return printer[key] ?? {}
        },

        currentLength() {
            return this.printerObject.afc_bowden_length || 0
        },
    },
    methods: {
        doSend(gcode: string) {
            this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
            this.$socket.emit('printer.gcode.script', { script: gcode })
        },

        setBowdenLength(args: { name: string; value: number }) {
            const gcode = `SET_BOWDEN_LENGTH HUB=${this.name} ${args.name}=${args.value}`
            this.doSend(gcode)
        },
    },
})
</script>
