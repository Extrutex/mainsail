<template>
    <overlay-scrollbars-component style="max-height: 400px; overflow-x: hidden">
        <v-card-text>
            <v-row>
                <v-col class="text-center">
                    <v-btn :loading="loading" color="primary" @click="refresh">{{ $t('DevicesDialog.Refresh') }}</v-btn>
                </v-col>
            </v-row>
            <v-row v-if="devices.length" class="mt-0">
                <v-col>
                    <devices-dialog-can-device v-for="device in devices" :key="device.uuid" :device="device" />
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
            <v-row v-if="devices.length === 0">
                <v-col>
                    <v-alert density="compact" variant="outlined" type="info" :icon="mdiInformationVariantCircle">
                        {{ $t('DevicesDialog.CanBusInfo') }}
                        <v-row class="my-0">
                            <v-col class="text-center">
                                <v-btn
                                    href="https://docs.mainsail.xyz/overview/features/query-devices#can-devices"
                                    color="info"
                                    variant="outlined"
                                    size="small">
                                    open guide
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-alert>
                </v-col>
            </v-row>
        </v-card-text>
    </overlay-scrollbars-component>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'
import BaseMixin from '@/components/mixins/base'
import DevicesDialogCanDevice from '@/components/dialogs/DevicesDialogCanDevice.vue'
import { mdiInformationVariantCircle } from '@mdi/js'
import type { RPCResult } from '@/types/moonraker'
import type { CanDevice } from '@/types/moonraker/MachineRPC'

export default defineComponent({
    name: 'DevicesDialogCan',
    components: { DevicesDialogCanDevice, OverlayScrollbarsComponent },
    mixins: [BaseMixin],
    props: {
        name: { type: String, required: true },
        hideSystemEntries: { type: Boolean, default: false },
    },
    data() {
        return {
            mdiInformationVariantCircle: mdiInformationVariantCircle,
            devices: [] as CanDevice[],
            loading: false,
            loaded: false,
        }
    },
    methods: {
        async refresh() {
            this.loading = true

            this.devices = await fetch(`${this.apiUrl}/machine/peripherals/canbus?interface=${this.name}`)
                .then((res) => res.json())
                .then((res: { result?: RPCResult<'machine.peripherals.canbus'> }) => res.result?.can_uuids ?? [])

            this.loading = false
            this.loaded = true
        },
    },
})
</script>

<style scoped></style>
