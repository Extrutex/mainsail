<template>
    <panel
        v-if="klipperReadyForGui && macros.length > 0"
        :icon="mdiCodeTags"
        :title="$t('Panels.MacrosPanel.Headline')"
        :collapsible="true"
        card-class="macros-panel">
        <v-card-text class="py-2">
            <v-row>
                <v-col class="text-center">
                    <macro-button
                        v-for="(macro, index) in macros"
                        :key="'macro_' + index"
                        :macro="macro"
                        color="primary"
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
import MacroButton from '@/components/inputs/MacroButton.vue'
import { mdiCodeTags } from '@mdi/js'
import { PrinterStateMacro } from '@/store/printer/types'

export default defineComponent({
    name: 'MacrosPanel',
    components: { MacroButton, Panel },
    mixins: [BaseMixin],
    data() {
        return {
            mdiCodeTags: mdiCodeTags,
        }
    },
    computed: {
        hiddenMacros() {
            return (this.$store.state.gui?.macros?.hiddenMacros ?? []).map((name: string) => name.toLowerCase())
        },

        macros() {
            const macros = this.$store.getters['printer/getMacros']

            return macros.filter((macro: PrinterStateMacro) => !this.hiddenMacros.includes(macro.name.toLowerCase()))
        },
    },
})
</script>
