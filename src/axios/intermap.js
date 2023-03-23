import { apiService, post } from './customaxios'

// 交通枢纽区位地图
export const getTrafficTree = post('/api/device/traffic/tree', { api: apiService })