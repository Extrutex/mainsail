<template>
    <div>
        <v-row class="pt-3">
            <v-col class="text-center">
                <v-btn
                    variant="text"
                    color="primary"
                    size="small"
                    :disabled="['printing', 'paused'].includes(printer_state)"
                    @click="clickUpdate">
                    <v-icon start>{{ mdiProgressUpload }}</v-icon>
                    {{ $t('Machine.UpdatePanel.UpdateAll') }}
                </v-btn>
            </v-col>
        </v-row>
        <update-hint-all v-model="boolShowDialog" @update-all="updateAll" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import { mdiProgressUpload } from '@mdi/js'
import UpdateHintAll from '@/components/panels/Machine/UpdatePanel/UpdateHintAll.vue'

export default defineComponent({
    name: 'UpdatePanelEntryAll',
    components: { UpdateHintAll },
    mixins: [BaseMixin],
    data() {
        return {
            mdiProgressUpload: mdiProgressUpload,
            boolShowDialog: false,
        }
    },
    computed: {
        hideUpdateWarning() {
            return this.$store.state.gui.uiSettings.hideUpdateWarnings ?? false
        },
    },
    methods: {
        clickUpdate() {
            if (this.hideUpdateWarning) {
                this.updateAll()
                return
            }

            this.boolShowDialog = true
        },
        updateAll() {
            this.$socket.emit('machine.update.full', {})
        },
    },
})
</script>

<style scoped></style>
