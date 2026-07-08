<template>
    <v-container class="px-0 py-2">
        <v-row>
            <v-col class="pb-3">
                <v-subheader class="_miscellaneous-sensor-subheader">
                    <v-icon size="small" class="mr-2">{{ unitToSymbol(unit) }}</v-icon>
                    <span>{{ convertName(name) }}</span>
                    <v-spacer />
                    <span>{{ output }}</span>
                </v-subheader>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { convertName, unitToSymbol } from '@/plugins/helpers'
import BaseMixin from '@/components/mixins/base'
import {} from '@mdi/js'

export default defineComponent({
    name: 'MiscellaneousSensor',
    mixins: [BaseMixin],
    props: {
        name: { type: String, required: true },
        value: { type: Number, required: true },
        unit: { type: String, required: false },
    },
    data() {
        return {
            convertName: convertName,
            unitToSymbol: unitToSymbol,
        }
    },
    computed: {
        output() {
            const value = isNaN(this.value) ? '--' : this.value

            if (this.unit === null) return this.value

            return `${value} ${this.unit}`
        },
    },
})
</script>

<style scoped>
._miscellaneous-sensor-subheader {
    height: auto;
}
</style>
