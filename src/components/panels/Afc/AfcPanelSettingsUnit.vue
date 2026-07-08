<template>
    <v-list-item class="minHeight36 text-no-wrap">
        <v-checkbox v-model="value" class="mt-0" hide-details :label="label" />
    </v-list-item>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import AfcMixin from '@/components/mixins/afc'
import { convertName } from '@/plugins/helpers'

export default defineComponent({
    name: 'AfcPanelSettingsUnit',
    mixins: [BaseMixin, AfcMixin],
    props: {
        name: { type: String, required: true },
    },
    data() {
        return {
            value: true,
        }
    },
    computed: {
        label() {
            const unitName = this.name.substring(this.name.indexOf(' ') + 1)

            return this.$t(`Panels.AfcPanel.ShowUnit`, { name: convertName(unitName) }) as string
        },
    },
    watch: {
        value(newValue: boolean) {
            if (newValue) {
                this.removeFromHiddenUnits(this.name)
                return
            }

            this.addToHiddenUnits(this.name)
        },
    },
    mounted() {
        this.value = !this.afcHiddenUnits.includes(this.name)
    },
    methods: {
        removeFromHiddenUnits(name: string) {
            const hiddenUnits = [...this.afcHiddenUnits]
            const index = hiddenUnits.indexOf(name)
            if (index > -1) hiddenUnits.splice(index, 1)

            this.$store.dispatch('gui/saveSetting', { name: 'view.afc.hiddenUnits', value: hiddenUnits })
        },
        addToHiddenUnits(name: string) {
            const hiddenUnits = [...this.afcHiddenUnits]
            if (!hiddenUnits.includes(name)) hiddenUnits.push(name)

            this.$store.dispatch('gui/saveSetting', { name: 'view.afc.hiddenUnits', value: hiddenUnits })
        },
    },
})
</script>
