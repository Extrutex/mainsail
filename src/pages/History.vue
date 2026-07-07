<template>
    <div>
        <v-row>
            <v-col>
                <history-statistics-panel />
            </v-col>
        </v-row>
        <v-row class="mt-0">
            <v-col>
                <history-list-panel />
            </v-col>
        </v-row>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import HistoryListPanel from '@/components/panels/HistoryListPanel.vue'
import HistoryStatisticsPanel from '@/components/panels/HistoryStatisticsPanel.vue'

export default defineComponent({
    name: 'PageHistory',
    components: { HistoryListPanel, HistoryStatisticsPanel },
    mixins: [BaseMixin],
})
</script>
