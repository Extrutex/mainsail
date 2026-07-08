<template>
    <v-dialog v-model="showDialog" width="400">
        <panel :title="$t('Files.RenameFile')" card-class="gcodefiles-rename-file-dialog" :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="showDialog = false">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>
                <v-text-field
                    ref="inputFieldRenameFile"
                    v-model="name"
                    :label="$t('Files.Name')"
                    required
                    :rules="nameInputRules"
                    @update:error="updateIsInvalidName"
                    @keydown.enter="renameFileAction" />
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" @click="showDialog = false">{{ $t('Buttons.Cancel') }}</v-btn>
                <v-btn
                    :disabled="isInvalidName || name.length === 0"
                    color="primary"
                    variant="text"
                    @click="renameFileAction">
                    {{ $t('Files.Rename') }}
                </v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { FocusableRef } from '@/types/vuetify'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick } from '@mdi/js'
import GcodefilesMixin from '@/components/mixins/gcodefiles'
import { FileStateGcodefile } from '@/store/files/types'

export default defineComponent({
    name: 'GcodefilesRenameFileDialog',
    components: { Panel },
    mixins: [BaseMixin, GcodefilesMixin],
    props: {
        modelValue: { type: Boolean },
        item: { type: Object, required: true },
    },
    emits: ['update:modelValue'],
    data() {
        return {
            mdiCloseThick: mdiCloseThick,
            name: '',
            isInvalidName: true,
            nameInputRules: [
                (value: string) => !!value || this.$t('Files.InvalidNameEmpty'),
                (value: string) => !this.existsFilename(value) || this.$t('Files.InvalidNameAlreadyExists'),
            ],
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
        inputFieldRenameFile(): FocusableRef {
            return this.$refs.inputFieldRenameFile as FocusableRef
        },
    },
    watch: {
        showDialog(newVal: boolean) {
            if (!newVal) return

            this.name = this.item.filename
            this.isInvalidName = true

            setTimeout(() => {
                this.inputFieldRenameFile.focus()
            }, 200)
        },
    },
    methods: {
        updateIsInvalidName(value: boolean) {
            this.isInvalidName = value
        },
        renameFileAction() {
            this.$socket.emit(
                'server.files.move',
                {
                    source: 'gcodes' + this.currentPath + '/' + this.item.filename,
                    dest: 'gcodes' + this.currentPath + '/' + this.name,
                },
                { action: 'files/getMove' }
            )

            this.showDialog = false
        },
    },
})
</script>
