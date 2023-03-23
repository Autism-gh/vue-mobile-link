import { getToken } from '@/util/auth'
import router from './router'
import store from './store'


/**
 * 
 * 进入这里的首要条件，根据跳转地址上的验证信息进入系统显示内容
 * 
 */
router.beforeEach(async (to, from, next) => {
    const hasToken = getToken()

    const { path, query } = to
    const { state } = store.getters.checkMark

    /**
     * 验证用户，获取token user 信息，并且记录页面状态
     * 如果验证过了那么就跳过
     */
    if(!state) {
        await store.dispatch('user/checkUserAndLogin', to)
    }

    if (hasToken) {
        try {
            next()
        } catch (error) {
            next({ path: '/visiterror'})
        }
    } else {
        // 没有认证代表没得权限
        next({ path: '/NoRoot'})
    }
})