<template>
    <v-card flat>
        <v-card-text>
            <v-row>
                <v-col>
                    <settings-dashboard-sortable viewport-name="mobile" :column="0" />
                </v-col>
            </v-row>
            <v-row>
                <v-col class="text-center">
                    <v-btn color="error" @click="resetLayout">{{ $t('Settings.DashboardTab.ResetLayout') }}</v-btn>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import DashboardMixin from '@/components/mixins/dashboard'
import SettingsDashboardSortable from '@/components/settings/Dashboard/Sortable.vue'

export default defineComponent({
    name: 'SettingsDashboardTabMobile',
    components: {
        SettingsDashboardSortable,
    },
    mixins: [DashboardMixin],
    methods: {
        resetLayout() {
            this.$store.dispatch('gui/resetLayout', 'mobileLayout')
        },
    },
})
</script>

<style scoped></style>
