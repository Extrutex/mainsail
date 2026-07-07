<style scoped></style>

<template>
    <v-card-text class="pa-0">
        <v-container class="py-0">
            <v-row class="text-center pt-5 pb-2 mb-0" align="center">
                <v-col cols="3" class="pa-0">
                    <strong>{{ $t('Panels.StatusPanel.Filament') }}</strong>
                    <br />
                    <span class="text-no-wrap">
                        {{ outputFilamentUsed }}
                    </span>
                </v-col>
                <v-col cols="3" class="pa-0">
                    <strong>{{ $t('Panels.StatusPanel.Slicer') }}</strong>
                    <br />
                    <span class="text-no-wrap">
                        {{ 'estimated_time' in current_file ? formatTime(current_file.estimated_time) : '--' }}
                    </span>
                </v-col>
                <v-col cols="3" class="pa-0">
                    <strong>{{ $t('Panels.StatusPanel.Print') }}</strong>
                    <br />
                    <span class="text-no-wrap">{{ print_time ? formatTime(print_time) : '--' }}</span>
                </v-col>
                <v-col cols="3" class="pa-0">
                    <strong>{{ $t('Panels.StatusPanel.Total') }}</strong>
                    <br />
                    <span class="text-no-wrap">
                        {{ print_time_total ? formatTime(print_time_total) : '--' }}
                    </span>
                </v-col>
            </v-row>
        </v-container>
    </v-card-text>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'

export default defineComponent({
    name: 'StatusPanelPrintstatusComplete',
    components: {},
    mixins: [BaseMixin],
    computed: {
        current_file() {
            return this.$store.state.printer.current_file ?? {}
        },

        filament_used() {
            return this.$store.state.printer.print_stats?.filament_used ?? 0
        },

        outputFilamentUsed() {
            return this.filament_used >= 1000
                ? (this.filament_used / 1000).toFixed(2) + ' m'
                : this.filament_used.toFixed(2) + ' mm'
        },

        print_time() {
            return this.$store.state.printer.print_stats?.print_duration ?? 0
        },

        print_time_total() {
            return this.$store.state.printer.print_stats?.total_duration ?? 0
        },
    },
    methods: {
        formatTime(seconds: number) {
            const h = Math.floor(seconds / 3600)
            seconds %= 3600
            const m = ('0' + Math.floor(seconds / 60)).slice(-2)
            const s = ('0' + (seconds % 60).toFixed(0)).slice(-2)

            return h + ':' + m + ':' + s
        },
    },
})
</script>
