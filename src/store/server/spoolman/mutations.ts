import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { ServerSpoolmanState } from './types'

export const mutations: MutationTree<ServerSpoolmanState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    setActiveSpoolId(state, payload) {
        state['active_spool_id'] = payload
    },

    setActiveSpool(state, payload) {
        state['active_spool'] = payload
    },

    setHealth(state, payload) {
        state['health'] = payload
    },

    setInfo(state, payload) {
        state['info'] = payload
    },

    setVendors(state, payload) {
        state['vendors'] = payload
    },

    setSpools(state, payload) {
        state['spools'] = payload
    },
}
