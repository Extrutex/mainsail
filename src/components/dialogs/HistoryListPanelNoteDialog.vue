<template>
    <v-dialog v-model="showDialog" :max-width="600" persistent @keydown.esc="closeDialog">
        <panel :title="panelTitle" :icon="icon" card-class="history-note-dialog" :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text class="pb-0">
                <v-row>
                    <v-col>
                        <v-textarea v-model="note" variant="outlined" hide-details :label="$t('History.Note')" />
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" @click="closeDialog">{{ $t('Buttons.Cancel') }}</v-btn>
                <v-btn color="primary" variant="text" @click="saveNote">{{ $t('Buttons.Save') }}</v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick, mdiNoteEditOutline, mdiNotePlusOutline } from '@mdi/js'

export default defineComponent({
    name: 'HistoryListPanelNoteDialog',
    components: {
        Panel,
    },
    mixins: [BaseMixin],
    props: {
        modelValue: { type: Boolean },
        type: { type: String, required: true },
        job: { type: Object, required: true },
    },
    emits: ['update:modelValue'],
    data() {
        return {
            mdiCloseThick: mdiCloseThick,
            note: '',
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
        panelTitle() {
            if (this.type === 'create') return this.$t('History.CreateNote').toString()

            return this.$t('History.EditNote').toString()
        },
        icon() {
            if (this.type === 'create') return mdiNotePlusOutline

            return mdiNoteEditOutline
        },
    },
    watch: {
        showDialog(newVal: boolean) {
            if (!newVal) return

            this.note = this.job.note ?? ''
        },
    },
    methods: {
        saveNote() {
            this.$store.dispatch('server/history/saveHistoryNote', {
                job_id: this.job?.job_id,
                note: this.note,
            })

            this.closeDialog()
        },
        closeDialog() {
            this.showDialog = false
        },
    },
})
</script>

<style scoped>
:deep(.os-content .row:first-child) {
    margin-top: 1em !important;
}

:deep(.os-content .row:last-child) {
    margin-bottom: 1em !important;
}
</style>
