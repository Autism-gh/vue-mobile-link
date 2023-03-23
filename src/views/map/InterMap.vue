<template>
    <div class="inter-map">
        <LeafletMap ref="leafletmap" @ready="handleInitMap"></LeafletMap>

        <transition name="fade">
            <div class="inter-tree" v-show="treeSwitch" v-clickoutside="handleEvent">
                <ElementTree :treeData="treeData" @node-check="handleNodeChecked" @node-click="handleNodeClick">
                </ElementTree>

                <div class="inter-switch inter-right" @click="treeSwitch = false">
                    <i class="el-icon-arrow-left"></i>
                </div>
            </div>
        </transition>

        <div class="inter-switch inter-left" v-show="!treeSwitch" @click="treeSwitch = true">
            <i class="el-icon-arrow-right"></i>
        </div>

        <transition name="fadebottom">
            <ul class="inter-card" v-show="popupSwitch">
                <li class="card__header">
                    <div class="inter-card-close" @click="popupSwitch = false">
                        <i class="el-icon-arrow-down"></i>
                    </div>
                    <span>
                        <i :class="['tree-icon', formatPopupData.icon]" />
                        {{ formatPopupData.name }}
                    </span>
                    <i v-show="formatPopupData.pictureUrl" @click="pictireSwitch = !pictireSwitch" class="el-icon-picture-outline"></i>
                </li>

                <li class="card__content image-view" v-show="pictireSwitch">
                    <img :src="formatPopupData.pictureUrl">
                </li>

                <li class="card__content" v-show="!pictireSwitch">
                    <div class="card__row">
                        <div>所属分组</div>
                        <div>{{ formatPopupData.group }}</div>
                    </div>
                    <div class="card__row">
                        <div>经纬度</div>
                        <div>{{ formatPopupData.lnglat }}</div>
                    </div>
                    <div class="card__row">
                        <div>更新时间</div>
                        <div>{{ formatPopupData.update_time }}</div>
                    </div>
                    <div class="card__row" style="width: 50%">
                        <div>半径范围</div>
                        <div>{{ formatPopupData.radius_range }} 米</div>
                    </div>
                    <div class="card__row" style="width: 50%">
                        <div>显示级别</div>
                        <div>{{ formatPopupData.level_desc }}</div>
                    </div>
                    <div class="card__row">
                        <div>备注</div>
                        <div>{{ formatPopupData.remarks }}</div>
                    </div>
                    <div class="card__row">
                        <div>详细地址</div>
                        <div>{{ formatPopupData.address_details }}</div>
                    </div>
                </li>

            </ul>
        </transition>
    </div>
</template>
<script>
    import L, {
        LeafletMap,
        LeafletUtil,
        InterDictionary
    } from '@/components/LeafletMap'
    import {
        getArrayDifference,
        formatNormalTime
    } from '@/util/common'
    import ElementTree from '@/components/ElementTree/ElementTree'
    const pictureprefix = process.env.VUE_APP_UPLOAD_URL
    import {
        getTrafficTree
    } from '@/axios/intermap'

    const defaultData = {
        icon: '-',
        name: '-',
        group: '-',
        type: '-',
        lnglat: '-',
        update_time: '-',
        pictureUrl: '',
        radius_range: '-',
        level_desc: '-',
        remarks: '-',
        region: '-',
        address_details: '-'
    }

    export default {
        name: 'InterMap',
        components: {
            LeafletMap,
            ElementTree
        },
        props: {},
        data() {
            return {
                checkedList: [],

                treeData: [],


                layerSourceData: {},


                featureGroup: null,

                interPopupData: {},

                fencePopupData: {},

                temporaryLayerId: '',

                treeSwitch: false,

                popupSwitch: false,

                pictireSwitch: false
            }
        },

        computed: {
            formatPopupData() {
                return Object.assign(defaultData, this.interPopupData)
            },

            mapInstance() {
                return this.$refs['leafletmap'].mapInstance
            },
        },

        methods: {
            async initInterAndAreaTree() {
                const result = await getTrafficTree({})

                if (result?.data?.length) {
                    const formatdata = result.data.map(item => {
                        const {
                            name,
                            icon,
                            type,
                            virtual_id,
                            parent_id,
                            extend,
                            child_count
                        } = item

                        let iconClass
                        const obj = {
                            id: virtual_id,
                            parent: parent_id,
                            level: type,
                            type,
                            extend
                        }

                        if (type === 'poi' || type === 'area') {
                            const {
                                icon: poicon,
                                category
                            } = extend
                            Object.assign(obj, {
                                name: name
                            })
                            iconClass = category || (poicon ? poicon.slice(29, -4) : type)
                        } else {
                            Object.assign(obj, {
                                name: `${name} [ ${child_count} ]`
                            })
                            iconClass = icon ? icon?.slice(29, -4) : type
                        }

                        return Object.assign(obj, {
                            icon: iconClass
                        })
                    })

                    this.treeData = formatdata
                }
            },


            handleNodeClick(data, node) {
                const {
                    id,
                    type
                } = data
                const {
                    checked
                } = node
                if (type === 'area' || type === 'poi') {
                    if (!checked) {
                        this.clearTimeLayer()
                        const activeLayer = this.layerSourceData[id]
                        if (activeLayer) {
                            const {
                                display_level
                            } = data?.extend
                            if (type === 'poi') {
                                activeLayer && this.mapInstance.setView(activeLayer.getLatLng(), display_level)
                            }
                            if (type === 'area') {
                                activeLayer && this.mapInstance.fitBounds(activeLayer.getBounds())
                            }
                        } else {
                            this.generateCurrentLayer(data, true)
                            this.temporaryLayerId = id
                        }
                    }
                    if (type === 'poi') {
                        this.setMarkerCurrentView(data)
                    }
                    if (type === 'area') {
                        this.setRangeCurrentView(data)
                    }
                }
            },

            

            handleNodeChecked(data, node) {
                const {
                    checkedNodes
                } = node
                if (!checkedNodes.length) {
                    this.cleanLayerUp()
                    return
                }
                const handleList = checkedNodes.filter(item => ['poi', 'area'].includes(item.type))
                const formatIds = handleList.map(item => item.id)
                const different = getArrayDifference(formatIds, this.checkedList)
                const formatList = handleList.filter(item => different.includes(item.id))

                formatList.forEach(item => {
                    const {
                        id
                    } = item
                    const activeLayer = this.layerSourceData[id]
                    if (formatIds.includes(id)) {
                        if (activeLayer) {
                            this.featureGroup.addLayer(activeLayer)
                        } else {
                            const newComeLayer = this.generateCurrentLayer(item, false)
                            this.featureGroup.addLayer(newComeLayer)
                        }
                    } else {
                        activeLayer && this.featureGroup.removeLayer(activeLayer)
                    }
                })

                if (formatList?.length === 1) {
                    const active = formatList[0]
                    const {
                        type
                    } = active
                    if (type === 'poi') {
                        this.setMarkerCurrentView(active)
                    }
                    if (type === 'area') {
                        this.setRangeCurrentView(active)
                    }
                }

                this.checkedList = [...formatIds]
            },

            setMarkerCurrentView(data) {
                const {
                    id,
                    extend: {
                        display_level
                    }
                } = data
                const activeMarkr = this.layerSourceData[id]

                if (activeMarkr) {
                    this.mapInstance.setView(activeMarkr.getLatLng(), display_level)
                    this.interPopupData = this.formatInterPopupData(data)
                    this.$nextTick(() => {
                        this.popupSwitch = true
                    })
                }
            },

            setRangeCurrentView(data) {
                const {
                    id
                } = data
                const activeMarkr = this.layerSourceData[id]

                if (activeMarkr) {
                    this.mapInstance.fitBounds(activeMarkr.getBounds())
                    // console.log('Range popup data', data)
                    // this.fencePopupData = JSON.parse(JSON.stringify(data))
                    // this.$nextTick(() => {
                    //     this.popupSwitch = true
                    // })
                }
            },

            generateCurrentLayer(obj, timeRange) {
                if (!obj) return
                const {
                    type,
                    id,
                    extend: {
                        display_level
                    }
                } = obj
                let layer
                if (type === 'area') {
                    layer = this.generateRangeLayer(obj, timeRange)
                }
                if (type === 'poi') {
                    layer = this.generateInterestMarker(obj, timeRange)
                }
                this.layerSourceData[id] = layer

                if (timeRange) {
                    layer.addTo(this.mapInstance)
                    if (type === 'area') {
                        this.mapInstance.fitBounds(layer.getBounds())
                    }
                    if (type === 'poi') {
                        this.mapInstance.setView(layer.getLatLng(), display_level)
                    }
                }
                return layer
            },

            generateInterestMarker(obj, timeChange) {
                const {
                    extend: {
                        lng_lat
                    },
                    icon,
                    name
                } = obj
                let marker = null

                if (lng_lat && lng_lat.length) {
                    const content = `<div class="leaflet-inter-map-tooltip">${name}</div>`

                    const iconUrl = InterDictionary[icon]?.icon

                    const formatIcon = L.icon({
                        iconUrl,
                        iconSize: [30, 45],
                        iconAnchor: [15, 15]
                    })
                    marker = new L.Marker([lng_lat[1], lng_lat[0]], {
                        icon: formatIcon,
                        zIndexOffset: 1000
                    }).bindTooltip(content, {
                        permanent: true,
                        offset: [0, 20],
                        direction: 'bottom'
                    }).openTooltip()

                    marker.bind_data = obj
                    marker.temporary = timeChange

                    marker.on('click', (e) => {
                        this.clearTimeLayer()
                        this.setMarkerCurrentView(e.target.bind_data)
                    })
                }
                return marker
            },

            generateRangeLayer(obj, timeChange) {
                const {
                    name,

                    extend: {
                        geometry
                    }
                } = obj

                let layer = null

                if (geometry) {
                    layer = LeafletUtil.drawMapLayer(geometry, 'lnglat')

                    if (layer) {
                        const content = `<div class="leaflet-inter-map-tooltip">${name}</div>`
                            layer.bindTooltip(content, {
                            offset: [0, 25],
                            direction: 'bottom'
                        }).openTooltip()

                        layer.bind_data = obj
                        layer.temporary = timeChange

                        layer.on('click', (e) => {
                            this.clearTimeLayer()
                            this.setRangeCurrentView(e.target.bind_data)
                        })
                    }
                }

                return layer
            },

            clearTimeLayer(layer) {
                if (this.temporaryLayerId) {
                    const removeLayer = this.layerSourceData[this.temporaryLayerId]
                    removeLayer && removeLayer.remove()
                    this.layerSourceData[this.temporaryLayerId] = null
                    this.temporaryLayerId = null
                }
                this.popupSwitch = false
            },

            formatInterPopupData(data) {
                const {
                    id,
                    name,
                    extend,
                    node_parent_name,
                    icon,
                    extend: {
                        UpdatedAt,
                        display_level,
                        lng_lat,
                        remarks,
                        picture: {
                            path
                        }
                    }
                } = data
                const result = {}
                const userKey = ['group', 'id', 'radius_range', 'parent', 'display_level', 'address_details', 'region',
                    'remarks'
                ]
                const parentName = node_parent_name ? node_parent_name.split('(')[0] : '-'
                userKey.forEach(item => {
                    result[item] = extend[item]
                })

                Object.assign(result, {
                    id,
                    name: name,
                    group: parentName.split(' [ ')[0],
                    icon: icon,
                    type: InterDictionary[icon]?.name,
                    lnglat: lng_lat.join(','),
                    update_time: formatNormalTime(UpdatedAt),
                    level_desc: LeafletUtil.trandLevelDesc(display_level),
                    pictureUrl: path ? `${pictureprefix}${path}` : '',
                    remarks
                })
                
                return result
            },

            handleInitMap(map) {
                this.featureGroup = new L.FeatureGroup().addTo(map)
            },

            cleanLayerUp() {
                this.layerSourceData = {}
                this.checkedList = []

                if (this.featureGroup) {
                    this.featureGroup.clearLayers()
                }

                this.popupSwitch = false
            },
            
            handleEvent() {
                if(!this.treeSwitch) return
                this.treeSwitch = false
            }
        },

        beforeCreate() {

        },

        created() {

        },

        beforeMount() {

        },

        mounted() {
            this.initInterAndAreaTree()
        },

        beforeDestroy() {

        },
    }
</script>
<style lang="scss" scoped>
    $padding: 15px;

    .fade-enter-active {
        animation: fadeInLeft;
        animation-duration: 0.5s;
    }

    .fade-leave-active {
        animation: fadeOutLeft;
        animation-duration: 0.5s;
    }

    .fadebottom-enter-active {
        animation: fadeInUp;
        animation-duration: 0.5s;
    }

    .fadebottom-leave-active {
        animation: fadeOutDown;
        animation-duration: 0.5s;
    }

    .inter-map {
        position: relative;
        width: 100%;
        height: 100%;


        .inter-card {
            position: absolute;
            background-color: #FFFFFF;
            border-radius: 4px;
            z-index: 1000;
            width: calc(100% - 30px);
            height: max-content;
            box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
            left: $padding;
            bottom: $padding;
        }


        .inter-switch {
            position: absolute;
            width: 24px;
            height: 150px;
            z-index: 1000;
            top: calc((100% - 150px) / 2);
            background-color: #FFFFFF;
            box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
            display: flex;
            align-items: center;
            animation: fadeIn;
            animation-duration: 1s;
            font-size: 16px;


            &.inter-left {
                border-top-right-radius: 4px;
                border-bottom-right-radius: 4px;
                left: 0;
            }

            &.inter-right {
                position: absolute;
                right: 0;
            }
        }



        .inter-tree {
            position: absolute;
            top: 20%;
            left: 0;
            height: 60%;
            width: 70%;
            background-color: #FFFFFF;
            box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
            border-top-right-radius: 4px;
            border-bottom-right-radius: 4px;
            z-index: 1500;
        }





        .card__header {
            position: relative;
            height: 70px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 $padding;
            background-color: rgba(0, 0, 0, 0.03);
            font-size: 26px;

            .inter-card-close {
                position: absolute;
                top: -4px;
                width: 150px;
                left: calc((100% - 150px) / 2);
                height: 24px;
                background-color: rgba(25, 172, 158, 0.05);
                border-top: solid 4px rgb(25, 172, 158);
                font-size: 20px;
                border-bottom-left-radius: 10px;
                border-bottom-right-radius: 10px;
            }

            .tree-icon {
                margin-right: $padding;
            }
        }

        .card__content {
            display: flex;
            flex-wrap: wrap;
            padding: 0 $padding;

            &.image-view {
                justify-content: center;
                align-items: center;

                img {
                    max-height: 250px;
                }
            }

            .card__row {
                width: 100%;
                display: flex;
                flex-direction: row;
                line-height: 50px;
                font-size: 20px;

                div {
                    &:first-child {
                        margin-right: 20px;
                        width: 120px;
                        text-align: right;
                    }

                    &:last-child {
                        display: flex;
                        justify-content: flex-start;
                        flex: 1;
                        text-align: left;
                    }
                }
            }
        }

        .card__fotter {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            padding-left: $padding;
            line-height: 50px;
        }

    }
</style>