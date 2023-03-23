import { isBoolean } from '@/util/type-check'


/**
 * 摊平一个树
 * @param {Array<Object>} arr 树形结构的数据
 * @param {String} childrenKey 子节点数据的key
 * @param {Function} flagCondition 决定是否要摊平子树
 * @param {Object} parent 第一层树节点的__parent属性，无特殊情况应为null
 * */
export const flatTree = (arr, childrenKey = 'children', flagCondition, parent) => {
    const temp = []
    if (arr.length) {
        arr.forEach(item => {
            // 设置为不可遍历，要不然json.stringify会报错
            Object.defineProperty(item, '__parent', {
                enumerable: false,
                value: parent,
                configurable: true
            })
            temp.push(item)
            if (item[childrenKey] && (flagCondition ? flagCondition(item) : true)) {
                temp.push(...flatTree(item[childrenKey], childrenKey, flagCondition, item))
            }
        })
    }
    return temp
}


export const treeNodeOptions = {
    default: {
        label: 'name',
        id: 'id',
        parent: 'parent',
        icon: 'icon',
        level: 'level'
    }
}


/**
 *
 * @param {数据} list
 * @param {规则看上面那个} rules
 * @param {显示规则} showRules 
 * 
 * showRules 是一个针对各个级别的显示规则控制的一个东西
 * @returns
 */
export const listToTree = (list, rules = treeNodeOptions['default'], showRules = {}) => {
    const { id, parent, level, label } = rules
    
    const rulesKeys = Object.keys(showRules)
    const treeData = []
    if (!Array.isArray(list)) return treeData

    const map = {}
    const ruleList = []
    list.forEach(item => {

        // 拿到这个级别的key
        const levelKey = item[level]

        let levelRule = {}
        // 存在特殊规则在里面
        if (levelKey && rulesKeys.includes(levelKey)) {
            levelRule = showRules[levelKey]
        }

        const { showNode, showCheckbox, disabled } = levelRule
        
        // 把那些配置成不显示的的节点直接搞下去
        if (!isBoolean(showNode)) {
            
            Object.assign(item, {
                // showCheckbox 控制是否显示
                showCheckbox: showCheckbox === undefined,

                // 那种不showcheckBox 选中框将被禁用避免影响其他正常操作
                disabled: disabled
            })

            map[item[id]] = item
            ruleList.push(item)
        }
    })

    /**
     *  给各个节点添加父节点的一些重要值作为字段方便取用
     *  node_parent_name
     *  node_parent_id
     *  node_parent_type
     */
    ruleList.forEach(item => {
        const father = map[item[parent]]
        const newItem = Object.assign(item, {
            node_parent_name: father?.[label] || '',
            node_parent_id: father?.[id] || '',
            node_parent_type: father?.[level] || ''
        })
        if (father) {
            (father.children || (father.children = [])).push(newItem)
        } else {
            treeData.push(newItem)
        }
    })

    return treeData
}