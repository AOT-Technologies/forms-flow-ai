import SuiVue from 'semantic-ui-vue';
import VeeValidate from 'vee-validate';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import Vue from 'vue';
import App from './App';
import router from './router';

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.config.productionTip = false;
Vue.use(SuiVue);
Vue.use(VeeValidate);
Vue.use(BootstrapVue)
Vue.use(IconsPlugin)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
});
