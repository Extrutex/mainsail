<template>
    <v-row class="flex-grow-0">
        <v-col class="px-6 pt-6 pb-3 py-4">
            <v-btn density="compact" size="small" class="w-100 elevation-0" @click="showDialog = true">
                {{ name }} > {{ mappedTool }}
            </v-btn>
            <afc-unit-lane-mapping-tool-dialog v-model="showDialog" :name="name" />
        </v-col>
    </v-row>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import AfcMixin from '@/components/mixins/afc'

export default defineComponent({
    name: 'AfcPanelUnitLaneHeader',
    mixins: [BaseMixin, AfcMixin],
    props: {
        name: { type: String, required: true },
    },
    data() {
        return {
            showDialog: false,
        }
    },
    computed: {
        lane() {
            return this.getAfcLaneObject(this.name)
        },
        mappedTool() {
            return this.lane.map ?? '--'
        },
    },
})
</script>
