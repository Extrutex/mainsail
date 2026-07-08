<template>
    <v-menu location="bottom" left :close-on-content-click="false" :title="$t('Files.SetupCurrentList')">
        <template #activator="{ props }">
            <v-btn class="px-2 minwidth-0 ml-3" v-bind="props">
                <v-icon>{{ mdiCog }}</v-icon>
            </v-btn>
        </template>
        <v-list>
            <v-list-item class="minHeight36">
                <v-row>
                    <v-col class="pr-0">{{ $t('Files.HiddenFiles') }}</v-col>
                    <v-col cols="auto" class="pl-0">
                        <v-icon
                            :color="showHiddenFiles ? 'primary' : 'grey lighten-1'"
                            @click.stop="showHiddenFiles = !showHiddenFiles">
                            {{ showHiddenFiles ? mdiCheckboxMarked : mdiCheckboxBlankOutline }}
                        </v-icon>
                    </v-col>
                </v-row>
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-row>
                    <v-col class="pr-0">{{ $t('Files.PrintedFiles') }}</v-col>
                    <v-col cols="auto" class="pl-0">
                        <v-icon
                            :color="showPrintedFiles ? 'primary' : 'grey lighten-1'"
                            @click.stop="showPrintedFiles = !showPrintedFiles">
                            {{ showPrintedFiles ? mdiCheckboxMarked : mdiCheckboxBlankOutline }}
                        </v-icon>
                    </v-col>
                </v-row>
            </v-list-item>
            <v-divider />
            <draggable
                v-model="configurableHeaders"
                handle=".handle"
                class="v-list-item-group"
                ghost-class="ghost"
                group="gcodeFilesColumnOrder"
                :force-fallback="true">
                <v-list-item v-for="header of configurableHeaders" :key="header.value" class="minHeight36">
                    <v-row>
                        <v-col cols="auto" class="pr-0">
                            <v-icon class="handle">{{ mdiDragVertical }}</v-icon>
                        </v-col>
                        <v-col>{{ header.text }}</v-col>
                        <v-col cols="auto" class="pl-0">
                            <v-icon
                                :color="header.visible ? 'primary' : 'grey lighten-1'"
                                @click.stop="changeMetadataVisible(header.value, !header.visible)">
                                {{ header.visible ? mdiCheckboxMarked : mdiCheckboxBlankOutline }}
                            </v-icon>
                        </v-col>
                    </v-row>
                </v-list-item>
            </draggable>
        </v-list>
    </v-menu>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import GcodefilesMixin from '@/components/mixins/gcodefiles'
import { mdiCheckboxBlankOutline, mdiCheckboxMarked, mdiCog, mdiDragVertical } from '@mdi/js'
import draggable from 'vuedraggable'

export default defineComponent({
    name: 'GcodefilesPanelHeaderSettings',
    components: { draggable },
    mixins: [BaseMixin, GcodefilesMixin],
    data() {
        return {
            mdiCheckboxBlankOutline: mdiCheckboxBlankOutline,
            mdiCheckboxMarked: mdiCheckboxMarked,
            mdiCog: mdiCog,
            mdiDragVertical: mdiDragVertical,
        }
    },
    methods: {
        changeMetadataVisible(name: string, value: boolean) {
            this.$store.dispatch('gui/setGcodefilesMetadata', { name: name, value: value })
        },
    },
})
</script>

<style scoped>
.handle {
    cursor: move;
}
</style>
