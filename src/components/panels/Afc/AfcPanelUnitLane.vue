<template>
    <div class="grey flex-grow-1 afc-unit-lane d-flex flex-column" :class="laneStatusClass">
        <afc-panel-unit-lane-header :name="name" />
        <template v-if="laneReady">
            <afc-panel-unit-lane-body :name="name" />
            <afc-panel-unit-lane-actions :name="name" />
        </template>
        <afc-panel-unit-lane-empty v-else :name="name" />
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import AfcMixin from '@/components/mixins/afc'

export default defineComponent({
    name: 'AfcPanelUnitLane',
    mixins: [BaseMixin, AfcMixin],
    props: {
        name: { type: String, required: true },
    },
    computed: {
        lane() {
            return this.getAfcLaneObject(this.name)
        },
        laneActive() {
            const activeLaneName = this.afcCurrentLane?.name ?? ''

            return this.name === activeLaneName
        },
        laneStatusClass() {
            return {
                'darken-3': this.$vuetify.theme.dark,
                'lighten-2': !this.$vuetify.theme.dark,
                'border-error': this.laneActive && this.afcErrorState,
                'border-success': this.laneActive && !this.afcErrorState,
            }
        },
        laneReady() {
            return this.lane.load && this.lane.prep
        },
    },
})
</script>

<style scoped>
.afc-unit-lane {
    border-radius: 8px;
    box-sizing: border-box !important;
    border-width: 1px;
    border-style: solid;
    flex-basis: 0;
}

.v-application .border-error {
    border-color: var(--v-error-base) !important;
}

.v-application .border-success {
    border-color: var(--v-primary-base) !important;
}
</style>
