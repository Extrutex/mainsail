
import { ActionTree } from 'vuex'
import { ServerPowerState } from '@/store/server/power/types'
import { RootState } from '@/store/types'
import { getSocketClient } from '@/plugins/webSocketClient'

export const actions: ActionTree<ServerPowerState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    init() {
        getSocketClient().emit('machine.device_power.devices', {}, { action: 'server/power/getDevices' })
    },

    async getDevices({ commit, dispatch }, payload) {
        if (!payload.error) await commit('setDevices', payload.devices)

        await dispatch('socket/removeInitModule', 'server/power/init', { root: true })
    },

    getStatus({ commit }, payload) {
        if (!payload.error) commit('setStatus', payload)
    },

    responseToggle({ commit }, payload) {
        if ('requestParams' in payload) delete payload.requestParams

        for (const [key, value] of Object.entries(payload)) {
            commit('setStatus', { device: key, status: value })
        }
    },
}
