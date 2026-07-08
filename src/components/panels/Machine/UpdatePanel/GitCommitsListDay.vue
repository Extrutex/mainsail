<template>
    <div>
        <v-timeline-item size="small" class="git-commit-list-day">
            <v-row class="pt-0">
                <v-col class="pr-12">
                    <h3 class="caption">
                        {{ $t('Machine.UpdatePanel.CommitsOnDate', { date: groupedCommitsDate }) }}
                    </h3>
                    <ul class="commits mt-3 pl-0">
                        <git-commits-list-day-commit
                            v-for="commit of groupedCommits.commits"
                            :key="commit.sha"
                            :commit="commit"
                            :repo="repo" />
                    </ul>
                </v-col>
            </v-row>
        </v-timeline-item>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import BaseMixin from '@/components/mixins/base'
import {
    ServerUpdateManagerStateGitRepo,
    ServerUpdateManagerStateGitRepoGroupedCommits,
} from '@/store/server/updateManager/types'
import Panel from '@/components/ui/Panel.vue'
import GitCommitsListDayCommit from '@/components/panels/Machine/UpdatePanel/GitCommitsListDayCommit.vue'

export default defineComponent({
    name: 'GitCommitsListDay',
    components: { Panel, GitCommitsListDayCommit },
    mixins: [BaseMixin],
    props: {
        groupedCommits: { type: Object as PropType<ServerUpdateManagerStateGitRepoGroupedCommits>, required: true },
        repo: { type: Object as PropType<ServerUpdateManagerStateGitRepo>, required: true },
    },
    computed: {
        groupedCommitsDate() {
            return new Date(this.groupedCommits.date).toLocaleDateString(this.browserLocale, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            })
        },
    },
})
</script>

<style scoped>
ul.commits {
    list-style: none;
}
</style>
