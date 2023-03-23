import { get } from './customaxios'

export const loginInSystem = get('/?app=system&controller=admin&action=login_new')

export const getUserInfo = get('/?app=system&controller=index&action=userInfo')

export const loginOutSystem = get('/?app=system&controller=admin&action=logout_new')