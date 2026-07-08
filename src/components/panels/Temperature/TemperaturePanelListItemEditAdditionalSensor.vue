<template>
    <v-row>
        <v-col cols="12" class="py-1">
            <v-checkbox v-model="value" :label="label" hide-details class="mt-0" />
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'

export default defineComponent({
    name: 'TemperaturePanelListItemEditAdditionalSensor',
    mixins: [BaseMixin],
    props: {
        objectName: { type: String, required: true },
        additionalSensor: { type: String, required: true },
    },
    computed: {
        value: {
            get() {
                return this.$store.getters['gui/getDatasetAdditionalSensorValue']({
                    name: this.objectName,
                    type: this.additionalSensor,
                })
            },
            setvalue(newVal) {
                this.$store.dispatch('gui/setDatasetAdditionalSensorStatus', {
                    objectName: this.objectName,
                    dataset: this.additionalSensor,
                    value: newVal,
                })
            },
        },
        label() {
            return this.$t('Panels.TemperaturePanel.ShowNameInList', {
                name: this.additionalSensor,
            })
        },
    },
})
</script>
