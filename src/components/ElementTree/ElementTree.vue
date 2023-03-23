<template>
    <div class="tree-container">
        <div class="header-wrapper">
            <div class="header-wrapper">
                <el-select 
                    v-model="query.value" 
                    :placeholder="placeholder" 
                    filterable remote :clearable="false"
                    :loading="query.loading" 
                    :remote-method="remoteMethod" 
                    @visible-change="showSelectNode"
                    @change="sendSelectNode">
                    <el-option v-for="item in query.filterList" 
                        :key="item[nodeOptions.id]"
                        :label="item[nodeOptions.label]" 
                        :value="item[nodeOptions.id]" />
                </el-select>
                <i class="tree-search-icon el-icon-search"></i>
            </div>
        </div>
        <div class="content-wrapper" ref="treeWrap">
            <el-tree 
                ref="tree"
                :class="[
                'customtree',
                `customtree--${ checkMode }`,
                treeLine ? 'customtree--line' : '']"
                :indent="treeLine ? 0 : 22"
                v-bind="treeAttrs"
                :show-checkbox="checkMode"
                :data="tree.dataObject"
                :node-key="nodeOptions.id"
                v-on="$listeners"
                @check="handleNodeCheck"
                @node-click="handleNodeClick">

                <div class="elementTree-tree-row" slot-scope="{ data }">
                    <div class="element-tree-node_icon">
                        <i v-if="treeIcon" :class="['tree-icon', data[nodeOptions.icon]]" />
                    </div>
                    
                    <!-- 
                        树后面带点东西
                     -->
                    <div class="elementTree-tree-node">
                        <div class="element-tree-node__label">
                            {{ data[nodeOptions.label] }}
                        </div>
                    </div>
                </div>
            </el-tree>
        </div>  
    </div>
</template>
<script>
    import PinyinMatch from 'pinyin-match'
    import * as TreeUtil from './treeUtil'
    import { timeSleep } from '@/util/common'
    import _ from 'lodash'

    export default {
        name: 'ElementTree',
        components: {},
        props: {
            placeholder: {
                type: String,
                default: '请输入关键字查询'
            },

            /**
             * 
             * 选中模式
             * 
             */
            checkMode: {
                type: Boolean,
                default: true
            },

            /**
             * 
             * 树的图标是否显示
             * 
             */
            treeIcon: {
                type: Boolean,
                default: true
            },

            /**
             * 
             *  树的导航线
             * 
             */
            treeLine: {
                type: Boolean,
                default: false
            },

            treeData: {
                type: Array,
                default: () => null
            },

            showRules: {
                type: Object,
                default: () => null
            }
        },
        data() {
            return {
                query: {
                    value: '',
                    loading: false,
                    filterList: []
                },

                tree: {
                    loading: false,
                    dataArray: [],
                    dataObject: {},
                    currentChecked: null
                },

                waitForInit: null,

                promiseResolve: null,

            }
        },
        watch: {    
            treeData: {
                handler: function(value) {
                    // 重置验证装置
                    this.reSetPromiseInit()
                    // 好像会串数据走深拷贝 后面再看看
                    if(value && value.length) {
                        this.tree.dataArray = JSON.parse(JSON.stringify(value))
                        // this.tree.dataArray = [...value]
                    } else {
                        this.tree.dataArray = []
                    }
                },
                immediate: true
            },

            'tree.dataArray': {
                handler: async function(value) {
                    if (!value || !value.length) {
                        this.tree.dataObject = []
                        return
                    }
                    this.tree.dataObject = TreeUtil.listToTree(value, this.nodeOptions, this.nodeShowRules)
                    await this.$nextTick()
                    this.handleOverInit(value)
                },
                immediate: true
            },

            'query.value': function(value) {
                if (!value) return
                const $tree = this.$refs['tree']
                const node = $tree.getNode(value)
                $tree.setCurrentKey(value)
                node.expand(null, true)
            }
        },
        computed: {
            treeAttrs() {
                return Object.assign({
                    // 高亮显示
                    'highlight-current': true,  
                    // 关闭哪点击节点收缩功能改成配置的
                    'expand-on-click-node': false, 
                    // 点击节点选中 checkbox 只在  (有选中框的情况下才会开启)
                    'check-on-click-node': false
                }, this.$attrs)
            },


            nodeOptions() {
                if (this.extandShowRules) {
                    return this.extandShowRules
                } else {
                    return {
                        label: 'name',
                        id: 'id',
                        parent: 'parent',
                        icon: 'icon',
                        level: 'level'
                    }
                }
            },

        },
        methods: {

            handleNodeCheck(data, node) {
                this.$emit('node-check', data, node)
            },

            handleNodeClick(data, node) {
                if (node.expanded) {
                    node.collapse()
                } else {
                    node.expand()
                }
            },

            /**
             *  业务尚未贯彻，暂且不知道目前筛选方式的差异，后续改进可以添加新的选择框根据指定类型来查询
             *  筛选方法，后面肯定要升级先暂时用文字节点代替
             */
            remoteMethod(query) {
                if (query !== '') {
                    setTimeout(() => {
                        this.query.filterList = this.tree.dataArray.filter(item => PinyinMatch.match(item[this.nodeOptions.label], query))
                    }, 500)
                } else {
                    this.query.filterList = []
                }
            },

            showSelectNode(type) {
                if (type) {
                    const node = this.query.filterList.find(item => item[this.nodeOptions.id] === this.query.value)
                    const $tree = this.$refs['tree']
                    if (node) {
                        $tree.setCurrentNode(node)
                    }
                }
            },


            async sendSelectNode() {
                const $tree = this.$refs['tree']
                const node = $tree.getNode(this.query.value)
                if(!node) return
                // console.log('this.query.value', this.query.value)
                // console.log('node', node)
                // console.log('this.nodeOptions', this.nodeOptions)
                $tree.setCurrentKey(node[this.nodeOptions.id])

                if (this.checkMode) {
                    node.setChecked(true, true)
                    this.handleNodeCheck(node?.data, this.getTreeCurrentState(), null)
                } else {
                    this.handleNodeClick(node?.data, this.getTreeCurrentState(), null)
                }
                this.scrollToRightView()
            },


            getTreeCurrentState() {
                const $tree = this.$refs['tree']
                return {
                    checkedNodes: $tree.getCheckedNodes(),
                    checkedKeys: $tree.getCheckedKeys(),
                    halfCheckedNodes: $tree.getHalfCheckedNodes(),
                    halfCheckedKeys: $tree.getHalfCheckedKeys()
                }
            },

            reSetPromiseInit(type = true) {
                try {
                    this.tree.loading = true
                    if (this.waitForInit) {
                        this.promiseResolve({ state: false, message: 'data refresh' })
                        this.waitForInit = null
                        this.promiseResolve = null
                    }
                    if (!type) return

                    this.waitForInit = new Promise((resolve) => {
                        this.promiseResolve = resolve
                    })
                } catch (error) {
                    console.log('error', error)
                }
            },

            async handleOverInit(list = null) {
                const $tree = this.$refs['tree']
                // 双验证
                const { dataArray, dataObject } = this.tree

                const firstNode = dataArray?.[0]

                // 默认展开第一个节点
                if(firstNode) {
                    const activeNode = $tree?.getNode(firstNode)
                    if(activeNode) activeNode.expand(null, true)
                }

                this.$emit('mounted', $tree, {
                    treeList: list || dataArray,
                    treeData: dataObject,
                    firstNode: firstNode,
                    nodeOptions: this.nodeOptions
                })
                this.promiseResolve({ state: true, message: 'OK' })
                await this.$nextTick()
                this.tree.loading = false
            },

            /**
             * 展开指定元素
             */
            expandByNode(node) {
                if (!node) return
                if (node?.parent) {
                    this.expandByNode(node.parent)
                }
                if (!node.expanded) {
                    node.expand()
                }
            },

            scrollToRightView: _.debounce(async function(nodeId = null) {
                const $tree = this.$refs['tree']
                if (nodeId) {
                    $tree.setCurrentKey(nodeId)
                    this.expandByNode($tree.store.nodesMap[nodeId])
                    await this.$nextTick()
                    /**
                     * 
                     * 因为 select 下拉得时候有个动画延时，所以需要把这个时间给算进去
                     * 不然会出现定位不准确得问题，相当蓝瘦
                     * 
                     */
                    await timeSleep(400)
                }
                const $node = this.$el.querySelector('div[role=treeitem].el-tree-node.is-current')
                if ($node) {
                    const $treeWrap = this.$refs['treeWrap']
                    const wrapRect = $treeWrap.getBoundingClientRect()
                    const nodeRect = $node.getBoundingClientRect()
                    const { top } = wrapRect
                    $treeWrap.scrollTo({ top: (nodeRect.top + $treeWrap.scrollTop) - top })
                }
            }, 1000),
        },
        beforeCreate() {

        },
        created() {
            this.reSetPromiseInit()
        },
        beforeMount() {

        },
        mounted() {

        },
        beforeDestroy() {

        },
    }
</script>

<style lang="scss">
@import './scss/ElementTree.scss';
</style>

<style lang="scss" scoped>
$padding: 10px;

.tree-container {
    position: relative;
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: $padding;

    .header-wrapper {
        position: relative;

        .el-select {
            width: 100%;
        }

        .tree-search-icon {
            position: absolute;
            right: 16px;
            top: 16px;
            font-size: 30px;
            color: #909399;
        }
    }   
    
    .content-wrapper {
        margin-top: $padding;
        flex-grow: 1;
        overflow: auto;
    }

    .elementTree-tree-row {
        display: flex;
        flex-direction: row;
        align-items: center;
        font-size: 24px;

        .tree-icon {
            font-size: 16px;
            margin-right: 5px;
            color: #409EFF;
        }
    }
}
</style>