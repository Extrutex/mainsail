<template>
    <v-row>
        <v-col class="px-6 pt-3 pb-6 d-flex flex-row justify-space-between">
            <v-item-group class="_btn-group d-flex flex-nowrap w-100 py-0">
                <v-tooltip v-if="toolLoaded" top>
                    <template #activator="{ props }">
                        <v-btn
                            :disabled="printerIsPrintingOnly"
                            density="compact"
                            class="flex-grow-1 px-0 first-btn"
                            v-bind="props"
                            @click="unloadLane">
                            <v-icon size="small">{{ mdiArrowUpBold }}</v-icon>
                        </v-btn>
                    </template>
                    <span>{{ $t('Panels.AfcPanel.UnloadLane') }}</span>
                </v-tooltip>
                <v-tooltip v-else top>
                    <template #activator="{ props }">
                        <v-btn
                            :disabled="printerIsPrintingOnly"
                            density="compact"
                            class="flex-grow-1 px-0 first-btn"
                            v-bind="props"
                            @click="loadLane">
                            <v-icon size="small">{{ mdiArrowDownBold }}</v-icon>
                        </v-btn>
                    </template>
                    <span>{{ $t('Panels.AfcPanel.LoadLane') }}</span>
                </v-tooltip>
                <v-tooltip top>
                    <template #activator="{ props }">
                        <v-btn
                            :disabled="toolLoaded || (!laneRunout && toolLoaded)"
                            density="compact"
                            class="flex-grow-1 px-0 last-btn"
                            v-bind="props"
                            @click="ejectLane">
                            <v-icon size="small">{{ mdiEject }}</v-icon>
                        </v-btn>
                    </template>
                    <span>{{ $t('Panels.AfcPanel.EjectFilament') }}</span>
                </v-tooltip>
            </v-item-group>
        </v-col>
    </v-row>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import AfcMixin from '@/components/mixins/afc'
import ExtruderMixin from '@/components/mixins/extruder'
import { mdiArrowDownBold, mdiArrowUpBold, mdiEject } from '@mdi/js'

export default defineComponent({
    name: 'AfcPanelUnitLaneActions',
    mixins: [BaseMixin, AfcMixin, ExtruderMixin],
    props: {
        name: { type: String, required: true },
    },
    data() {
        return {
            mdiArrowUpBold: mdiArrowUpBold,
            mdiArrowDownBold: mdiArrowDownBold,
            mdiEject: mdiEject,
        }
    },
    computed: {
        lane() {
            return this.getAfcLaneObject(this.name)
        },
        laneActive() {
            const activeLaneName = this.afcCurrentLane?.name ?? ''

            return this.name === activeLaneName
        },
        laneRunout() {
            return this.laneActive && !this.lane.prep
        },
        toolLoaded() {
            return this.lane.tool_loaded ?? false
        },
    },
    methods: {
        loadLane() {
            this.doSend(`CHANGE_TOOL LANE=${this.name}`)
        },
        unloadLane() {
            this.doSend(`TOOL_UNLOAD LANE=${this.name}`)
        },
        ejectLane() {
            this.doSend(`LANE_UNLOAD LANE=${this.name}`)
        },
        doSend(gcode: string) {
            this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
            this.$socket.emit('printer.gcode.script', { script: gcode })
        },
    },
})
</script>

<style scoped>
._btn-group {
    border-radius: 4px;

    .v-btn {
        border-radius: 0;
        border-color: rgba(255, 255, 255, 0.12);
        border-style: solid;
        border-width: thin;
        box-shadow: none;
        height: 28px;
        opacity: 0.8;
        min-width: auto !important;
    }

    .v-btn.first-btn {
        border-top-left-radius: inherit;
        border-bottom-left-radius: inherit;
    }

    .v-btn.last-btn {
        border-top-right-radius: inherit;
        border-bottom-right-radius: inherit;
    }

    .v-btn:not(.first-btn) {
        border-left-width: 0;
    }
}

html.theme--light ._btn-group .v-btn {
    border-color: rgba(0, 0, 0, 0.12);
}
</style>
