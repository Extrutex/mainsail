import { ActionTree } from 'vuex'
import { ServerSensorState } from '@/store/server/sensor/types'
import { RootState } from '@/store/types'
import { getSocketClient } from '@/plugins/webSocketClient'

export const actions: ActionTree<ServerSensorState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    init() {
        getSocketClient().emit('server.sensors.list', {}, { action: 'server/sensor/getSensors' })
    },

    getSensors({ commit, dispatch }, payload) {
        commit('setSensors', payload.sensors)

        dispatch('socket/removeInitModule', 'server/sensor/init', { root: true })
    },

    updateSensors({ commit }, payload) {
        Object.keys(payload).forEach((key) => {
            commit('updateSensor', { key, value: payload[key] })
        })
    },
}
