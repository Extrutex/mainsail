<template>
    <v-dialog v-model="showDialog" persistent max-width="800">
        <panel
            :title="$t('Machine.UpdatePanel.UpgradeableSystemPackages')"
            :icon="mdiPackageVariantClosed"
            :margin-bottom="false"
            card-class="machine-update-system-packages-list-dialog">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>
                <v-row>
                    <v-col>
                        <p>{{ $t('Machine.UpdatePanel.ThesePackagesCanBeUpgrade') }}</p>
                        <p class="system-packages-list">{{ packagesList.join(', ') }}</p>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" color="primary" @click="closeDialog">{{ $t('Buttons.Close') }}</v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { mdiCloseThick, mdiPackageVariantClosed } from '@mdi/js'
import Panel from '@/components/ui/Panel.vue'

export default defineComponent({
    name: 'SystemPackagesList',
    components: { Panel },
    mixins: [BaseMixin],
    props: {
        modelValue: { type: Boolean },
        packagesList: { type: Array as PropType<string[]>, required: true },
    },
    emits: ['update:modelValue'],
    data() {
        return {
            mdiCloseThick: mdiCloseThick,
            mdiPackageVariantClosed: mdiPackageVariantClosed,
        }
    },
    computed: {
        showDialog: {
            get(): boolean {
                return this.modelValue
            },
            set(value: boolean) {
                this.$emit('update:modelValue', value)
            },
        },
    },
    methods: {
        closeDialog() {
            this.showDialog = false
        },
    },
})
</script>

<style scoped>
.system-packages-list {
    font-family: monospace;
    margin-bottom: 0 !important;
}
</style>
