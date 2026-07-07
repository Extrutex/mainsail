<template>
    <v-tooltip location="end">
        <template #activator="{ props }">
            <v-icon v-bind="props">
                {{ mdiHelpCircleOutline }}
            </v-icon>
        </template>
        <v-container class="version-container pa-0">
            <div><img height="12" src="/img/logo.svg" alt="mainsail-logo" /></div>
            <div>v{{ mainsailVersion }}</div>
            <div>
                <v-icon size="small" class="moonraker-logo">{{ mdiMoonWaningCrescent }}</v-icon>
            </div>
            <div>{{ moonrakerVersion }}</div>
            <div><img height="12" src="/img/klipper.svg" class="klipper-logo" alt="klipper-logo" /></div>
            <div>{{ klipperVersion }}</div>
        </v-container>
    </v-tooltip>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '../mixins/base'
import { mdiCloseThick, mdiHelpCircleOutline, mdiMoonWaningCrescent } from '@mdi/js'

export default defineComponent({
    name: 'AboutDialog',
    mixins: [BaseMixin],
    data() {
        return {
            mdiHelpCircleOutline: mdiHelpCircleOutline,
            mdiCloseThick: mdiCloseThick,
            mdiMoonWaningCrescent: mdiMoonWaningCrescent,
        }
    },
    computed: {
        mainsailVersion(): string {
            return this.$store.state.packageVersion
        },

        klipperVersion(): string {
            return this.$store.state.printer?.software_version ?? ''
        },

        moonrakerVersion(): string {
            return this.$store.state.server?.moonraker_version ?? ''
        },
    },
})
</script>

<style scoped>
.klipper-logo {
    transform: rotate(90deg);
}
.moonraker-logo {
    transform: rotate(45deg);
    color: #ebc815;
}
.version-container {
    display: grid;
    grid-template-columns: 20px auto;
}
</style>
