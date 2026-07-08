<template>
    <v-list-item class="minHeight36 text-no-wrap">
        <v-checkbox v-model="value" class="mt-0" hide-details :label="label" />
    </v-list-item>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import AfcMixin from '@/components/mixins/afc'

export default defineComponent({
    name: 'AfcPanelSettingsExtruder',
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
            return this.$t(`Panels.AfcPanel.ShowTool`, { name: this.name }) as string
        },
    },
    watch: {
        value(newValue: boolean) {
            if (newValue) {
                this.removeFromHiddenExtruders(this.name)
                return
            }

            this.addToHiddenExtruders(this.name)
        },
    },
    mounted() {
        this.value = !this.afcHiddenExtruders.includes(this.name)
    },
    methods: {
        removeFromHiddenExtruders(name: string) {
            const hiddenExtruders = [...this.afcHiddenExtruders]
            const index = hiddenExtruders.indexOf(name)
            if (index > -1) hiddenExtruders.splice(index, 1)

            this.$store.dispatch('gui/saveSetting', { name: 'view.afc.hiddenExtruders', value: hiddenExtruders })
        },
        addToHiddenExtruders(name: string) {
            const hiddenExtruders = [...this.afcHiddenExtruders]
            if (!hiddenExtruders.includes(name)) hiddenExtruders.push(name)

            this.$store.dispatch('gui/saveSetting', { name: 'view.afc.hiddenExtruders', value: hiddenExtruders })
        },
    },
})
</script>
