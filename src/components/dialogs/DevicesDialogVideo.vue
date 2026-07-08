<template>
    <v-card-text>
        <v-row>
            <v-col class="text-center">
                <v-btn :loading="loading" color="primary" @click="refresh">{{ $t('DevicesDialog.Refresh') }}</v-btn>
            </v-col>
        </v-row>
        <v-row v-if="libcameraDevices.length || filteredV4l2Devices.length" class="mt-0">
            <v-col>
                <devices-dialog-video-device-libcamera
                    v-for="(device, index) in filteredLibcameraDevices"
                    :key="`libcamera_${device.libcamera_id}_${index}`"
                    :device="device" />
                <devices-dialog-video-device-v4l2
                    v-for="(device, index) in filteredV4l2Devices"
                    :key="`v4l2_${device.hardware_bus}_${index}`"
                    :device="device" />
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
import type { LibcameraDevice, V4l2Device } from '@/types/moonraker/MachineRPC'

export default defineComponent({
    name: 'DevicesDialogVideo',
    mixins: [BaseMixin],
    props: {
        hideSystemEntries: { type: Boolean, default: false },
    },
    data() {
        return {
            v4l2Devices: [] as V4l2Device[],
            libcameraDevices: [] as LibcameraDevice[],
            loading: false,
            loaded: false,
        }
    },
    computed: {
        filteredLibcameraDevices(): LibcameraDevice[] {
            if (this.hideSystemEntries) {
                return this.libcameraDevices.filter((device) => !device.libcamera_id.includes('usb@'))
            }

            return this.libcameraDevices
        },

        filteredV4l2Devices(): V4l2Device[] {
            return this.v4l2Devices.filter((device) => {
                if (this.hideSystemEntries) {
                    if (this.libcameraDevices.length === 0 && device.hardware_bus.endsWith('csi')) return true

                    return !device.hardware_bus.startsWith('platform:')
                }

                return true
            })
        },
    },
    methods: {
        async refresh() {
            this.loading = true

            const result = await fetch(this.apiUrl + '/machine/peripherals/video')
                .then((res) => res.json())
                .then((res: { result?: RPCResult<'machine.peripherals.video'> }) => res.result)

            this.v4l2Devices = result?.v4l2_devices ?? []
            this.libcameraDevices = result?.libcamera_devices ?? []

            this.loading = false
            this.loaded = true
        },
    },
})
</script>

<style scoped></style>
