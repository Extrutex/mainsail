<template>
    <v-dialog v-model="isOpen" transition="dialog-bottom-transition" max-width="600" :fullscreen="isMobile">
        <template #activator="{ props }">
            <v-btn v-if="inToolbar" icon tile v-bind="props">
                <v-icon size="small">{{ mdiHelp }}</v-icon>
            </v-btn>
            <v-btn
                v-else
                class="gcode-command-btn px-2 minwidth-0"
                color="lightgray"
                :size="isMini ? 'small' : 'default'"
                v-bind="props">
                <v-icon>{{ mdiHelp }}</v-icon>
            </v-btn>
        </template>
        <template #default>
            <panel
                :title="$t('Console.CommandList')"
                :icon="mdiHelp"
                card-class="command-help-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="isOpen = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-title>
                    <v-row>
                        <v-col>
                            <v-text-field
                                v-model="cmdListSearch"
                                :label="$t('Console.Search')"
                                variant="outlined"
                                hide-details
                                clearable
                                density="compact" />
                        </v-col>
                    </v-row>
                </v-card-title>
                <v-divider />
                <overlay-scrollbars-component
                    class="command-help-content"
                    :class="isMobile ? 'mobileHeight' : 'height300'">
                    <v-card-text class="pt-0">
                        <v-list>
                            <command-help-modal-entry
                                v-for="command of helplistFiltered"
                                :key="command"
                                :command="command"
                                @click-on-command="onCommand" />
                        </v-list>
                    </v-card-text>
                </overlay-scrollbars-component>
            </panel>
        </template>
    </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiHelp, mdiCloseThick } from '@mdi/js'
import CommandHelpModalEntry from '@/components/console/CommandHelpModalEntry.vue'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

export default defineComponent({
    name: 'CommandHelpModal',
    components: { CommandHelpModalEntry, Panel, OverlayScrollbarsComponent },
    mixins: [BaseMixin],
    props: {
        isMini: { type: Boolean, required: false, default: false },
        inToolbar: { type: Boolean, required: false, default: false },
    },
    emits: ['onCommand'],
    data() {
        return {
            cmdListSearch: '',
            isOpen: false,

            /**
             * Icons
             */
            mdiHelp: mdiHelp,
            mdiCloseThick: mdiCloseThick,
        }
    },
    computed: {
        helplist(): string[] {
            return Object.keys(this.$store.state.printer.gcode?.commands ?? {})
        },

        helplistFiltered(): string[] {
            return this.helplist
                .filter((cmd) => cmd.includes(this.cmdListSearch.toUpperCase()))
                .sort((a, b) => a.localeCompare(b))
        },
    },
    watch: {
        isOpen(val: boolean) {
            if (val) return

            this.cmdListSearch = ''
        },
    },
    methods: {
        onCommand(gcode: string): void {
            this.$emit('onCommand', gcode)
            this.isOpen = false
        },
    },
})
</script>

<style scoped>
.command-help-content {
    overflow-x: hidden;

    &.height300 {
        height: 300px;
    }

    &.mobileHeight {
        height: calc(var(--app-height) - 48px - 73px);
    }
}
</style>
