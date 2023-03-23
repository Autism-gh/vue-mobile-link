<template>
    <div class="leaflet-map-mobile">
        <div class="leaflet-main" ref="leaflet-ref"></div>
    </div>
</template>
<script>
    import L from './leaflet'
    export default {
        name: 'LeafletMap',
        components: {},
        props: {},
        data() {
            return {
                mapInstance: null,

                mapTitleLayer: null,
                
                waitForInit: null,

                promiseResolve: null,

                observerInstance: null,

                mapOptions: {
                    minZoom: 3,
                    maxZoom: 17,
                    zoom: 10,
                    tapTolerance: 25,
                    zoomControl: false,
                    attributionControl: false,
                    crs: L.CRS.EPSG3857,
                    detectRetina: true,
                    center: [30.266597,120.152585]
                },

                acctiveMap: 'GaoDe.Normal.Map'
            }
        },
        computed: {

        },
        methods: {
            generateMap() {
                this.mapInstance = L.map(this.$refs['leaflet-ref'] , this.mapOptions)
                this.mapTitleLayer = L.tileLayer.chinaProvider(this.acctiveMap, { 
                    maxZoom: 18, 
                    minZoom: 3,
                    tileSize: 512,
                    zoomOffset: -1,
                    detectRetina: true
                }).addTo(this.mapInstance);
                
                this.reflashMap()
                this.promiseResolve(this.mapInstance)
                this.$emit('ready', this.mapInstance)
            },


            reflashMap() {
                if(this.mapInstance) this.mapInstance.invalidateSize()
            },

            distoryMap() {
                if(this.mapInstance) this.mapInstance.remove()
            },

        },
        beforeCreate() {

        },
        created() {
            this.waitForInit = new Promise((resolve => {
                this.promiseResolve = resolve;
            }))
        },
        beforeMount() {
            
        },
        mounted() {
            this.generateMap()

            this.observerInstance = new ResizeObserver(() => this.reflashMap())
            this.observerInstance.observe(this.$refs['leaflet-ref'])
        },
        beforeDestroy() {
            if(this.observerInstance) {
                this.observerInstance.unobserve(this.$refs['leaflet-ref'])
                this.observerInstance = null
            }
            this.distoryMap()
        },
        activated() {
            this.reflashMap()
        },
    }
</script>
<style lang="scss">
@import './scss/leaflet.scss';
</style>
<style lang="scss" scoped>
.leaflet-map-mobile {
    position: relative;
    width: 100%;
    height: 100%;

    .leaflet-main {
        width: 100%;
        height: 100%;
    }
}
</style>