import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify';
import VueResource from "vue-resource";

Vue.use(VueResource);

Vue.config.productionTip = false

//Vue.prototype.$remoteServer = 'http://192.168.1.156/';
Vue.prototype.$remoteServer = '';

new Vue({
  router,
  vuetify,
  render: h => h(App),
  data: {
    // En desarollo poner la direccion asignada al equipo. Para produccion dejar en blanco
    //$remoteServer: 'http://192.168.1.156/'
  }
}).$mount('#app')
