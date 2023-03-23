'use strict'
import axios from 'axios'
import store from '@/store'
import { getToken } from '@/util/auth'
import { changeObjToKeyValueForm } from './translateUtils'
import QS from 'qs'

const TIMEOUT = 30 * 1000

/**
 * 响应拦截器
 */
const response = (response) => {
  const res = response.data
  if (response.status === 200) {
    if (res.state || res.status) {
      // 不了解不知道做啥处理
    }
  } else {
    console.log(res.message || '[warning]::接口返回出错')
  }
  return res
}

const error = (error) => {
  console.log('[ SYSTEM API RESPONSE ERRPR ]' + error) // for debug
  return Promise.reject(error)
}

export const contentType = {
  form: 'application/x-www-form-urlencoded',
  default: 'application/json; charset=UTF-8;',
  upload: 'multipart/form-data'
}


/**
 *
 *  .go 写的
 *  /api 的请求， 请求头都不一样的！！！ 暂时不放配置文件里面
 *
 *
 */
const apiInstance = axios.create({})
apiInstance.defaults.timeout = TIMEOUT
apiInstance.defaults.baseURL = process.env.VUE_APP_API
apiInstance.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
apiInstance.interceptors.request.use(
  request => {
    if (store.getters.token) {
      // request.headers['apikey'] = 'EWqSloxOnNUdWjyI'
      request.headers['uid'] = store.getters.userInfo?.userid
    }
    return request
  },
  error => {
    console.log('【 API-OF-51 REQUEST ERROR 】::', error)
    return Promise.reject(error)
  }
)
apiInstance.interceptors.response.use(response, error)

/**
 *
 *
 *  /app?   php 接口
 *
 *
 */
const appApiInstance = axios.create({})
appApiInstance.defaults.timeout = TIMEOUT
appApiInstance.defaults.baseURL = process.env.VUE_APP_APPAPI
appApiInstance.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
appApiInstance.interceptors.request.use(
  request => {
    if (store.getters.token) {
      request.headers['X-Token'] = getToken()
    }
    return request
  },
  error => {
    console.log('【 API-OF-APP REQUEST ERROR 】::', error)
    return Promise.reject(error)
  }
)
appApiInstance.interceptors.response.use(response, error)

/**
 *  只有极少数用过的
 *  /api.-------?   php 接口
 */
const phpApiInstance = axios.create({})
phpApiInstance.defaults.timeout = TIMEOUT
phpApiInstance.defaults.baseURL = process.env.VUE_APP_PHPAPI
phpApiInstance.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
phpApiInstance.interceptors.request.use(
  request => {
    if (store.getters.token) {
      request.headers['X-Token'] = getToken()
    }
    return request
  },
  error => {
    console.log('【 API-OF-APP REQUEST ERROR 】::', error)
    return Promise.reject(error)
  }
)
phpApiInstance.interceptors.response.use(response, error)

const requestCenter = {
  appapi: appApiInstance, // /app?********  对应 admin.**.com:0000的服务器
  api: apiInstance, //  /api ********* 好像说是用不到几个地方
  phpapi: phpApiInstance //  对应服务  api.**.com:0000的服务器
}

/**
 *  上下这两个相互关联的哦 ~
 *  根据底下这个配置代理
 */

export const appService = 'appapi'
export const apiService = 'api'
export const phpapiService = 'phpapi'

export const post = (url, { api = appService } = {}) => {
  return async data => {
    return (await requestCenter[api]({
      method: 'post',
      url,
      data,
      headers: {
        'Content-Type': contentType.default
      },
      paramsSerializer: params => {
        return QS.stringify(params)
      }
    }))
  }
}

export const postForm = (url, { api = appService } = {}) => {
  return async data => {
    return (await requestCenter[api]({
      method: 'post',
      url,
      data,
      headers: {
        'Content-Type': `${contentType.form};`
      }
    }))
  }
}

export const postObjToForm = (url, { api = appService } = {}) => {
  return async data => {
    return (await requestCenter[api]({
      method: 'post',
      url,
      data,
      headers: {
        'Content-Type': `${contentType.form};`
      },
      transformRequest: [
        (data) => changeObjToKeyValueForm(data)
      ]
    }))
  }
}
export const postpdf = (url, { api = appService } = {}) => {
  return async data => {
    return (await requestCenter[api]({
      method: 'post',
      url,
      data,
      headers: {
        'Content-Type': `${contentType.form};`
      },
      responseType: 'arraybuffer',
      transformRequest: [
        (data) => changeObjToKeyValueForm(data)
      ]
    }))
  }
}
export const get = (url, { api = appService } = {}) => {
  return async data => {
    return (await requestCenter[api](
      {
        method: 'get',
        url,
        params: {
          ...data
        },
        headers: {
          'Content-Type': contentType.default
        }
      }
    ))
  }
}
export const getBuffer = (url, { api = appService } = {}) => {
  return async data => {
    return (await requestCenter[api](
      {
        method: 'get',
        url,
        params: {
          ...data
        },
        responseType: 'arraybuffer',
        headers: {
          'Content-Type': contentType.default
        }
      }
    ))
  }
}

export const customInstanceApi = apiInstance

export const customInstanceAppApi = appApiInstance

export const customInstancePhpApi = phpApiInstance
