<template>
    <panel
        v-if="socketIsConnected && klipperState !== 'disconnected'"
        :icon="mdiConsoleLine"
        :title="$t('Panels.MiniconsolePanel.Headline')"
        :collapsible="true"
        card-class="miniconsole-panel"
        :hide-buttons-on-collapse="true">
        <template #buttons>
            <v-btn icon tile @click="clearConsole">
                <v-icon size="small">{{ mdiTrashCan }}</v-icon>
            </v-btn>
            <command-help-modal :in-toolbar="true" @onCommand="commandClick($event)" />
            <v-menu
                location="bottom"
                :close-on-content-click="false"
                :title="$t('Panels.MiniconsolePanel.SetupConsole')">
                <template #activator="{ props }">
                    <v-btn icon tile v-bind="props">
                        <v-icon size="small">{{ mdiCog }}</v-icon>
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
                            :label="$t('Panels.MiniconsolePanel.HideTemperatures')" />
                    </v-list-item>
                    <v-list-item v-if="moonrakerComponents.includes('timelapse')" class="minHeight36">
                        <v-checkbox
                            v-model="hideTlCommands"
                            class="mt-0"
                            hide-details
                            :label="$t('Panels.MiniconsolePanel.HideTimelapse')" />
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
        </template>
        <div class="d-flex flex-column">
            <v-card-text :class="consoleDirection === 'table' ? 'order-1' : 'order-2'">
                <console-textarea ref="gcodeCommandField" />
            </v-card-text>
            <v-card-text :class="(consoleDirection === 'table' ? 'order-2' : 'order-1') + ' pa-0'">
                <v-row>
                    <v-col>
                        <overlay-scrollbars-component
                            ref="miniConsoleScroll"
                            :style="'height: ' + consoleHeight + 'px;'"
                            :options="{}">
                            <console-table
                                ref="console"
                                :events="events"
                                :is-mini="true"
                                @command-click="commandClick" />
                            <v-divider />
                        </overlay-scrollbars-component>
                    </v-col>
                </v-row>
            </v-card-text>
        </div>
    </panel>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import ConsoleTable from '@/components/console/ConsoleTable.vue'
import Panel from '@/components/ui/Panel.vue'
import { mdiCog, mdiConsoleLine, mdiTrashCan } from '@mdi/js'
import CommandHelpModal from '@/components/console/CommandHelpModal.vue'
import ConsoleMixin from '@/components/mixins/console'
import ConsoleTextarea from '@/components/inputs/ConsoleTextarea.vue'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

export default defineComponent({
    name: 'MiniconsolePanel',
    components: {
        Panel,
        ConsoleTable,
        CommandHelpModal,
        OverlayScrollbarsComponent,
    },
    mixins: [BaseMixin, ConsoleMixin],
    data() {
        return {
            mdiTrashCan: mdiTrashCan,
            mdiConsoleLine: mdiConsoleLine,
            mdiCog: mdiCog,
        }
    },
    computed: {
        consoleHeight() {
            return this.$store.state.gui.console.height ?? 300
        },

        events() {
            return this.$store.getters['server/getConsoleEvents'](this.consoleDirection === 'table', 250)
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
    methods: {
        commandClick(msg: string): void {
            const gcodeCommandField = this.$refs.gcodeCommandField as InstanceType<typeof ConsoleTextarea>
            gcodeCommandField.setGcode(msg)
        },

        scrollToBottom() {
            this.$nextTick(() => {
                this.scrollTo(100)
            })
        },

        scrollToTop() {
            this.$nextTick(() => {
                this.scrollTo(0)
            })
        },

        scrollTo(position: number) {
            const miniConsoleScroll = this.$refs.miniConsoleScroll as InstanceType<
                typeof OverlayScrollbarsComponent
            > | null
            if (!miniConsoleScroll) return

            const viewport = miniConsoleScroll.osInstance()?.elements().viewport
            viewport?.scrollTo({ top: ((viewport.scrollHeight - viewport.clientHeight) * position) / 100 })
        },
    },
    mounted() {
        if (this.consoleDirection === 'shell') this.scrollToBottom()
    },
})
</script>

<style scoped>
.consoleTable {
    border-top: 1px solid rgba(255, 255, 255, 0.12);
}

html.theme--light .consoleTable {
    border-top: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
