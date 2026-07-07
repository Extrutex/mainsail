<template>
    <div>
        <v-row>
            <template v-if="klipperReadyForGui">
                <v-col cols="12" md="8" class="pb-0">
                    <heightmap-chart-panel />
                </v-col>
                <v-col cols="12" md="4">
                    <heightmap-current-profile-panel />
                    <heightmap-profiles-panel />
                </v-col>
            </template>
            <template v-else>
                <v-col>
                    <v-alert
                        density="compact"
                        variant="text"
                        type="warning"
                        elevation="2"
                        class="mx-auto mt-6"
                        max-width="500"
                        :icon="mdiLockOutline">
                        {{ $t('Heightmap.ErrorKlipperNotReady') }}
                    </v-alert>
                </v-col>
            </template>
        </v-row>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'

import Panel from '@/components/ui/Panel.vue'
import { mdiLockOutline } from '@mdi/js'

export default defineComponent({
    name: 'PageHeightmap',
    components: { Panel },
    mixins: [BaseMixin],
    data() {
        return {
            mdiLockOutline: mdiLockOutline,
        }
    },
})
</script>
