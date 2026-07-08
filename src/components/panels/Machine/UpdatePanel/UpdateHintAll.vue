<template>
    <v-dialog v-model="showDialog" persistent max-width="600">
        <panel
            :title="$t('Machine.UpdatePanel.AreYouSure')"
            :icon="mdiProgressQuestion"
            :margin-bottom="false"
            card-class="machine-update-hint-dialog">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>
                <v-row>
                    <v-col>
                        <update-hint-alert
                            v-for="repo of filteredModules"
                            :key="repo.name"
                            :repo="repo.data"
                            :bool-title="true"
                            @open-commit-history="openCommitHistory(repo.data)" />
                        <div>
                            <v-checkbox
                                v-model="checkboxUpdateQuestion"
                                :label="$t('Machine.UpdatePanel.IUnderstandTheRisks')"
                                hide-details />
                        </div>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-divider />
            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" @click="closeDialog">{{ $t('Machine.UpdatePanel.Abort') }}</v-btn>
                <v-btn variant="text" color="primary" :disabled="!checkboxUpdateQuestion" @click="updateAll">
                    {{ $t('Machine.UpdatePanel.StartUpdate') }}
                </v-btn>
            </v-card-actions>
        </panel>
        <git-commits-list v-model="boolShowCommitHistory" :repo="showCommitsRepo" />
    </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { ServerUpdateManagerStateGitRepo, ServerUpdateManagerStateGuiList } from '@/store/server/updateManager/types'
import { mdiProgressQuestion, mdiCloseThick } from '@mdi/js'
import Panel from '@/components/ui/Panel.vue'
import UpdateHintAlert from '@/components/panels/Machine/UpdatePanel/UpdateHintAlert.vue'
import semver from 'semver'

export default defineComponent({
    name: 'UpdateHintAll',
    components: { Panel, UpdateHintAlert },
    mixins: [BaseMixin],
    props: {
        modelValue: { type: Boolean },
    },
    emits: ['update-all', 'update:modelValue'],
    data() {
        return {
            mdiCloseThick: mdiCloseThick,
            mdiProgressQuestion: mdiProgressQuestion,
            checkboxUpdateQuestion: false,
            boolShowCommitHistory: false,
            showCommitsRepo: null as ServerUpdateManagerStateGitRepo | null,
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
        modules() {
            return this.$store.getters['server/updateManager/getUpdateManagerList'] ?? []
        },
        filteredModules() {
            return this.modules.filter((module: ServerUpdateManagerStateGuiList) => {
                // check git repos for updates
                if (module.type === 'git' && module.data?.commits_behind?.length) return true

                // check client web for updates
                if (
                    module.type === 'web' &&
                    semver.valid(module.data?.remote_version, { loose: true }) &&
                    semver.valid(module.data?.version, { loose: true }) &&
                    semver.gt(module.data?.remote_version, module.data?.version, { loose: true })
                )
                    return true

                return false
            })
        },
    },
    methods: {
        openCommitHistory(repo: ServerUpdateManagerStateGitRepo) {
            this.showCommitsRepo = repo
            this.boolShowCommitHistory = true
        },
        closeDialog() {
            this.showDialog = false
        },
        updateAll() {
            this.$emit('update-all')
        },
    },
})
</script>
