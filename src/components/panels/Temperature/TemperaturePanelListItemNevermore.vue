<template>
    <tr>
        <td class="icon">
            <v-icon :color="iconColor" :class="iconClass" tabindex="-1" @click="showEditDialog = true">
                {{ mdiFan }}
            </v-icon>
        </td>
        <td class="name">
            <span class="cursor-pointer" @click="showEditDialog = true">{{ formatName }}</span>
        </td>
        <td class="text-no-wrap text-center" colspan="3">
            <temperature-panel-list-item-nevermore-value
                :printer-object="printerObject"
                :object-name="objectName"
                :small="false"
                key-name="gas" />
            <temperature-panel-list-item-nevermore-value
                v-for="keyName in nevermoreValues"
                :key="keyName"
                :printer-object="printerObject"
                :object-name="objectName"
                :key-name="keyName" />
            <div v-if="rpm !== null">
                <small :class="rpmClass">{{ rpm }} RPM</small>
            </div>
        </td>
        <temperature-panel-list-item-edit
            v-model="showEditDialog"
            :object-name="objectName"
            :name="name"
            :format-name="formatName"
            additional-sensor-name="nevermore"
            :icon="mdiFan"
            :color="color" />
    </tr>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { convertName } from '@/plugins/helpers'
import { mdiFan } from '@mdi/js'
import { opacityHeaterActive, opacityHeaterInactive } from '@/store/variables'

export default defineComponent({
    name: 'TemperaturePanelListItemNevermore',
    mixins: [BaseMixin],
    props: {
        objectName: { type: String, required: true },
        isResponsiveMobile: { type: Boolean, required: true },
    },
    data() {
        return {
            mdiFan: mdiFan,
            showEditDialog: false,
            nevermoreValues: ['temperature', 'pressure', 'humidity'],
        }
    },
    computed: {
        printerObject() {
            return this.$store.state.printer[this.objectName] ?? {}
        },
        name() {
            const splits = this.objectName.split(' ')
            return splits.length === 1 ? splits[0] : splits[1]
        },
        formatName() {
            return convertName(this.name)
        },
        color() {
            return this.$store.state.gui?.view?.tempchart?.datasetSettings?.[this.objectName]?.color ?? '#ffffff'
        },
        iconColor() {
            // set icon color to active, if no target exists (temperature_sensors) or a heater is active
            if (this.state === null || this.state > 0) return `${this.color}${opacityHeaterActive}`

            return `${this.color}${opacityHeaterInactive}`
        },
        iconClass() {
            const classes = ['_no-focus-style', 'cursor-pointer']

            // add icon animation, when it is a fan and state > 0
            const disableFanAnimation = this.$store.state.gui?.uiSettings.disableFanAnimation ?? false

            if (!disableFanAnimation && (this.state ?? 0) > 0) classes.push('icon-rotate')

            return classes
        },
        state(): number | null {
            return this.printerObject.speed ?? null
        },
        rpm() {
            const rpm = this.printerObject.rpm ?? null

            // return null when rpm doesn't exist
            if (rpm === null) return null

            return parseInt(this.printerObject.rpm)
        },
        rpmClass() {
            if (this.rpm === 0 && (this.printerObject.speed ?? 0) > 0) return 'red--text'

            return ''
        },
    },
})
</script>

<style scoped>
:deep(.v-icon._no-focus-style:focus::after) {
    opacity: 0 !important;
}

:deep(.cursor-pointer) {
    cursor: pointer;
}
</style>
