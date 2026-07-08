<template>
    <v-row class="my-2 mx-0" :style="draggableBgStyle">
        <v-col cols="auto" class="pr-0 d-flex py-2">
            <v-icon class="handle">{{ mdiDragVertical }}</v-icon>
        </v-col>
        <v-col class="py-2">
            <settings-row :title="title" :sub-title="subtitle" :dynamic-slot-width="true">
                <v-icon :color="checkboxColor" @click="changeVisibility" v-html="checkboxIcon" />
            </settings-row>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import NavigationMixin, { NaviPoint } from '@/components/mixins/navigation'
import ThemeMixin from '@/components/mixins/theme'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import draggable from 'vuedraggable'
import { mdiDragVertical, mdiCheckboxMarked, mdiCheckboxBlankOutline } from '@mdi/js'

export default defineComponent({
    name: 'SettingsNavigationTab',
    components: { SettingsRow, draggable },
    mixins: [NavigationMixin, BaseMixin, ThemeMixin],
    props: {
        naviPoint: { type: Object, required: true },
    },
    data() {
        return {
            mdiDragVertical: mdiDragVertical,
        }
    },
    computed: {
        title() {
            return this.naviPoint.title
        },
        subtitle() {
            if (this.naviPoint.type === 'link') return `URL: ${this.naviPoint.href ?? 'Unknown'}`

            return undefined
        },
        checkboxColor() {
            if (this.naviPoint.visible) return 'primary'

            return 'grey lighten-1'
        },
        checkboxIcon() {
            if (this.naviPoint.visible) return mdiCheckboxMarked

            return mdiCheckboxBlankOutline
        },
    },
    methods: {
        changeVisibility() {
            this.$store.dispatch('gui/navigation/changeVisibility', this.naviPoint)
        },
    },
})
</script>
