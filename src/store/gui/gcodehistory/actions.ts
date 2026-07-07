import { ActionTree } from 'vuex'
import { RootState } from '@/store/types'

import { GuiGcodehistoryState } from '@/store/gui/gcodehistory/types'
import { maxGcodeHistory } from '@/store/variables'
import { getSocketClient } from '@/plugins/webSocketClient'

export const actions: ActionTree<GuiGcodehistoryState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    upload({ state }) {
        getSocketClient().emit('server.database.post_item', {
            namespace: 'mainsail',
            key: 'gcodehistory.entries',
            value: state.entries,
        })
    },

    async addToHistory({ commit, dispatch, state }, payload) {
        const newHistory = [...state.entries]
        newHistory.push(payload)

        while (newHistory.length > maxGcodeHistory) newHistory.splice(0, 1)

        await commit('updateHistory', newHistory)
        await dispatch('upload')
    },
}
