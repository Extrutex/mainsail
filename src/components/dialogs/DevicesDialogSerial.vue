<template>
    <v-card-text>
        <v-row>
            <v-col class="text-center">
                <v-btn :loading="loading" color="primary" @click="refresh">{{ $t('DevicesDialog.Refresh') }}</v-btn>
            </v-col>
        </v-row>
        <v-row v-if="filteredDevices.length" class="mt-0">
            <v-col>
                <v-expansion-panels variant="accordion">
                    <devices-dialog-serial-device
                        v-for="device in filteredDevices"
                        :key="device.path_by_hardware ?? device.device_path"
                        :device="device" />
                </v-expansion-panels>
            </v-col>
        </v-row>
        <v-row v-else-if="loaded" class="mt-0">
            <v-col cols="8" class="mx-auto">
                <p class="text-center text-disabled mb-0">{{ $t('DevicesDialog.NoDeviceFound') }}</p>
            </v-col>
        </v-row>
        <v-row v-else class="mt-0">
            <v-col cols="8" class="mx-auto">
                <p class="text-center text-disabled mb-0">{{ $t('DevicesDialog.ClickRefresh') }}</p>
            </v-col>
        </v-row>
    </v-card-text>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import type { RPCResult } from '@/types/moonraker'
import type { SerialDevice } from '@/types/moonraker/MachineRPC'

export default defineComponent({
    name: 'DevicesDialogSerial',
    mixins: [BaseMixin],
    props: {
        hideSystemEntries: { type: Boolean, default: false },
    },
    data() {
        return {
            devices: [] as SerialDevice[],
            loading: false,
            loaded: false,
        }
    },
    computed: {
        filteredDevices(): SerialDevice[] {
            if (!this.hideSystemEntries) return this.devices

            return this.devices.filter((device) => device.device_type !== 'hardware_uart')
        },
    },
    methods: {
        async refresh() {
            this.loading = true

            this.devices = await fetch(this.apiUrl + '/machine/peripherals/serial')
                .then((res) => res.json())
                .then((res: { result?: RPCResult<'machine.peripherals.serial'> }) => res.result?.serial_devices ?? [])

            this.loading = false
            this.loaded = true
        },
    },
})
</script>

<style scoped></style>
