<template>
    <v-card class="mx-auto fill-height" max-width="300" tile>
        <v-list class="fill-height" density="compact">
            <v-list-item v-if="column < 2">
                <v-row>
                    <v-col cols="auto" class="pr-0 pl-8">
                        <v-icon>{{ mdiInformation }}</v-icon>
                    </v-col>
                    <v-col class="pr-0 text-truncate">
                        {{ $t('Panels.StatusPanel.Headline') }}
                    </v-col>
                    <v-col cols="auto" class="pl-0">
                        <v-icon color="grey lighten-1">{{ mdiLock }}</v-icon>
                    </v-col>
                </v-row>
            </v-list-item>
            <draggable
                v-model="layout"
                handle=".handle"
                class="v-list-item-group fill-height"
                ghost-class="ghost"
                :group="groupname"
                :force-fallback="true">
                <transition-group>
                    <settings-dashboard-sortable-item
                        v-for="element in layout"
                        :key="`item-${element.name}`"
                        :name="element.name"
                        :visible="element.visible"
                        @change-visible="changeVisible" />
                </transition-group>
            </draggable>
        </v-list>
    </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import draggable from 'vuedraggable'
import { mdiInformation, mdiLock } from '@mdi/js'
import DashboardMixin from '@/components/mixins/dashboard'
import SettingsDashboardSortableItem from '@/components/settings/Dashboard/SortableItem.vue'
import { GuiStateLayoutoption } from '@/store/gui/types'

export default defineComponent({
    name: 'SettingsDashboardSortable',
    components: { SettingsDashboardSortableItem, draggable },
    mixins: [DashboardMixin],
    props: {
        viewportName: { type: String, required: true },
        column: { type: Number, required: false, default: 1 },
    },
    data() {
        return {
            /**
             * Icons
             */
            mdiInformation: mdiInformation,
            mdiLock: mdiLock,
        }
    },
    computed: {
        layoutname() {
            if (this.column) return `${this.viewportName}Layout${this.column}`

            return `${this.viewportName}Layout`
        },
        groupname() {
            return `${this.viewportName}Viewport`
        },
        layout: {
            get(): GuiStateLayoutoption[] {
                return this.$store.getters['gui/getPanels'](this.viewportName, this.column) as GuiStateLayoutoption[]
            },
            set(newVal: Array<GuiStateLayoutoption | undefined>) {
                const filteredLayout = newVal.filter((element) => element !== undefined)

                this.$store.dispatch('gui/saveSetting', { name: `dashboard.${this.layoutname}`, value: filteredLayout })
            },
        },
    },
    methods: {
        changeVisible(name: string, newVal: boolean) {
            const index = this.layout.findIndex((element) => element.name === name)
            if (index === -1) return

            const newLayout = [...this.layout]
            newLayout[index] = { ...newLayout[index], visible: newVal }
            this.$store.dispatch('gui/saveSetting', {
                name: `dashboard.${this.layoutname}`,
                value: newLayout,
            })
        },
    },
})
</script>

<style scoped>
/deep/ .ghost {
    opacity: 0.5;
    background: #c8ebfb;
}

.v-list-item-group > span {
    display: block;
    height: 100%;
}
</style>
