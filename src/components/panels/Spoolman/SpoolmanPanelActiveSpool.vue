<template>
    <v-list-item lines="three">
        <div :class="overlineClass">#{{ id }} | {{ vendor }}</div>
        <v-list-item-title :class="listItemTitleClass">
            <span class="cursor-pointer" @click="clickSpool">{{ name }}</span>
        </v-list-item-title>
        <v-list-item-subtitle>{{ subtitle }}</v-list-item-subtitle>

        <v-list-item-avatar tile :size="avatarSize">
            <spool-icon :color="color" @click-spool="clickSpool" />
        </v-list-item-avatar>
    </v-list-item>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { ServerSpoolmanStateSpool } from '@/store/server/spoolman/types'

export default defineComponent({
    name: 'SpoolmanPanelActiveSpool',
    components: {},
    mixins: [BaseMixin],
    props: {
        small: { type: Boolean, required: false, default: false },
    },
    emits: ['change-spool'],
    computed: {
        listItemContentClass() {
            if (this.small) return 'my-0'

            return ''
        },
        overlineClass() {
            const classes = ['text-overline', 'mb-1']
            if (this.small) classes.push('line-height-auto')

            return classes
        },
        listItemTitleClass() {
            if (this.small) return ['text-h6', 'mb-1']

            return ['text-h5', 'mb-1']
        },
        avatarSize() {
            if (this.small) return 60

            return 80
        },
        active_spool(): ServerSpoolmanStateSpool | null {
            return this.$store.state.server.spoolman.active_spool ?? null
        },
        color() {
            const color = this.active_spool?.filament.color_hex ?? null
            if (color === null) return '#000'

            return `#${color}`
        },
        id() {
            return this.active_spool?.id ?? 'XX'
        },
        vendor() {
            return this.active_spool?.filament?.vendor?.name ?? 'Unknown'
        },
        name() {
            return this.active_spool?.filament.name ?? 'Unknown'
        },
        materialOutput() {
            const material = this.active_spool?.filament.material ?? null
            if (material === null) return null

            return material
        },
        weightOutput() {
            let remaining = this.active_spool?.remaining_weight ?? null
            const total = this.active_spool?.filament.weight ?? null

            if (remaining === null || total === null) return null
            remaining = Math.round(remaining)
            let totalRound = Math.floor(total / 1000)

            if (total >= 1000) {
                if (totalRound !== total / 1000) {
                    totalRound = Math.round(total / 100) / 10
                }

                return `${remaining}g / ${totalRound}kg`
            }

            return `${remaining} / ${total}g`
        },
        lengthOutput() {
            let remaining = this.active_spool?.remaining_length ?? null

            if (remaining === null) return null
            remaining = Math.round(remaining / 1000)

            return `${remaining}m`
        },
        subtitle() {
            return [this.materialOutput, this.weightOutput, this.lengthOutput].filter((v) => v !== null).join(' | ')
        },
    },
    methods: {
        clickSpool() {
            this.$emit('change-spool')
        },
    },
})
</script>

<style scoped>
.line-height-auto {
    line-height: 1;
}
</style>
