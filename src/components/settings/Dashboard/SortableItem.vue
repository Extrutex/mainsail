<template>
    <v-list-item>
        <v-row>
            <v-col cols="auto" class="px-0">
                <v-icon class="handle pr-2">{{ mdiDragVertical }}</v-icon>
                <v-icon>{{ icon }}</v-icon>
            </v-col>
            <v-col class="pr-0 text-truncate">
                {{ panelname }}
            </v-col>
            <v-col cols="auto" class="pl-2">
                <v-icon
                    :color="checkboxColor"
                    @click.stop="$emit('change-visible', name, !visible)"
                    v-html="checkboxIcon" />
            </v-col>
        </v-row>
    </v-list-item>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mdiCheckboxBlankOutline, mdiCheckboxMarked, mdiDragVertical, mdiInformation } from '@mdi/js'
import DashboardMixin from '@/components/mixins/dashboard'

export default defineComponent({
    name: 'SettingsDashboardSortableItem',
    components: {},
    mixins: [DashboardMixin],
    props: {
        name: { type: String, required: true },
        visible: { type: Boolean, required: true },
    },
    data() {
        return {
            /**
             * Icons
             */
            mdiInformation: mdiInformation,
            mdiDragVertical: mdiDragVertical,
        }
    },
    computed: {
        panelname() {
            return this.getPanelName(this.name)
        },
        icon() {
            return this.convertPanelnameToIcon(this.name)
        },
        checkboxColor() {
            if (this.visible) return 'primary'

            return 'grey lighten-1'
        },
        checkboxIcon() {
            if (this.visible) return mdiCheckboxMarked

            return mdiCheckboxBlankOutline
        },
    },
})
</script>

<style scoped>
.handle {
    cursor: move;
}
</style>
