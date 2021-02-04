import VeeValidate from 'vee-validate';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import Vue from 'vue';
import VueLogger from 'vuejs-logger';
import App from './App';
// import authenticateFormio from './services/formio';
import router from './router';

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import Keycloak from 'keycloak-js';

Vue.config.productionTip = false;
const options = {
  isEnabled: true,
  logLevel : Vue.config.productionTip  ? 'error' : 'debug',
  stringifyArguments : false,
  showLogLevel : true,
  showMethodName : true,
  separator: '|',
  showConsoleColors: true
};
Vue.use(VueLogger, options);
Vue.use(VeeValidate);
Vue.use(BootstrapVue)
Vue.use(IconsPlugin)
/* eslint-disable no-new */

let initOptions = {
  url: process.env.VUE_APP_KEYCLOAK_URL,
  realm: process.env.VUE_APP_KEYCLOAK_REALM ,
  clientId: process.env.VUE_APP_KEYCLOAK_CLIENT_ID ,
  onLoad: 'login-required'
}


let keycloak = Keycloak(initOptions)

keycloak.init({ onLoad: initOptions.onLoad }).then((auth) =>{
    
  if(!auth) {
    window.location.reload();
  } else {
    Vue.$log.info("Authenticated");
  }

  let ANONYMOUS_ID = process.env.VUE_APP_ANONYMOUS_ID
  const roles = [ANONYMOUS_ID];

  var jwt = require('jsonwebtoken');
  const USER_RESOURCE_FORM_ID = process.env.VUE_APP_USER_RESOURCE_FORM_ID

  var token = jwt.sign(
    {
      form: {
        _id: USER_RESOURCE_FORM_ID, // form.io form Id of user resource
      },
      user: {
        _id: "anonymous", // keep it like that
        roles: roles,
      },
    },  'JWT_SECRET'
  );
  // eslint-disable-next-line no-console
  console.log(token)

  localStorage.setItem("vue-token", keycloak.token)
  localStorage.setItem("vue-refresh-token", keycloak.refreshToken)
  localStorage.setItem("formio-token", token)

  new Vue({
    router,
    render: h => h(App, {props: {keycloak: keycloak, formio_token: token}}),
  }).$mount('#app')


  setInterval(() =>{
    keycloak.updateToken(70).then((refreshed)=>{
      if (refreshed) {
        Vue.$log.debug('Token refreshed');
      } else {
        Vue.$log.warn('Token not refreshed, valid for '
        + Math.round(keycloak.tokenParsed.exp + keycloak.timeSkew - new Date().getTime() / 1000) + ' seconds');
      }
    }).catch(()=>{
        Vue.$log.error('Failed to refresh token');
    });


  }, 6000)

}).catch(() =>{
Vue.$log.error("Authenticated Failed");
});

// work based on  https://medium.com/js-dojo/authentication-made-easy-in-vue-js-with-keycloak-c03c7fff67bb
// Vue.$keycloak
//     .init({
//         onLoad: 'login-required',
//     })
//     .then((authenticated) => {
//         new Vue({
//             router,
//             render: h => h(App),
//         }).$mount('#app');
//     });

// new Vue({
//   el: '#app',
//   router,
//   template: '<App/>',
//   components: { App }
// });
