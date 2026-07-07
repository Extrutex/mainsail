<template>
    <v-col class="pl-6">
        <template v-if="selectAll">
            <v-checkbox
                v-model="selectAllModel"
                :label="$t('Settings.GeneralTab.Everything')"
                hide-details
                class="mt-0"
                :indeterminate="selectAllIndeterminate"
                @update:model-value="$emit('update:selectedCheckboxes', selectedCheckboxes)"></v-checkbox>
            <v-divider class="my-2" />
        </template>
        <template v-for="option in options" :key="option.value">
            <v-checkbox
                v-model="selectedCheckboxes"
                :label="option.label"
                hide-details
                class="mt-0"
                :value="option.value"
                @update:model-value="$emit('update:selectedCheckboxes', selectedCheckboxes)"></v-checkbox>
        </template>
    </v-col>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import BaseMixin from '../mixins/base'
import { TranslateResult } from 'vue-i18n'

export default defineComponent({
    name: 'CheckboxList',
    mixins: [BaseMixin],
    props: {
        options: {
            type: Array as PropType<{ label: string | TranslateResult; value: string }[]>,
            required: true,
        },
        selectAll: { type: Boolean, required: false, default: false },
    },
    emits: ['update:selectedCheckboxes'],
    data() {
        return {
            selectedCheckboxes: [] as (string | TranslateResult)[],
            selectAllIndeterminate: false,
        }
    },
    computed: {
        selectAllModel: {
            get(): boolean {
                return this.getSelectAll()
            },
            set(state: boolean) {
                this.setSelectAll(state)
            },
        },
    },
    methods: {
        getSelectAll(): boolean {
            this.selectAllIndeterminate = false
            if (0 < this.selectedCheckboxes.length && this.selectedCheckboxes.length < this.options.length) {
                this.selectAllIndeterminate = true
                return false
            }

            return this.selectedCheckboxes.length == this.options.length
        },

        setSelectAll(state: boolean) {
            if (state) {
                this.selectedCheckboxes = this.options.map((o) => o.value)
                return
            }

            this.selectedCheckboxes = []
        },
    },
})
</script>
