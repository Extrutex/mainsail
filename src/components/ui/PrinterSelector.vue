<style scoped></style>

<template>
    <v-menu location="end">
        <template #activator="{ props }">
            <v-icon class="nav-arrow right" v-bind="props">{{ mdiChevronDown }}</v-icon>
        </template>

        <v-list density="compact">
            <v-list-item
                v-for="printer in printers"
                :key="printer._namespace"
                lines="two"
                :disabled="!printer.socket.isConnected"
                link
                @click="changePrinter(printer)">
                <v-list-item-title>{{ getPrinterName(printer._namespace) }}</v-list-item-title>
                <v-list-item-subtitle>{{ getPrinterDescription(printer) }}</v-list-item-subtitle>
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '../mixins/base'
import router from '@/plugins/router'
import { FarmPrinterState } from '@/store/farm/printer/types'
import { mdiChevronDown } from '@mdi/js'

export default defineComponent({
    name: 'PrinterSelector',
    mixins: [BaseMixin],
    data() {
        return {
            /**
             * Icons
             */
            mdiChevronDown: mdiChevronDown,
        }
    },
    computed: {
        displayMenuPoint() {
            return (
                (this.instancesDB !== 'moonraker' && this.countPrinters > 1) ||
                (this.instancesDB === 'moonraker' && this.countPrinters)
            )
        },

        printers() {
            return this.$store.getters['farm/getPrinters']
        },

        countPrinters() {
            return this.$store.getters['farm/countPrinters']
        },

        currentPage() {
            return this.$route.fullPath
        },
    },
    methods: {
        switchToPrinters() {
            router.push('/allPrinters')
        },

        getPrinterName(namespace: string) {
            return this.$store.getters['farm/' + namespace + '/getPrinterName']
        },

        getPrinterDescription(printer: FarmPrinterState) {
            return this.$store.getters['farm/' + printer._namespace + '/getStatus']
        },

        changePrinter(printer: FarmPrinterState) {
            if (printer.socket.isConnected) {
                this.$store.dispatch('changePrinter', { printer: printer._namespace })
            }
        },
    },
})
</script>
