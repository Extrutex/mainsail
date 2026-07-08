<template>
    <div>
        <v-row>
            <v-col class="pb-0 d-flex flex-row justify-space-between align-center">
                <h3 class="text-h6">
                    <v-icon v-if="modulIcon" start>{{ modulIcon }}</v-icon>
                    {{ unitNameOutput }}
                </h3>
                <v-spacer />
                <afc-panel-unit-hub v-for="hub in hubs" :key="hub" :name="hub" />
            </v-col>
        </v-row>
        <v-row>
            <v-col class="d-flex flex-row flex-wrap afc-unit-container">
                <afc-panel-unit-lane v-for="lane in lanes" :key="lane" :name="lane" />
            </v-col>
        </v-row>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import AfcMixin from '@/components/mixins/afc'
import { afcIconBoxTurtle, afcIconHtlf, afcIconNightOwl, afcIconQuattroBox } from '@/plugins/afcIcons'
import { convertName } from '@/plugins/helpers'

export default defineComponent({
    name: 'AfcPanelUnit',
    mixins: [BaseMixin, AfcMixin],
    props: {
        name: { type: String, required: true },
    },
    computed: {
        unitName() {
            return this.name.substring(this.name.indexOf(' ') + 1)
        },
        unitNameOutput() {
            return convertName(this.unitName)
        },
        unit() {
            const printer = this.$store.state.printer ?? {}
            const moduleName = this.name.substring(0, this.name.indexOf(' ')).replaceAll('_', '')
            const unitObjectName = `AFC_${moduleName} ${this.unitName}`.toLowerCase()
            const objectName = Object.keys(printer).find((key) => key.toLowerCase() === unitObjectName) ?? ''

            return printer[objectName] ?? {}
        },
        hubs() {
            return this.unit.hubs ?? []
        },
        lanes() {
            return this.unit.lanes ?? []
        },
        type() {
            const moduleName = this.name.substring(0, this.name.indexOf(' ')).replaceAll('_', '')

            return moduleName.toLowerCase()
        },
        modulIcon() {
            if (!this.afcShowUnitIcons) return null

            switch (this.type) {
                case 'boxturtle':
                    return afcIconBoxTurtle
                case 'htlf':
                    return afcIconHtlf
                case 'nightowl':
                    return afcIconNightOwl
                case 'quattrobox':
                    return afcIconQuattroBox
                default:
                    return null
            }
        },
    },
})
</script>

<style scoped>
.afc-unit-container {
    gap: 16px;
}
</style>
