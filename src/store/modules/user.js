import { getToken, setToken, removeToken } from '@/util/auth'
import { loginInSystem, getUserInfo, loginOutSystem } from '@/axios/user'

const state = {
    token: getToken(),

    checkMark: {
        parmas: '',
        state: false
    },

    userInfo: {},
}

const mutations = {
    SET_CHECK_SIGNET: (state, options) => {
        state.checkMark = options
    },

    SET_TOKEN: (state, token) => {
        state.token = token
    },

    SET_USER_INFO: (state, userInfo) => {
        Object.assign(state.userInfo, userInfo)
    },
}


/**
 * 
 * 
 * 
 */
const actions = {
    /**
     * 一进来直接验证登入信息
     * @param {*} param0 
     * @param {*} router 
     * @returns 
     */
    async checkUserAndLogin({ commit, dispatch }, router) {
        const { fullPath, query } = router
        const username = 'xinri1'
        const password = '123456'
        const result = await loginInSystem({ username, password })

        if(result && result.auth) {
            commit('SET_CHECK_SIGNET', { parmas: fullPath, state: true })
            commit('SET_TOKEN', result.auth)
            await dispatch('getUserGroupInfo')
            setToken(result.auth)
        }
    },

    async loginOut({ commit, dispatch }, router) {
        const result = await loginOutSystem(state.token)
        if(result && result.state) {
            commit('SET_CHECK_SIGNET', { parmas: '', state: false })
            commit('SET_USER_INFO', {})
            commit('SET_TOKEN', '')
            removeToken()
        }
    },

    async getUserGroupInfo({ commit, state }) {
        const result = await getUserInfo()
        if (result && result.state) {
            commit('SET_USER_INFO', result?.data)
        }
    },
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}