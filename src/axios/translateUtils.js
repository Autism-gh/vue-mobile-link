import moment from 'moment'

/**
 *  给请求链接添加时间戳
 * @param {地址} url
 * @returns
 */
export const formatUrlTime = (url) => {
  return `${url}?t=${moment().valueOf()}`
}

/**
 *
 * 给请求链接添加 分页元素
 * @param {路径} url
 * @param {数据} data
 * @returns
 */

export const formatPageUrl = (url, data) => {
  const { pagesize, page } = data
  return `${url}&pagesize=${pagesize}&page=${page}`
}

/**
 *
 *
 * 把对象转换成指定格式的 formdata
 *
 */

export const changeObjToFormData = (obj) => {
  let result = ''
  if (obj && toString.call(obj) === '[object Object]') {
    for (const [key, value] of Object.entries(obj)) {
      result = `${result}&${key}=${value}`
    }
  }
  return result.replace('&', '')
}

/**
 *
 *
 * 把对象转成 key  value 格式的 formdata
 * 不属于多层的那种
 * 多层嵌套的有很多种特殊的 formdata 表单格式
 *
 *
 */

export const changeObjToKeyValueForm = (obj) => {
  const formData = new FormData()
  if (obj && toString.call(obj) === '[object Object]') {
    const keys = Object.keys(obj)
    keys.forEach(item => {
      formData.append(item, obj[item])
    })
  }
  return formData
}

/**
 *
 * @param {对象} obj
 * @returns
 *
 */
export const changeObjToKeyValueForm2 = (obj) => {
  const formData = new FormData()
  if (obj && toString.call(obj) === '[object Object]') {
    const keys = Object.keys(obj)
    keys.forEach(item => {
      const value = obj[item]
      const type = toString.call(value)

      if (type === '[object Array]') {
        value.forEach(child => {
          formData.append(`${item}[]`, child)
        })
      } else {
        formData.append(`${item}`, value)
      }
    })
  }
  return formData
}

/**
 *
 * 把对象转成 key value 格式的 formdata
 * 多层嵌套那种
 *
 */
const handleData = (formData, result, key) => {
  if (JSON.stringify(result) === '{}') return
  const type = toString.call(result)
  if (type === '[object Object]') {
    for (const [newKey, newValue] of Object.entries(result)) {
      const forKey = `${key}[${newKey}]`
      handleData(formData, newValue, forKey)
    }
  } else {
    if (type === '[object Array]') {
      result.forEach(item => {
        formData.append(`${key}[]`, item)
      })
    } else {
      formData.append(`${key}`, result)
    }
  }
}

export const changeDeepValueToForm = (obj) => {
  const formData = new FormData()
  for (const [key, value] of Object.entries(obj)) {
    const forKey = `${key}`
    handleData(formData, value, forKey)
  }
  return formData
}

/**
 *
 * @param {路径} url
 * @param {参数} obj
 */
export const getSplicingUrl = (url, obj) => {
  if (!obj || JSON.stringify(obj) === '{}') return url
  const keys = Object.keys(obj)
  keys.forEach(item => {
    url += `&${item}=${obj[item]}`
  })
  return url
}
