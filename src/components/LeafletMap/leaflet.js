import L from 'leaflet'

import 'leaflet/dist/leaflet.css'

require('./lib/Leaflet.ChineseTmsProviders')

import 'leaflet.markercluster'

import 'leaflet.markercluster/dist/MarkerCluster.Default.css'




delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default L