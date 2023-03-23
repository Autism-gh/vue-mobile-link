/**
 * 根据后端接口传递的值，生成 ”默认样式“ 的指定类型图层
 * @param {*} options
 * @param {*} sort
 * @returns
 */
export const drawMapLayer = (options, sort = 'latlng') => {
    let layer = null

    const formatOptions = JSON.parse(options)
    const {
        coordinates,
        type,
        radius
    } = formatOptions?.geometry

    if (['circle', 'Circle'].includes(type)) {
        let formatList = coordinates[0]
        if (sort === 'lnglat') {
            formatList = [formatList[1], formatList[0]]
        }
        layer = L.circle(formatList, {
            radius
        })
    } else {
        let formatList = coordinates
        if (sort === 'lnglat') {
            formatList = formatList.map(item => [item[1], item[0]])
        }
        
        if (['polygon', 'Polygon'].includes(type)) {
            layer = L.polygon(formatList)
        }
        if (['rectangle', 'Rectangle'].includes(type)) {
            layer = L.rectangle(formatList)
        }
        if (['polyline', 'Polyline', 'LineString'].includes(type)) {
            layer = L.polyline(formatList)
        }
    }

    return layer
}


export const trandLevelDesc = (level) => {
    let level_desc = '-'
    switch (level) {
        case 7:
            level_desc = '省级（≥2）'
            break
        case 11:
            level_desc = '市级（≥5）'
            break
        case 14:
            level_desc = '区县（≥8）'
            break
        case 17:
            level_desc = '街道（≥11）'
            break
    }
    return level_desc
}