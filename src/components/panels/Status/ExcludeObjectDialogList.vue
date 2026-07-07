<style scoped></style>

<template>
    <div>
        <template v-for="object in printing_objects" :key="'div_' + object.name">
            <v-row
                class="py-3 d-flex"
                @click="mouseOverObject(object.name)"
                @mouseover="mouseOverObject(object.name)"
                @mouseleave="mouseOverObject('')">
                <v-col
                    :class="
                        'py-2 subtitle-2 text-truncate ' +
                        (hoverName === object.name ? 'text--white' : 'text--disabled')
                    ">
                    {{ object.name }}
                </v-col>
                <v-col cols="auto" class="py-2">
                    <v-chip v-if="excluded_objects.includes(object.name)" pill size="small" class="text--disabled">
                        {{ $t('Panels.StatusPanel.ExcludeObject.Excluded') }}
                    </v-chip>
                    <v-icon
                        v-else
                        class="text--disabled cursor-pointer"
                        size="small"
                        @click="openExcludeObjectDialog(object.name)">
                        {{ mdiCloseCircle }}
                    </v-icon>
                </v-col>
            </v-row>
            <v-divider></v-divider>
        </template>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { mdiCloseCircle } from '@mdi/js'

export default defineComponent({
    name: 'StatusPanelObjectsDialogList',
    mixins: [BaseMixin],
    props: {
        hoverName: { type: String, required: false, default: '' },
    },
    emits: ['update:name', 'update:bool', 'update:hoverName'],
    data() {
        return {
            mdiCloseCircle: mdiCloseCircle,
        }
    },
    computed: {
        printing_objects() {
            return this.$store.state.printer.exclude_object?.objects ?? []
        },

        current_object() {
            return this.$store.state.printer.exclude_object?.current_object ?? null
        },

        excluded_objects() {
            return this.$store.state.printer.exclude_object?.excluded_objects ?? []
        },
    },
    methods: {
        openExcludeObjectDialog(name: string) {
            this.$emit('update:name', name)
            this.$emit('update:bool', true)
        },

        mouseOverObject(name: string) {
            this.$emit('update:hoverName', name)
        },
    },
})
</script>
