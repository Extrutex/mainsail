<template>
    <v-row :density="dense ? 'compact' : 'default'">
        <v-col :class="firstColClasses">
            <v-row class="d-flex flex-row">
                <v-col v-if="loading" cols="auto" class="d-flex justify-center align-center pr-0">
                    <v-progress-circular indeterminate color="primary" :size="24" />
                </v-col>
                <v-col v-else-if="icon" cols="auto" class="d-flex justify-center align-center pr-0">
                    <v-icon>{{ icon }}</v-icon>
                </v-col>
                <v-col class="col d-flex justify-center flex-column">
                    <span class="settings-row-title">{{ title }}</span>
                    <span v-if="subTitle" class="settings-row-subtitle">{{ subTitle }}</span>
                </v-col>
            </v-row>
        </v-col>
        <v-col :class="secondColClasses">
            <slot />
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import BaseMixin from '../mixins/base'
import { TranslateResult } from 'vue-i18n'

export default defineComponent({
    name: 'SettingsRow',
    mixins: [BaseMixin],
    props: {
        loading: { type: Boolean, required: false, default: false },
        icon: { type: String, required: false, default: '' },
        title: { type: null as unknown as PropType<string | TranslateResult>, required: true },
        subTitle: { type: null as unknown as PropType<string | TranslateResult>, required: false },
        dynamicSlotWidth: { type: Boolean, required: false, default: false },
        mobileSecondRow: { type: Boolean, required: false, default: false },
        dense: { type: Boolean, default: false },
    },
    computed: {
        firstColClasses() {
            const dense = this.dense ? ' py-1' : ''
            const defaultClasses = ' d-flex justify-center' + dense

            if (this.dynamicSlotWidth) return 'col' + defaultClasses
            else if (this.mobileSecondRow) return 'col-12 col-md-6' + defaultClasses

            return 'col-6' + defaultClasses
        },
        secondColClasses() {
            const dense = this.dense ? ' py-1' : ' settings-row-slot'
            const defaultClasses = ' d-flex justify-end align-center' + dense

            if (this.dynamicSlotWidth) return 'col-auto' + defaultClasses
            else if (this.mobileSecondRow) return 'col-12 col-md-6 pt-0 pt-md-3' + defaultClasses

            return 'col-6' + defaultClasses
        },
    },
})
</script>

<style scoped>
.settings-row-title {
    display: block;
    width: 100%;
    font-weight: bold;
}

.settings-row-subtitle {
    display: block;
    font-size: 0.8em;
    line-height: 1.3;
    margin-top: 3px;
}

.settings-row-slot {
    min-height: 64px;
}
</style>
