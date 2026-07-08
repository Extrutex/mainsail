<template>
    <v-dialog v-model="showDialog" persistent :max-width="800" :fullscreen="isMobile">
        <panel
            :title="$t('Machine.UpdatePanel.Commits')"
            :icon="mdiUpdate"
            :margin-bottom="false"
            card-class="machine-update-commits-dialog">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text class="py-0 px-0">
                <overlay-scrollbars :style="overlayScrollbarsStyle" :options="{ overflowBehavior: { x: 'hidden' } }">
                    <v-timeline :class="timelineClassName" align-top density="compact" style="min-height: 100%">
                        <git-commits-list-day
                            v-for="group of groupedCommits"
                            :key="group.date.getTime()"
                            :repo="repo"
                            :grouped-commits="group" />
                        <v-timeline-item
                            v-if="displayFullHistoryWaring"
                            size="small"
                            class="git-commit-list-day git-commit-list-warning">
                            <v-row class="pt-0">
                                <v-col class="pr-12">
                                    <v-alert density="compact" text type="info">
                                        <p>{{ $t('Machine.UpdatePanel.MoreCommitsInfo') }}</p>
                                        <div class="text-center mb-3">
                                            <v-btn :href="linkToGithub" target="_blank">
                                                {{ $t('Machine.UpdatePanel.LinkToGithub') }}
                                            </v-btn>
                                        </div>
                                    </v-alert>
                                </v-col>
                            </v-row>
                        </v-timeline-item>
                    </v-timeline>
                </overlay-scrollbars>
            </v-card-text>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import BaseMixin from '@/components/mixins/base'
import {
    ServerUpdateManagerStateGitRepo,
    ServerUpdateManagerStateGitRepoCommit,
    ServerUpdateManagerStateGitRepoGroupedCommits,
} from '@/store/server/updateManager/types'
import { mdiUpdate, mdiCloseThick } from '@mdi/js'
import Panel from '@/components/ui/Panel.vue'
import GitCommitsListDay from '@/components/panels/Machine/UpdatePanel/GitCommitsListDay.vue'

export default defineComponent({
    name: 'GitCommitsList',
    components: { GitCommitsListDay, Panel },
    mixins: [BaseMixin],
    props: {
        modelValue: { type: Boolean },
        repo: { type: null as unknown as PropType<ServerUpdateManagerStateGitRepo | null>, required: true },
    },
    emits: ['update:modelValue'],
    data() {
        return {
            mdiUpdate: mdiUpdate,
            mdiCloseThick: mdiCloseThick,
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
        commitsBehind(): ServerUpdateManagerStateGitRepoCommit[] {
            return this.repo?.commits_behind ?? []
        },
        groupedCommits() {
            const output: ServerUpdateManagerStateGitRepoGroupedCommits[] = []
            let lastCommit: ServerUpdateManagerStateGitRepoCommit | null = null

            this.commitsBehind.forEach((commit: ServerUpdateManagerStateGitRepoCommit) => {
                const lastCommitDate = new Date((lastCommit?.date ?? 0) * 1000)
                const commitDate = new Date(commit.date * 1000)

                if (
                    commitDate.getFullYear() !== lastCommitDate.getFullYear() ||
                    commitDate.getMonth() !== lastCommitDate.getMonth() ||
                    commitDate.getDate() !== lastCommitDate.getDate()
                ) {
                    output.push({
                        date: commitDate,
                        commits: [],
                    })
                }

                output[output.length - 1].commits.push(commit)
                lastCommit = commit
            })

            return output
        },
        displayFullHistoryWaring() {
            return this.commitsBehind.length >= 30
        },
        lastCommit() {
            return this.commitsBehind.slice(-1)[0]
        },
        linkToGithub() {
            return `https://github.com/${this.repo?.owner}/${this.repo?.repo_name}/commits/${this.repo?.branch}/?after=${this.lastCommit?.sha}+0`
        },
        overlayScrollbarsStyle() {
            if (this.isMobile) {
                return {
                    height: 'calc(100vh - 48px)',
                }
            }

            return {
                height: '400px',
            }
        },
        timelineClassName() {
            if (this.isMobile) return ['groupedCommits', 'mobile']

            return ['groupedCommits']
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
.groupedCommits {
    padding-top: 0;
}

::v-deep {
    .git-commit-list-day {
        padding-top: 24px;
        padding-bottom: 0;

        .v-timeline-item__dot--small {
            width: 18px;
            height: 15px;
            margin-top: 2px;

            &:before {
                display: block;
                content: ' ';
                position: relative;
                width: 18px;
                height: 2px;
                top: 7px;
                background: rgba(255, 255, 255, 0.5);
                z-index: 1;
            }
        }

        .v-timeline-item__inner-dot {
            background-color: #1e1e1e !important;
            border: 2px solid rgba(255, 255, 255, 0.5) !important;
            width: 8px;
            height: 8px;
            position: relative;
            z-index: 2;
            margin-left: 5px;
            margin-top: 2px;
        }

        &.git-commit-list-warning {
            .v-timeline-item__dot--small {
                margin-top: 10px;
            }
        }
    }
}

:deep(.groupedCommits.mobile) {
    &:before {
        left: 20px;
    }

    .v-timeline-item__body {
        max-width: calc(100% - 41px);
    }

    .v-timeline-item__divider {
        min-width: 41px;
    }
}
</style>
