<template>
    <li class="commit px-3 py-2">
        <v-row class="flex-column flex-sm-row">
            <v-col>
                <h4 class="subtitle-2 text--white mb-0">
                    {{ title }}
                    <v-chip
                        variant="outlined"
                        label
                        size="x-small"
                        class="ml-2 px-2"
                        @click="showDetails = !showDetails">
                        <v-icon size="small">{{ mdiDotsHorizontal }}</v-icon>
                    </v-chip>
                </h4>
                <p
                    v-if="showDetails"
                    class="caption text--secondary mb-2"
                    style="white-space: pre-line"
                    v-html="message"></p>
                <p class="caption mb-0">
                    <span class="font-weight-bold text-decoration-none white--text">
                        {{ author }}
                    </span>
                    <span>{{ commitFormatDate }}</span>
                </p>
            </v-col>
            <v-col cols="auto" class="pt-0 pt-sm-4">
                <v-chip variant="outlined" label size="small" :href="commitHref" target="_blank">
                    {{ commitShortSha }}
                </v-chip>
            </v-col>
        </v-row>
    </li>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { mdiDotsHorizontal } from '@mdi/js'
import {
    ServerUpdateManagerStateGitRepo,
    ServerUpdateManagerStateGitRepoCommit,
} from '@/store/server/updateManager/types'
import Panel from '@/components/ui/Panel.vue'

export default defineComponent({
    name: 'GitCommitsListDayCommit',
    components: { Panel },
    mixins: [BaseMixin],
    props: {
        commit: { type: Object as PropType<ServerUpdateManagerStateGitRepoCommit>, required: true },
        repo: { type: Object as PropType<ServerUpdateManagerStateGitRepo>, required: true },
    },
    data() {
        return {
            mdiDotsHorizontal: mdiDotsHorizontal,
            showDetails: false,
        }
    },
    computed: {
        title() {
            return this.commit.subject
        },
        message() {
            return this.commit.message
        },
        author() {
            return this.commit.author
        },
        commitFormatDate() {
            const commitDay = new Date(this.commit.date * 1000)
            commitDay.setHours(0, 0, 0, 0)
            const todayDay = new Date()
            todayDay.setHours(0, 0, 0, 0)
            const diff = Math.floor((todayDay.getTime() - commitDay.getTime()) / (1000 * 60 * 60 * 24))

            if (diff === 0) {
                const diffHours = Math.floor((new Date().getTime() - this.commit.date * 1000) / (1000 * 60 * 60))

                return this.$t('Machine.UpdatePanel.CommittedHoursAgo', { hours: diffHours })
            } else if (diff === 1) return this.$t('Machine.UpdatePanel.CommittedYesterday')
            else if (diff < 29) return this.$t('Machine.UpdatePanel.CommittedDaysAgo', { days: diff })
            else
                return this.$t('Machine.UpdatePanel.CommittedOnDate', {
                    date: commitDay.toLocaleDateString(this.browserLocale, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                    }),
                })
        },
        repo_name() {
            return this.repo.repo_name ?? this.repo.name ?? ''
        },
        commitHref() {
            return `https://github.com/${this.repo.owner}/${this.repo_name}/commit/${this.commit.sha}`
        },
        commitShortSha() {
            return this.commit.sha.substring(0, 6)
        },
    },
})
</script>

<style scoped>
li.commit {
    border-color: rgb(48, 54, 61);
    border-style: solid;
    border-width: 1px;
    border-bottom-width: 0;

    &:first-child {
        border-top-left-radius: 6px;
        border-top-right-radius: 6px;
    }

    &:last-child {
        border-bottom-width: 1px;
        border-bottom-left-radius: 6px;
        border-bottom-right-radius: 6px;
    }
}
</style>
