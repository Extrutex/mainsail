<template>
    <div class="d-flex flex-column">
        <v-row :class="consoleDirection === 'table' ? 'order-0' : 'order-1 mt-3'">
            <v-col>
                <console-textarea ref="gcodeCommandField" />
            </v-col>

            <v-col cols="auto" class="d-flex align-center">
                <v-btn class="mr-3 px-2 minwidth-0" color="lightgray" @click="clearConsole">
                    <v-icon>{{ mdiTrashCan }}</v-icon>
                </v-btn>
                <command-help-modal @onCommand="commandClick($event)" />
                <v-menu
                    :location="consoleDirection === 'shell' ? 'top' : 'bottom'"
                    :close-on-content-click="false"
                    :title="$t('Console.SetupConsole')">
                    <template #activator="{ props }">
                        <v-btn class="ml-3 px-2 minwidth-0" color="lightgray" v-bind="props">
                            <v-icon>{{ mdiCog }}</v-icon>
                        </v-btn>
                    </template>
                    <v-list>
                        <v-list-item v-if="consoleDirection === 'shell'" class="minHeight36">
                            <v-checkbox
                                v-model="autoscroll"
                                class="mt-0"
                                hide-details
                                :label="$t('Panels.MiniconsolePanel.Autoscroll')" />
                        </v-list-item>
                        <v-list-item class="minHeight36">
                            <v-checkbox
                                v-model="hideWaitTemperatures"
                                class="mt-0"
                                hide-details
                                :label="$t('Console.HideTemperatures')" />
                        </v-list-item>
                        <v-list-item v-if="moonrakerComponents.includes('timelapse')" class="minHeight36">
                            <v-checkbox
                                v-model="hideTlCommands"
                                class="mt-0"
                                hide-details
                                :label="$t('Console.HideTimelapse')" />
                        </v-list-item>
                        <v-list-item v-for="(filter, index) in customFilters" :key="index" class="minHeight36">
                            <v-checkbox
                                v-model="filter.bool"
                                class="mt-0"
                                hide-details
                                :label="filter.name"
                                @update:model-value="toggleFilter(index, filter)" />
                        </v-list-item>
                        <v-list-item class="minHeight36">
                            <v-checkbox
                                v-model="rawOutput"
                                class="mt-0"
                                hide-details
                                :label="$t('Panels.MiniconsolePanel.RawOutput')" />
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-col>
        </v-row>
        <v-row :class="consoleDirection === 'table' ? 'order-1' : 'order-0 mt-0'">
            <v-col :class="consoleDirection === 'table' ? '' : 'pt-0'">
                <v-card>
                    <v-card-text class="pa-0">
                        <overlay-scrollbars-component
                            ref="consoleScroll"
                            class="consoleScrollContainer d-flex flex-column">
                            <console-table
                                ref="console"
                                :is-mini="false"
                                :events="events"
                                @command-click="commandClick" />
                        </overlay-scrollbars-component>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import ConsoleTable from '@/components/console/ConsoleTable.vue'
import CommandHelpModal from '@/components/console/CommandHelpModal.vue'
import { mdiCog, mdiTrashCan } from '@mdi/js'
import ConsoleMixin from '@/components/mixins/console'
import ConsoleTextarea from '@/components/inputs/ConsoleTextarea.vue'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

export default defineComponent({
    name: 'PageConsole',
    components: {
        CommandHelpModal,
        ConsoleTable,
        ConsoleTextarea,
        OverlayScrollbarsComponent,
    },
    mixins: [BaseMixin, ConsoleMixin],
    data() {
        return {
            mdiCog: mdiCog,
            mdiTrashCan: mdiTrashCan,
        }
    },
    computed: {
        events() {
            return this.$store.getters['server/getConsoleEvents'](this.consoleDirection === 'table')
        },
    },
    watch: {
        events() {
            if (this.consoleDirection === 'shell' && this.autoscroll) {
                setTimeout(() => {
                    this.scrollToBottom()
                }, 50)
            }
        },

        autoscroll(newVal: boolean) {
            if (newVal) this.scrollToBottom()
        },
    },
    mounted() {
        if (this.consoleDirection === 'shell') this.scrollToBottom()
    },
    methods: {
        commandClick(msg: string): void {
            const gcodeCommandField = this.$refs.gcodeCommandField as InstanceType<typeof ConsoleTextarea> | undefined
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(gcodeCommandField as any)?.setGcode(msg)
        },

        scrollToBottom() {
            this.$nextTick(() => {
                const consoleScroll = this.$refs.consoleScroll as InstanceType<typeof OverlayScrollbarsComponent> | null
                if (!consoleScroll) return

                const viewport = consoleScroll.osInstance()?.elements().viewport
                viewport?.scrollTo({ top: viewport.scrollHeight })
            })
        },
    },
})
</script>

<style scoped>
.consoleScrollContainer {
    min-height: 200px;
    height: calc(var(--app-height) - 180px);
}

.gcode-command-field {
    font-family: 'Roboto Mono', monospace;
}
</style>
