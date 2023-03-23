import moment from "moment";

export async function timeSleep(ms) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, ms);
    })
}


export const getArrayDifference = (list, whole) => {
    return list.concat(whole).filter((v, i, arr) => {
        return arr.indexOf(v) === arr.lastIndexOf(v)
    })
}

export function tranformSecTime(param) {
    if (param) {
        let result
        if (param?.sec) {
            result = moment(param.sec * 1000)
            return moment(result).format('YYYY-MM-DD HH:mm:ss')
        } else {
            return '-'
        }
    } else {
        return '-'
    }
}


export function formatNormalTime(param) {
    if (param) {
        return moment(param).format('YYYY-MM-DD HH:mm:ss')
    } else {
        return '-'
    }
}