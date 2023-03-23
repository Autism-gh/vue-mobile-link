
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import './entry'
import './components'
import './directive'
// import './util/rem'

import '@/style/index.scss' // global css

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
