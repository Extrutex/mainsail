<template>
    <v-card flat>
        <v-card-text>
            <v-row>
                <v-col cols="12" md="6">
                    <settings-dashboard-sortable viewport-name="desktop" :column="1" />
                </v-col>
                <v-col cols="12" md="6">
                    <settings-dashboard-sortable viewport-name="desktop" :column="2" />
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
    name: 'SettingsDashboardTabDesktop',
    components: {
        SettingsDashboardSortable,
    },
    mixins: [DashboardMixin],
    methods: {
        resetLayout() {
            this.$store.dispatch('gui/resetLayout', 'desktopLayout1')
            this.$store.dispatch('gui/resetLayout', 'desktopLayout2')
        },
    },
})
</script>

<style scoped></style>
