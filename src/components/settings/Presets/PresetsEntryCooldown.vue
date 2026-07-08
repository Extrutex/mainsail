<template>
    <settings-row :title="$t('Settings.PresetsTab.Cooldown')">
        <v-btn size="small" variant="outlined" class="ml-3" @click="editCooldown">
            <v-icon start size="small">{{ mdiPencil }}</v-icon>
            {{ $t('Settings.Edit') }}
        </v-btn>
    </settings-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { mdiPencil } from '@mdi/js'

export default defineComponent({
    name: 'PresetsEntryCooldown',
    components: { SettingsRow },
    mixins: [BaseMixin],
    emits: ['edit'],
    data() {
        return {
            mdiPencil: mdiPencil,
        }
    },
    methods: {
        editCooldown() {
            this.$emit('edit')
        },
    },
})
</script>
