<template>
    <v-dialog v-model="showDialog" width="800" persistent :fullscreen="isMobile">
        <panel
            :title="setActiveSpool ? $t('Panels.SpoolmanPanel.ChangeSpool') : $t('Panels.SpoolmanPanel.SelectSpool')"
            :icon="mdiAdjust"
            card-class="spoolman-change-spool-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="close">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-title>
                <v-text-field
                    v-model="search"
                    :append-inner-icon="mdiMagnify"
                    :label="$t('Panels.SpoolmanPanel.Search')"
                    variant="outlined"
                    density="compact"
                    hide-details
                    style="max-width: 300px" />
                <v-spacer />
                <v-btn
                    v-if="afcLane"
                    :title="$t('Panels.SpoolmanPanel.EjectSpool')"
                    class="px-2 minwidth-0 ml-3"
                    :loading="loadings.includes('ejectSpool')"
                    @click="ejectSpool">
                    <v-icon>{{ mdiEject }}</v-icon>
                </v-btn>
                <v-btn
                    :title="$t('Panels.SpoolmanPanel.Refresh')"
                    class="px-2 minwidth-0 ml-3"
                    :loading="loadings.includes('refreshSpools')"
                    @click="refreshSpools">
                    <v-icon>{{ mdiRefresh }}</v-icon>
                </v-btn>
                <v-btn
                    v-if="spoolManagerUrl"
                    :title="$t('Panels.SpoolmanPanel.OpenSpoolManager')"
                    class="px-2 minwidth-0 ml-3"
                    @click="openSpoolManager">
                    <v-icon>{{ mdiDatabase }}</v-icon>
                </v-btn>
            </v-card-title>
            <v-card-text class="px-0 pb-0">
                <v-data-table
                    :headers="headers"
                    :items="spools"
                    item-value="id"
                    :search="search"
                    :sort-by="[{ key: 'last_used', order: 'desc' }]"
                    :custom-filter="customFilter">
                    <template #no-data>
                        <div class="text-center">{{ $t('Panels.SpoolmanPanel.NoSpools') }}</div>
                    </template>
                    <template #no-results>
                        <div class="text-center">{{ $t('Panels.SpoolmanPanel.NoResults') }}</div>
                    </template>

                    <template #item="{ item }">
                        <SpoolmanChangeSpoolDialogRow
                            :key="item.id"
                            :spool="item"
                            :max_id_digits="max_spool_id_digits"
                            @set-spool="setSpool" />
                    </template>
                </v-data-table>
            </v-card-text>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick, mdiAdjust, mdiDatabase, mdiMagnify, mdiRefresh, mdiEject } from '@mdi/js'
import { ServerSpoolmanStateSpool } from '@/store/server/spoolman/types'
import SpoolmanChangeSpoolDialogRow from '@/components/dialogs/SpoolmanChangeSpoolDialogRow.vue'

export default defineComponent({
    name: 'SpoolmanChangeSpoolDialog',
    components: { SpoolmanChangeSpoolDialogRow, Panel },
    mixins: [BaseMixin],
    props: {
        modelValue: { type: Boolean, default: false },
        tool: { type: String, required: false, default: null },
        afcLane: { type: String, required: false, default: null },
        setActiveSpool: { type: Boolean, required: false, default: true },
    },
    emits: ['update:modelValue', 'select-spool'],
    data() {
        return {
            mdiAdjust: mdiAdjust,
            mdiCloseThick: mdiCloseThick,
            mdiDatabase: mdiDatabase,
            mdiEject: mdiEject,
            mdiMagnify: mdiMagnify,
            mdiRefresh: mdiRefresh,

            search: '',
        }
    },
    computed: {
        showDialog: {
            get(): boolean {
                return this.modelValue
            },
            set(newVal: boolean) {
                this.$emit('update:modelValue', newVal)
            },
        },
        spools(): ServerSpoolmanStateSpool[] {
            return this.$store.state.server.spoolman.spools ?? []
        },
        max_spool_id_digits(): number {
            const max_id = this.$store.state.server.spoolman.spools.reduce(
                (x: number, s: ServerSpoolmanStateSpool) => Math.max(x, s.id),
                0
            )

            return max_id.toString().length
        },
        headers() {
            return [
                {
                    title: ' ',
                    align: 'start',
                    sortable: false,
                },
                {
                    title: this.$t('Panels.SpoolmanPanel.Filament'),
                    align: 'start',
                    key: 'filament.name',
                    sortable: false,
                },
                {
                    title: this.$t('Panels.SpoolmanPanel.Material'),
                    align: 'center',
                    key: 'filament.material',
                },
                {
                    title: this.$t('Panels.SpoolmanPanel.LastUsed'),
                    align: 'end',
                    key: 'last_used',
                },
                {
                    title: this.$t('Panels.SpoolmanPanel.Weight'),
                    align: 'end',
                    key: 'remaining_weight',
                },
            ]
        },
        existsSaveVariables() {
            const settings = this.$store.state.printer.configfile?.settings ?? {}

            return 'save_variables' in settings
        },
    },
    methods: {
        openSpoolManager() {
            window.open(this.spoolManagerUrl, '_blank')
        },
        refresh() {
            this.$store.dispatch('server/spoolman/refreshSpools')
        },
        close() {
            this.showDialog = false
        },
        refreshSpools() {
            this.$store.dispatch('server/spoolman/refreshSpools')
        },
        customFilter(_value: unknown, search: string, item: unknown): boolean {
            // Vuetify 3 passes an internal item object with the original item in `raw`
            const spool = ((item as { raw?: ServerSpoolmanStateSpool })?.raw ?? item) as ServerSpoolmanStateSpool

            if (search.trim().startsWith('web+spoolman:s-')) {
                const spoolId = parseInt(search.split('-')[1] ?? -1)
                return spool.id === spoolId
            }

            const querySplits = search.toLowerCase().split(' ')
            const searchArray = [
                spool.id.toString(),
                spool.comment,
                spool.filament.name,
                spool.filament.vendor.name,
                spool.filament.material,
                spool.location,
            ]

            for (const query of querySplits) {
                const result = searchArray.some((q) => q?.toLowerCase().includes(query))

                if (!result) return false
            }

            return true
        },
        setSpool(spool: ServerSpoolmanStateSpool) {
            // If dialog is used for selection only, bypass setting of active spool and propogate event
            if (!this.setActiveSpool) {
                this.$emit('select-spool', spool)
                this.close()
                return
            }

            // if afcLane is set, execute SET_SPOOL_ID and close, because it's not an active printing spool change
            if (this.afcLane) {
                this.sendGcode(`SET_SPOOL_ID LANE=${this.afcLane} SPOOL_ID=${spool.id}`)
                this.close()
                return
            }

            // if tool is set, execute setMacroVariable and close, because it's not an active printing spool change
            if (this.tool) {
                this.setMacroVariable(spool)
                this.close()
                return
            }

            this.$store.dispatch('server/spoolman/setActiveSpool', spool.id)

            this.close()
        },
        setMacroVariable(spool: ServerSpoolmanStateSpool) {
            // Set spool_id for tool
            this.sendGcode(`SET_GCODE_VARIABLE MACRO=${this.tool} VARIABLE=spool_id VALUE=${spool.id}`)

            // Close dialog if save_variables is not enabled
            if (!this.existsSaveVariables) {
                this.close()
                return
            }

            // Set spool_id to save_variable
            this.sendGcode(`SAVE_VARIABLE VARIABLE=${this.tool?.toLowerCase()}__spool_id VALUE=${spool.id}`)
        },
        sendGcode(gcode: string) {
            this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
            this.$socket.emit('printer.gcode.script', { script: gcode })
        },
        ejectSpool() {
            this.sendGcode(`SET_SPOOL_ID LANE=${this.afcLane} SPOOL_ID=`)
            this.close()
        },
    },
    watch: {
        showDialog(newVal: boolean) {
            if (!newVal) return

            this.refresh()
            this.search = ''
        },
    },
})
</script>
