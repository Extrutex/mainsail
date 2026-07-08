<template>
    <div>
        <input ref="uploadBackupFile" type="file" :accept="['.json']" class="d-none" @change="uploadRestore" />
        <v-btn size="small" :loading="loadings.includes('restoreUploadButton')" class="ml-3" @click="restoreDb">
            {{ $t('Settings.GeneralTab.Restore') }}
        </v-btn>
        <v-dialog :value="showDialog" persistent :width="360">
            <panel
                :title="$t('Settings.GeneralTab.Restore')"
                card-class="mainsail-restore-dialog"
                :margin-bottom="false"
                :icon="mdiHelpCircle">
                <template #buttons>
                    <v-btn icon tile @click="closeDialog">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <v-row>
                        <v-col>
                            <p class="mb-0">{{ $t('Settings.GeneralTab.RestoreDialog') }}</p>
                        </v-col>
                    </v-row>
                    <v-row>
                        <checkbox-list
                            :options="restoreableNamespaces"
                            select-all
                            @update:selectedCheckboxes="onSelectRestoreCheckboxes" />
                    </v-row>
                    <v-row>
                        <v-col class="text-center">
                            <v-btn color="red" :loading="loadings.includes('restoreMainsail')" @click="restoreDbAction">
                                {{ $t('Settings.GeneralTab.Restore') }}
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-card-text>
            </panel>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick, mdiHelpCircle } from '@mdi/js'
import CheckboxList from '@/components/inputs/CheckboxList.vue'
import { TranslateResult } from 'vue-i18n'
import SettingsGeneralDatabase from '@/components/mixins/settingsGeneralDatabase'

export default defineComponent({
    name: 'SettingsGeneralTabRestoreDatabase',
    components: { Panel, CheckboxList },
    mixins: [BaseMixin, SettingsGeneralDatabase],
    data() {
        return {
            mdiHelpCircle: mdiHelpCircle,
            mdiCloseThick: mdiCloseThick,
            showDialog: false,
            restoreableNamespaces: [] as { value: string; label: string | TranslateResult }[],
            restoreCheckboxes: [] as string[],
            restoreObjects: {} as Record<string, unknown>,
        }
    },
    computed: {
        uploadBackupFile(): HTMLInputElement {
            return this.$refs.uploadBackupFile as HTMLInputElement
        },
    },
    methods: {
        onSelectRestoreCheckboxes(backupCheckboxes: string[]) {
            this.restoreCheckboxes = backupCheckboxes
        },
        async restoreDb() {
            this.uploadBackupFile.click()
        },
        uploadRestore() {
            const backup = this.uploadBackupFile?.files?.[0]
            if (!backup) {
                window.console.error('No json uploaded')
                return
            }

            const reader = new FileReader()
            reader.readAsText(backup, 'UTF-8')
            reader.onload = (evt) => {
                this.restoreableNamespaces = []
                try {
                    this.restoreObjects = JSON.parse(evt?.target?.result + '')

                    const keys = Object.keys(this.restoreObjects)
                    this.restoreableNamespaces = keys.map((key) => {
                        const namespace = this.availableKeys.find((namespace) => namespace.value === key)
                        if (namespace) return namespace

                        return { value: key, label: key }
                    })

                    // sort restoreableNamespaces
                    this.restoreableNamespaces = this.restoreableNamespaces.sort(this.sortNamespaces)

                    this.openDialog()
                } catch {
                    Vue.$toast.error(this.$t('Settings.GeneralTab.CannotReadJson').toString())
                }
            }
            reader.onerror = (evt) => {
                window.console.error(evt)
            }

            // empty input file field
            this.uploadBackupFile.value = ''
        },
        openDialog() {
            this.showDialog = true
        },
        closeDialog() {
            this.showDialog = false
        },
        restoreDbAction() {
            this.$store.dispatch('socket/addLoading', 'restoreDbAction')

            this.$store.dispatch('gui/restoreMoonrakerDB', {
                dbCheckboxes: this.restoreCheckboxes,
                restoreObjects: this.restoreObjects,
            })
        },
    },
})
</script>
