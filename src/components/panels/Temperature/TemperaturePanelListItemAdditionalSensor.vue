<template>
    <div>
        <temperature-panel-list-item-additional-sensor-value
            v-for="keyName of additionalValues"
            :key="keyName"
            :printer-object="printerObject"
            :object-name="objectName"
            :key-name="keyName" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'

export default defineComponent({
    name: 'TemperaturePanelListItemAdditionalSensor',
    mixins: [BaseMixin],
    props: {
        objectName: { type: String, required: true },
        additionalObjectName: { type: String, required: true },
    },
    computed: {
        printerObject() {
            if (!(this.additionalObjectName in this.$store.state.printer)) return {}

            return this.$store.state.printer[this.additionalObjectName]
        },
        additionalValues() {
            if (this.objectName === 'z_thermal_adjust') return ['current_z_adjust']

            return Object.keys(this.printerObject).filter((key) => key !== 'temperature')
        },
    },
})
</script>
