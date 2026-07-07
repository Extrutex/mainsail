<template>
    <div v-if="isRotaryOrServoSelector || isLinearSelector">
        <h3 class="text-h5 mb-3 mt-5">{{ name }}</h3>

        <settings-row
            v-if="isRotaryOrServoSelector"
            :title="$t('Panels.MmuPanel.MmuMaintenanceDialog.Selector')"
            dense
            dynamic-slot-width>
            <v-btn size="small" :disabled="!canSend" color="secondary" @click="doSend('MMU_HOME')">
                <v-icon start>{{ mdiHomeOutline }}</v-icon>
                {{ $t('Panels.MmuPanel.MmuMaintenanceDialog.Home') }}
            </v-btn>
            <v-btn
                size="small"
                :disabled="!canSend || mmuGrip === 'Gripped'"
                color="secondary"
                class="ml-2"
                @click="doSend('MMU_GRIP')">
                <v-icon start>{{ mdiArrowCollapseHorizontal }}</v-icon>
                {{ $t('Panels.MmuPanel.MmuMaintenanceDialog.Grip') }}
            </v-btn>
            <v-btn
                size="small"
                :disabled="!canSend || mmuGrip === 'Released'"
                color="secondary"
                class="ml-2"
                @click="doSend('MMU_RELEASE')">
                <v-icon start>{{ mdiArrowExpandHorizontal }}</v-icon>
                {{ $t('Panels.MmuPanel.MmuMaintenanceDialog.Release') }}
            </v-btn>
        </settings-row>

        <settings-row
            v-else-if="isLinearSelector"
            :title="$t('Panels.MmuPanel.MmuMaintenanceDialog.Selector')"
            dense
            dynamic-slot-width>
            <v-btn size="small" :disabled="!canSend" class="ml-2" color="secondary" @click="doSend('MMU_HOME')">
                <v-icon start>{{ mdiHomeOutline }}</v-icon>
                {{ $t('Panels.MmuPanel.MmuMaintenanceDialog.Home') }}
            </v-btn>
            <v-btn
                size="small"
                :disabled="!canSend || mmuServo === 'Up'"
                color="secondary"
                class="ml-2"
                @click="doSend('MMU_SERVO POS=up')">
                <v-icon start>{{ mdiArrowUpThin }}</v-icon>
                {{ $t('Panels.MmuPanel.MmuMaintenanceDialog.Up') }}
            </v-btn>
            <v-btn
                size="small"
                :disabled="!canSend || mmuServo === 'Down'"
                color="secondary"
                class="ml-2"
                @click="doSend('MMU_SERVO POS=down')">
                <v-icon start>{{ mdiArrowDownThin }}</v-icon>
                {{ $t('Panels.MmuPanel.MmuMaintenanceDialog.Down') }}
            </v-btn>
            <v-btn
                size="small"
                :disabled="!canSend || mmuServo === 'Move'"
                color="secondary"
                class="ml-2"
                @click="doSend('MMU_SERVO POS=move')">
                <v-icon start>{{ mdiArrowLeftRight }}</v-icon>
                {{ $t('Panels.MmuPanel.MmuMaintenanceDialog.Move') }}
            </v-btn>
        </settings-row>

        <v-divider class="my-6" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseMixin from '@/components/mixins/base'
import MmuMixin from '@/components/mixins/mmu'
import {
    mdiCloseThick,
    mdiHomeOutline,
    mdiArrowDownThin,
    mdiArrowUpThin,
    mdiArrowLeftRight,
    mdiArrowCollapseHorizontal,
    mdiArrowExpandHorizontal,
} from '@mdi/js'

export default defineComponent({
    name: 'MmuMaintenanceStateDialogUnit',
    mixins: [BaseMixin, MmuMixin],
    props: {
        unitIndex: { type: Number, required: true },
    },
    data() {
        return {
            mdiCloseThick: mdiCloseThick,
            mdiHomeOutline: mdiHomeOutline,
            mdiArrowDownThin: mdiArrowDownThin,
            mdiArrowUpThin: mdiArrowUpThin,
            mdiArrowLeftRight: mdiArrowLeftRight,
            mdiArrowCollapseHorizontal: mdiArrowCollapseHorizontal,
            mdiArrowExpandHorizontal: mdiArrowExpandHorizontal,
        }
    },
    computed: {
        unit() {
            return this.getMmuMachineUnit(this.unitIndex)
        },
        name() {
            const name = this.mmuUnit?.name ?? 'Unit'

            return `MMU #${this.unitIndex + 1} - ${name}`
        },
        selectorType() {
            return this.mmuUnit.selectorType ?? 'VirtualSelector'
        },
        isRotaryOrServoSelector() {
            return ['RotarySelector', 'ServoSelector'].includes(this.selectorType)
        },
        isLinearSelector() {
            return this.selectorType === 'LinearSelector'
        },
    },
})
</script>
